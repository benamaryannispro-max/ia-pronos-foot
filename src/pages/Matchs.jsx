import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { RefreshCw, Settings, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchCard from "@/components/MatchCard";
import LeagueFilter from "@/components/LeagueFilter";
import LoadMatchesButton from "@/components/LoadMatchesButton";
import AnalysisDialog from "@/components/AnalysisDialog";
import UpdateResultDialog from "@/components/UpdateResultDialog";
import LiveMatchCard from "@/components/LiveMatchCard";
import LiveAnalysisDialog from "@/components/LiveAnalysisDialog";
import UpdateLogosButton from "@/components/UpdateLogosButton";
import SubscriptionGate from "@/components/SubscriptionGate";
import PredictionSuccessAnimation from "@/components/PredictionSuccessAnimation";

export default function Matchs() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [analyzingMatchId, setAnalyzingMatchId] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [refreshingLiveId, setRefreshingLiveId] = useState(null);
  const [selectedLiveMatch, setSelectedLiveMatch] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successPrediction, setSuccessPrediction] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user.email,
        status: "active"
      });
      return subs[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  const isPremium = subscription && subscription.plan !== "free";

  const { data: matches = [], isLoading, isError, error } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      try {
        return await base44.entities.Match.list("-match_date", 100);
      } catch (err) {
        console.error("Erreur chargement matchs:", err);
        const cached = localStorage.getItem('cached_matches');
        if (cached) {
          return JSON.parse(cached);
        }
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 2
  });

  useEffect(() => {
    if (matches.length > 0) {
      localStorage.setItem('cached_matches', JSON.stringify(matches));
    }
  }, [matches]);

  useEffect(() => {
    const unsubscribe = base44.entities.Match.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    });
    return unsubscribe;
  }, [queryClient]);

  const { data: history = [] } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      try {
        return await base44.entities.PredictionHistory.list("-created_date", 200);
      } catch (err) {
        console.error("Erreur chargement historique:", err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2
  });

  const updateMatchMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Match.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      setEditingMatch(null);
    }
  });

  const createHistoryMutation = useMutation({
    mutationFn: (data) => base44.entities.PredictionHistory.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] })
  });

  const analyzeMatch = async (match) => {
    setAnalyzingMatchId(match.id);
    
    try {
      const recentHistory = history.filter(h => h.result !== "pending").slice(0, 20);
      const historyContext = recentHistory.length > 0 
        ? `\n\nHistorique récent:\n${recentHistory.map(h => 
            `- ${h.home_team} vs ${h.away_team}: ${h.prediction}, ${h.result}`
          ).join('\n')}`
        : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un expert en analyse de matchs de football avec accès à des données en temps réel.

MATCH À ANALYSER:
${match.home_team} vs ${match.away_team}
${match.league} - ${match.match_date}

ANALYSE APPROFONDIE REQUISE:

1. STATISTIQUES DÉTAILLÉES:
   - Forme récente (10 derniers matchs) avec contexte domicile/extérieur
   - Buts marqués/encaissés sur les 5 derniers matchs
   - Possession moyenne, tirs cadrés, corners
   - Performance face à des équipes similaires

2. CONFRONTATIONS DIRECTES:
   - 5 dernières rencontres
   - Tendances historiques
   - Résultats domicile vs extérieur

3. COMPOSITION & BLESSURES:
   - Joueurs clés absents (blessures, suspensions)
   - Impact de ces absences
   - Top 3 buteurs de chaque équipe avec stats de la saison

4. COTES BOOKMAKERS (Winamax, Betclic, Parions Sport):
   - 1X2, Over/Under 2.5, BTTS
   - Identifier les value bets

5. CONTEXTE SPORTIF:
   - Position au classement
   - Motivation (course au titre, maintien, coupe)
   - Calendrier chargé, rotation

6. ANALYSE MI-TEMPS:
   - Tendance mi-temps récente
   - Probabilité de marquer en 1ère mi-temps

7. SCORES EXACTS PROBABLES:
   - Top 3 scores les plus probables avec pourcentages
${historyContext}

IMPORTANT: Base ton analyse sur des données factuelles récentes uniquement.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            prediction: {
              type: "string",
              enum: ["home_win", "draw", "away_win", "over_2.5", "under_2.5", "btts_yes", "btts_no"]
            },
            confidence: { 
              type: "number",
              description: "Entre 50 et 95"
            },
            analysis: { type: "string" },
            key_injuries: { type: "string" },
            top_scorers_home: { type: "string" },
            top_scorers_away: { type: "string" },
            team_form: { type: "string" },
            head_to_head: { type: "string" },
            tactical_insights: { type: "string" },
            halftime_prediction: {
              type: "string",
              enum: ["home_win_ht", "draw_ht", "away_win_ht"]
            },
            halftime_confidence: { type: "number" },
            exact_score_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  score: { type: "string" },
                  probability: { type: "number" }
                }
              }
            },
            goals_home_expected: { type: "number" },
            goals_away_expected: { type: "number" },
            possession_expected: {
              type: "object",
              properties: {
                home: { type: "number" },
                away: { type: "number" }
              }
            },
            odds_winamax: {
              type: "object",
              properties: {
                home: { type: "number" },
                draw: { type: "number" },
                away: { type: "number" }
              }
            },
            odds_betclic: {
              type: "object",
              properties: {
                home: { type: "number" },
                draw: { type: "number" },
                away: { type: "number" }
              }
            },
            odds_parionssport: {
              type: "object",
              properties: {
                home: { type: "number" },
                draw: { type: "number" },
                away: { type: "number" }
              }
            }
          },
          required: ["prediction", "confidence", "analysis"]
        }
      });

      const analysisDetails = {
        analysis: result.analysis,
        injuries: result.key_injuries,
        scorers_home: result.top_scorers_home,
        scorers_away: result.top_scorers_away,
        form: result.team_form,
        head_to_head: result.head_to_head,
        tactical: result.tactical_insights
      };

      const secondaryPredictions = [];
      
      if (result.halftime_prediction && result.halftime_confidence) {
        secondaryPredictions.push({
          type: "halftime",
          prediction: result.halftime_prediction,
          confidence: result.halftime_confidence
        });
      }

      if (result.exact_score_predictions && result.exact_score_predictions.length > 0) {
        result.exact_score_predictions.slice(0, 3).forEach(esp => {
          secondaryPredictions.push({
            type: "exact_score",
            prediction: esp.score,
            confidence: Math.round(esp.probability)
          });
        });
      }

      const advancedAnalysis = {
        goals_home_expected: result.goals_home_expected,
        goals_away_expected: result.goals_away_expected,
        possession_expected: result.possession_expected,
        exact_scores: result.exact_score_predictions
      };

      await updateMatchMutation.mutateAsync({
        id: match.id,
        data: {
          prediction: result.prediction,
          confidence: Math.min(95, Math.max(50, result.confidence)),
          analysis: JSON.stringify(analysisDetails),
          secondary_predictions: secondaryPredictions,
          advanced_analysis: advancedAnalysis,
          odds_winamax: result.odds_winamax,
          odds_betclic: result.odds_betclic,
          odds_parionssport: result.odds_parionssport,
          half_time_score: null
        }
      });

      await createHistoryMutation.mutateAsync({
        match_id: match.id,
        home_team: match.home_team,
        away_team: match.away_team,
        league: match.league,
        match_date: match.match_date,
        prediction: result.prediction,
        confidence: result.confidence,
        result: "pending"
      });

      await base44.entities.Notification.create({
        user_email: user.email,
        type: "new_prediction",
        title: match.is_vip ? "👑 Prono VIP disponible !" : "⚽ Nouveau prono disponible !",
        message: `${match.home_team} vs ${match.away_team}`,
        match_id: match.id,
        priority: match.is_vip ? "high" : "medium"
      });

      // Show success animation
      setSuccessPrediction({
        prediction: result.prediction,
        confidence: Math.min(95, Math.max(50, result.confidence))
      });
      setShowSuccessAnimation(true);

    } catch (error) {
      console.error("Erreur analyse:", error);
    } finally {
      setAnalyzingMatchId(null);
    }
  };

  const handleUpdateResult = async (matchId, data) => {
    await updateMatchMutation.mutateAsync({ id: matchId, data });
    
    const historyEntry = history.find(h => h.match_id === matchId);
    if (historyEntry) {
      await base44.entities.PredictionHistory.update(historyEntry.id, {
        final_score: data.final_score,
        result: data.result
      });
      queryClient.invalidateQueries({ queryKey: ["history"] });

      await base44.functions.invoke('updateUserStats', { predictionResult: data.result });

      const match = matches.find(m => m.id === matchId);
      if (match) {
        await base44.entities.Notification.create({
          user_email: user.email,
          type: "prediction_result",
          title: data.result === "win" ? "🎯 Prono gagné !" : "Prono perdu",
          message: `${match.home_team} vs ${match.away_team} - ${data.final_score}`,
          priority: data.result === "win" ? "high" : "medium"
        });
      }
    }
  };

  const refreshLiveMatch = async (match) => {
    setRefreshingLiveId(match.id);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `ANALYSE LIVE TEMPS RÉEL:

Match: ${match.home_team} vs ${match.away_team}
Score actuel: ${match.live_score || "0-0"}
Minute: ${match.live_minute || 0}'
Prono initial: ${match.prediction} (${match.confidence}%)

RECHERCHE DONNÉES EN DIRECT:
1. Score exact et minute de jeu
2. Événements récents (buts, cartons, remplacements)
3. Statistiques live (possession, tirs, corners)
4. Momentum et tendance du match
5. Cotes live actualisées

PRONOSTICS DYNAMIQUES:
- Probabilité de but suivant (quelle équipe ?)
- Score final probable ajusté
- Prédiction pour les 15 prochaines minutes
- Ajustement du pronostic initial

Fournis une analyse concise mais précise basée sur les données actuelles.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            live_score: { type: "string" },
            live_minute: { type: "number" },
            recent_events: { type: "array", items: { type: "object" } },
            summary: { type: "string" },
            momentum: { type: "string" },
            next_goal_team: { type: "string" },
            final_score_prediction: { type: "string" },
            live_stats: {
              type: "object",
              properties: {
                possession_home: { type: "number" },
                possession_away: { type: "number" },
                shots_home: { type: "number" },
                shots_away: { type: "number" }
              }
            },
            adjusted_prediction: { type: "string" },
            adjusted_confidence: { type: "number" }
          }
        }
      });

      const liveAnalysisData = {
        summary: result.summary,
        momentum: result.momentum,
        next_goal: result.next_goal_team,
        final_prediction: result.final_score_prediction,
        stats: result.live_stats
      };

      const livePredictions = {
        adjusted_prediction: result.adjusted_prediction,
        adjusted_confidence: result.adjusted_confidence,
        next_goal_team: result.next_goal_team,
        final_score_prediction: result.final_score_prediction
      };

      await updateMatchMutation.mutateAsync({
        id: match.id,
        data: {
          live_score: result.live_score || match.live_score,
          live_minute: result.live_minute || match.live_minute,
          live_events: result.recent_events || [],
          live_analysis: JSON.stringify(liveAnalysisData),
          live_predictions: livePredictions,
          live_updated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error("Erreur live:", error);
    } finally {
      setRefreshingLiveId(null);
    }
  };

  const liveMatches = matches.filter(m => m.status === "live");
  
  let filteredMatches = matches.filter(match => {
    if (match.status === "live") return false;
    
    if (match.is_vip && !isPremium) return false;
    
    const statusMatch = activeTab === "all" 
      || (activeTab === "upcoming" && (match.status === "upcoming" || !match.status))
      || (activeTab === "finished" && match.status === "finished")
      || (activeTab === "analyzed" && match.prediction);
    
    const leagueMatch = selectedLeague === "all" || match.league === selectedLeague;
    
    return statusMatch && leagueMatch;
  });

  if (!isPremium && activeTab === "upcoming") {
    filteredMatches = filteredMatches.slice(0, 3);
  }

  const historyStats = {
    total: history.filter(h => h.result !== "pending").length,
    wins: history.filter(h => h.result === "win").length,
    winRate: history.filter(h => h.result !== "pending").length > 0
      ? Math.round((history.filter(h => h.result === "win").length / history.filter(h => h.result !== "pending").length) * 100)
      : 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Taux de réussite global */}
      {historyStats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/50">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-2xl font-bold text-emerald-400">{historyStats.winRate}%</span>
              <span className="text-slate-300 text-sm ml-2">de réussite</span>
            </div>
            <span className="text-xs text-slate-400">({historyStats.wins}/{historyStats.total})</span>
          </div>
        </motion.div>
      )}

      {/* Admin Controls */}
      {user?.role === 'admin' && (
        <div className="flex gap-3 mb-6">
          <LoadMatchesButton
            existingMatches={matches}
            onMatchesLoaded={() => queryClient.invalidateQueries({ queryKey: ["matches"] })}
          />
          <UpdateLogosButton
            matches={matches}
            onComplete={() => queryClient.invalidateQueries({ queryKey: ["matches"] })}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/30 border border-slate-700/30 p-1 w-full">
            <TabsTrigger value="upcoming" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">À venir</TabsTrigger>
            <TabsTrigger value="analyzed" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Analysés</TabsTrigger>
            <TabsTrigger value="finished" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Terminés</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-5">
          <LeagueFilter onLeagueChange={setSelectedLeague} selectedLeague={selectedLeague} />
        </div>
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 border-2 border-red-500/50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold text-red-400 text-base">EN DIRECT</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveMatches.map((match) => (
              <LiveMatchCard
                key={match.id}
                match={match}
                onRefreshLive={refreshLiveMatch}
                isRefreshing={refreshingLiveId === match.id}
                onViewDetails={(m) => setSelectedLiveMatch(m)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Matches Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      ) : isError ? (
        <div className="text-center py-20">
          <p className="text-red-400 text-lg mb-2">Erreur de chargement</p>
          <p className="text-slate-500 text-sm mb-4">{error?.message || "Impossible de charger les matchs"}</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["matches"] })} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg mb-6">Aucun match</p>
          {user?.role === 'admin' && (
            <LoadMatchesButton 
              existingMatches={matches}
              onMatchesLoaded={() => queryClient.invalidateQueries({ queryKey: ["matches"] })}
            />
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="relative"
              >
                <MatchCard
                  match={match}
                  onAnalyze={analyzeMatch}
                  isAnalyzing={analyzingMatchId === match.id}
                  onViewDetails={(m) => setSelectedMatch(m)}
                />
                {match.prediction && match.result === "pending" && user?.role === 'admin' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingMatch(match)}
                    className="absolute top-3 left-3 text-slate-400 hover:text-white p-1.5 h-auto"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {!isPremium && activeTab === "upcoming" && matches.filter(m => m.status === "upcoming" || !m.status).length > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <SubscriptionGate 
                isPremium={false}
                feature="tous les matchs"
              >
                <div className="h-40" />
              </SubscriptionGate>
            </motion.div>
          )}
        </>
      )}

      {/* Dialogs */}
      <AnalysisDialog
        match={selectedMatch}
        open={!!selectedMatch}
        onOpenChange={(open) => !open && setSelectedMatch(null)}
        historyStats={historyStats}
      />

      <UpdateResultDialog
        match={editingMatch}
        open={!!editingMatch}
        onOpenChange={(open) => !open && setEditingMatch(null)}
        onUpdate={handleUpdateResult}
        isLoading={updateMatchMutation.isPending}
      />

      <LiveAnalysisDialog
        match={selectedLiveMatch}
        open={!!selectedLiveMatch}
        onOpenChange={(open) => !open && setSelectedLiveMatch(null)}
      />

      <PredictionSuccessAnimation
        show={showSuccessAnimation}
        onComplete={() => {
          setShowSuccessAnimation(false);
          setSuccessPrediction(null);
        }}
        prediction={successPrediction?.prediction}
        confidence={successPrediction?.confidence}
      />
    </div>
  );
}