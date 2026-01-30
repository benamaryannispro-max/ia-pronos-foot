import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Zap, Sparkles, RefreshCw, Settings, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import MatchCard from "@/components/MatchCard";
import LeagueFilter from "@/components/LeagueFilter";
import LoadMatchesButton from "@/components/LoadMatchesButton";
import HistoryStats from "@/components/HistoryStats";
import AnalysisDialog from "@/components/AnalysisDialog";
import UpdateResultDialog from "@/components/UpdateResultDialog";
import LiveMatchCard from "@/components/LiveMatchCard";
import LiveAnalysisDialog from "@/components/LiveAnalysisDialog";
import UpdateLogosButton from "@/components/UpdateLogosButton";
import PremiumBadge from "@/components/PremiumBadge";
import SubscriptionGate from "@/components/SubscriptionGate";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [analyzingMatchId, setAnalyzingMatchId] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [refreshingLiveId, setRefreshingLiveId] = useState(null);
  const [selectedLiveMatch, setSelectedLiveMatch] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
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
    enabled: !!user?.email
  });

  const isPremium = subscription && subscription.plan !== "free";

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: () => base44.entities.Match.list("-match_date", 100)
  });

  const { data: history = [] } = useQuery({
    queryKey: ["history"],
    queryFn: () => base44.entities.PredictionHistory.list("-created_date", 200)
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
      // Construire le contexte historique
      const recentHistory = history.filter(h => h.result !== "pending").slice(0, 20);
      const historyContext = recentHistory.length > 0 
        ? `\n\nHistorique de nos derniers pronostics pour améliorer la précision:\n${recentHistory.map(h => 
            `- ${h.home_team} vs ${h.away_team}: prédit ${h.prediction}, résultat ${h.result}`
          ).join('\n')}`
        : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un expert en analyse de paris sportifs football. Fais une analyse ULTRA-DÉTAILLÉE de ce match:

🏟️ MATCH: ${match.home_team} vs ${match.away_team}
🏆 COMPÉTITION: ${match.league}
📅 DATE: ${match.match_date}

📊 RECHERCHE COMPLÈTE REQUISE:

1️⃣ COTES BOOKMAKERS (essentielles):
- Winamax: cotes 1N2
- Betclic: cotes 1N2
- Parions Sport (FDJ): cotes 1N2

2️⃣ EFFECTIFS & COMPOSITIONS PROBABLES:
- Composition probable de ${match.home_team}
- Composition probable de ${match.away_team}
- Joueurs BLESSÉS ou SUSPENDUS pour les deux équipes
- Retours de blessures importants
- Absences clés qui pourraient impacter le match

3️⃣ MEILLEURS BUTEURS & STATISTIQUES INDIVIDUELLES:
- Top 3 buteurs de ${match.home_team} cette saison (nombre de buts)
- Top 3 buteurs de ${match.away_team} cette saison (nombre de buts)
- Leur forme récente (buts sur les 5 derniers matchs)
- Passeurs décisifs clés

4️⃣ FORME DES ÉQUIPES:
- ${match.home_team}: 5 derniers matchs (V/N/D), buts marqués/encaissés
- ${match.away_team}: 5 derniers matchs (V/N/D), buts marqués/encaissés
- Série en cours (victoires consécutives, matchs sans défaite, etc.)
- Momentum actuel de chaque équipe

5️⃣ CONFRONTATIONS DIRECTES:
- Résultats des 5 dernières confrontations
- Bilan historique global
- Statistiques lors des matchs à domicile pour ${match.home_team}

6️⃣ STATISTIQUES AVANCÉES:
- Performance à domicile de ${match.home_team}
- Performance à l'extérieur de ${match.away_team}
- Moyenne de buts par match
- Clean sheets
- Both Teams To Score (statistiques)

7️⃣ CONTEXTE & ENJEUX:
- Position au classement des deux équipes
- Enjeux du match (course au titre, Europe, maintien)
- Motivation respective
- Calendrier récent et fatigue potentielle
${historyContext}

💡 SYNTHÈSE: Fournis une analyse détaillée en 5-6 phrases qui couvre tous ces aspects, puis donne ton pronostic avec confiance réaliste (55-85%).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            prediction: {
              type: "string",
              enum: ["home_win", "draw", "away_win", "over_2.5", "under_2.5", "btts_yes", "btts_no"],
              description: "Le pronostic principal"
            },
            confidence: {
              type: "number",
              description: "Niveau de confiance entre 55 et 85"
            },
            analysis: {
              type: "string",
              description: "Analyse complète incluant: effectifs/blessures, forme des équipes, buteurs clés, confrontations directes, stats domicile/extérieur, et justification détaillée du pronostic (5-6 phrases minimum)"
            },
            key_injuries: {
              type: "string",
              description: "Liste des blessés/suspendus importants des deux équipes"
            },
            top_scorers_home: {
              type: "string",
              description: "Top 3 buteurs équipe domicile avec nombre de buts"
            },
            top_scorers_away: {
              type: "string",
              description: "Top 3 buteurs équipe extérieur avec nombre de buts"
            },
            team_form: {
              type: "string",
              description: "Forme des 2 équipes sur 5 derniers matchs (ex: VVNDV)"
            },
            odds_winamax: {
              type: "object",
              properties: {
                home: { type: "number" },
                draw: { type: "number" },
                away: { type: "number" },
                recommended: { type: "number", description: "La cote correspondant au pronostic" }
              }
            },
            odds_betclic: {
              type: "object",
              properties: {
                home: { type: "number" },
                draw: { type: "number" },
                away: { type: "number" },
                recommended: { type: "number", description: "La cote correspondant au pronostic" }
              }
            },
            odds_parionssport: {
              type: "object",
              properties: {
                home: { type: "number" },
                draw: { type: "number" },
                away: { type: "number" },
                recommended: { type: "number", description: "La cote correspondant au pronostic" }
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
        form: result.team_form
      };

      await updateMatchMutation.mutateAsync({
        id: match.id,
        data: {
          prediction: result.prediction,
          confidence: Math.min(85, Math.max(55, result.confidence)),
          analysis: JSON.stringify(analysisDetails),
          odds_winamax: result.odds_winamax,
          odds_betclic: result.odds_betclic,
          odds_parionssport: result.odds_parionssport
        }
      });

      // Sauvegarder dans l'historique
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

    } catch (error) {
      console.error("Erreur analyse:", error);
    } finally {
      setAnalyzingMatchId(null);
    }
  };

  const handleUpdateResult = async (matchId, data) => {
    await updateMatchMutation.mutateAsync({ id: matchId, data });
    
    // Mettre à jour l'historique correspondant
    const historyEntry = history.find(h => h.match_id === matchId);
    if (historyEntry) {
      await base44.entities.PredictionHistory.update(historyEntry.id, {
        final_score: data.final_score,
        result: data.result
      });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    }
  };

  // Fonction pour mettre à jour automatiquement les résultats
  const autoUpdateResults = async () => {
    const now = new Date();
    
    // Trouver les matchs qui devraient être terminés (> 2h après l'heure du match)
    const matchesToCheck = matches.filter(match => {
      if (match.status === "finished" || !match.prediction) return false;
      
      const matchDate = new Date(match.match_date);
      const twoHoursAfterMatch = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);
      
      return now > twoHoursAfterMatch;
    });

    for (const match of matchesToCheck) {
      try {
        // Récupérer le résultat via l'IA
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Récupère le score final du match de football suivant:
          
${match.home_team} vs ${match.away_team}
Date: ${match.match_date}
Compétition: ${match.league}

Je cherche uniquement le score final officiel du match.
Si le match n'a pas encore eu lieu ou n'est pas terminé, retourne "not_finished".`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["finished", "not_finished"],
                description: "Statut du match"
              },
              home_score: {
                type: "number",
                description: "Buts de l'équipe à domicile"
              },
              away_score: {
                type: "number",
                description: "Buts de l'équipe à l'extérieur"
              }
            },
            required: ["status"]
          }
        });

        if (result.status === "finished" && result.home_score !== undefined && result.away_score !== undefined) {
          const finalScore = `${result.home_score}_${result.away_score}`;
          
          // Déterminer le résultat du pronostic
          let matchResult = "loss";
          
          if (match.prediction === "home_win" && result.home_score > result.away_score) {
            matchResult = "win";
          } else if (match.prediction === "away_win" && result.away_score > result.home_score) {
            matchResult = "win";
          } else if (match.prediction === "draw" && result.home_score === result.away_score) {
            matchResult = "win";
          } else if (match.prediction === "over_2.5" && (result.home_score + result.away_score) > 2.5) {
            matchResult = "win";
          } else if (match.prediction === "under_2.5" && (result.home_score + result.away_score) < 2.5) {
            matchResult = "win";
          } else if (match.prediction === "btts_yes" && result.home_score > 0 && result.away_score > 0) {
            matchResult = "win";
          } else if (match.prediction === "btts_no" && (result.home_score === 0 || result.away_score === 0)) {
            matchResult = "win";
          }

          // Mettre à jour le match
          await base44.entities.Match.update(match.id, {
            status: "finished",
            final_score: finalScore,
            result: matchResult
          });

          // Mettre à jour l'historique
          const historyEntry = history.find(h => h.match_id === match.id);
          if (historyEntry) {
            await base44.entities.PredictionHistory.update(historyEntry.id, {
              final_score: finalScore,
              result: matchResult
            });
          }
        }
      } catch (error) {
        console.error(`Erreur mise à jour auto pour ${match.home_team} vs ${match.away_team}:`, error);
      }
    }

    // Rafraîchir les données
    if (matchesToCheck.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    }
  };

  // Vérifier automatiquement toutes les 5 minutes
  useEffect(() => {
    autoUpdateResults(); // Vérification au chargement
    
    const interval = setInterval(() => {
      autoUpdateResults();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [matches, history]);

  const refreshLiveMatch = async (match) => {
    setRefreshingLiveId(match.id);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `ANALYSE EN DIRECT - Match de football en cours:

🏟️ ${match.home_team} vs ${match.away_team}
📊 Score actuel: ${match.live_score || "0 - 0"}
⏱️ Minute: ${match.live_minute || 0}'
🏆 Compétition: ${match.league}

RECHERCHE EN TEMPS RÉEL:
1. Score actuel exact et minute de jeu
2. Événements récents (buts, cartons, changements) dans les 15 dernières minutes
3. Cotes ACTUELLES des bookmakers (Winamax, Betclic, Parions Sport)
4. Statistiques du match (possession, tirs, corners)
5. Analyse du momentum (quelle équipe domine actuellement)

PRONOSTIC AJUSTÉ:
Basé sur le déroulement actuel du match:
- Le pronostic initial (${match.prediction}) est-il toujours valide?
- Quels ajustements recommandes-tu?
- Quels paris sont maintenant les plus intéressants?

Donne une analyse courte et percutante du match en cours.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            live_score: {
              type: "string",
              description: "Score actuel (ex: 2 - 1)"
            },
            live_minute: {
              type: "number",
              description: "Minute de jeu actuelle"
            },
            recent_events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  minute: { type: "number" },
                  type: { type: "string", enum: ["goal", "yellow_card", "red_card", "substitution"] },
                  description: { type: "string" }
                }
              },
              description: "Événements récents (5 derniers max)"
            },
            summary: {
              type: "string",
              description: "Résumé de l'analyse en direct (3-4 phrases)"
            },
            momentum: {
              type: "string",
              description: "Quelle équipe domine? (ex: 'Domination de [équipe]', 'Match équilibré')"
            },
            key_factors: {
              type: "string",
              description: "Facteurs clés du match en cours"
            },
            prediction_update: {
              type: "string",
              description: "Mise à jour du pronostic basée sur le déroulement"
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
          required: ["summary"]
        }
      });

      const liveAnalysisData = {
        summary: result.summary,
        momentum: result.momentum,
        key_factors: result.key_factors,
        prediction_update: result.prediction_update
      };

      await updateMatchMutation.mutateAsync({
        id: match.id,
        data: {
          live_score: result.live_score || match.live_score,
          live_minute: result.live_minute || match.live_minute,
          live_events: result.recent_events || match.live_events || [],
          live_analysis: JSON.stringify(liveAnalysisData),
          live_updated_at: new Date().toISOString(),
          odds_winamax: result.odds_winamax || match.odds_winamax,
          odds_betclic: result.odds_betclic || match.odds_betclic,
          odds_parionssport: result.odds_parionssport || match.odds_parionssport
        }
      });

    } catch (error) {
      console.error("Erreur actualisation live:", error);
    } finally {
      setRefreshingLiveId(null);
    }
  };

  // Stats globales
  const allAnalyzed = matches.filter(m => m.prediction);
  const stats = {
    total: allAnalyzed.length,
    wins: allAnalyzed.filter(m => m.result === "win").length,
    losses: allAnalyzed.filter(m => m.result === "loss").length,
    pending: allAnalyzed.filter(m => m.result === "pending").length
  };
  
  const winRate = stats.wins + stats.losses > 0 
    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) 
    : 0;

  // Séparation matchs live et autres
  const liveMatches = matches.filter(m => m.status === "live");
  
  // Filtrage des matchs
  let filteredMatches = matches.filter(match => {
    if (match.status === "live") return false; // Les lives sont affichés séparément

    const statusMatch = activeTab === "all" 
      || (activeTab === "upcoming" && (match.status === "upcoming" || !match.status))
      || (activeTab === "finished" && match.status === "finished")
      || (activeTab === "analyzed" && match.prediction);

    const leagueMatch = selectedLeague === "all" || match.league === selectedLeague;

    return statusMatch && leagueMatch;
  });

  // Limiter à 3 matchs pour les utilisateurs gratuits
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
    <div className="min-h-screen bg-slate-950 pb-12">
      {/* Header sticky */}
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              Prono<span className="text-cyan-400">Foot</span>
              {isPremium && <PremiumBadge size="sm" />}
            </h1>
            
            {!isPremium && (
              <Link to={createPageUrl("Pricing")}>
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-base px-6">
                  <Crown className="w-5 h-5 mr-2" />
                  Premium
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
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

        {/* Stats Cards simplifiées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            label="Total"
            value={history.length}
            icon={Trophy}
            bgColor="from-cyan-500/20 to-blue-500/20"
            iconColor="text-cyan-400"
          />
          <StatsCard
            label="Gagnés"
            value={history.filter(h => h.result === "win").length}
            icon={Target}
            bgColor="from-emerald-500/20 to-green-500/20"
            iconColor="text-emerald-400"
          />
          <StatsCard
            label="Réussite"
            value={`${history.length > 0 ? Math.round((history.filter(h => h.result === "win").length / history.filter(h => h.result !== "pending").length) * 100) : 0}%`}
            icon={TrendingUp}
            bgColor="from-blue-500/20 to-indigo-500/20"
            iconColor="text-blue-400"
          />
          <StatsCard
            label="Profit"
            value={`${history.reduce((acc, h) => acc + (h.profit || 0), 0) > 0 ? '+' : ''}${history.reduce((acc, h) => acc + (h.profit || 0), 0).toFixed(0)}€`}
            icon={Zap}
            bgColor="from-cyan-500/20 to-teal-500/20"
            iconColor="text-cyan-400"
            trend={history.reduce((acc, h) => acc + (h.profit || 0), 0) > 0 ? "up" : "down"}
          />
        </div>

        {/* History Stats */}
        {isPremium ? (
          history.length > 0 && <HistoryStats history={history} />
        ) : (
          <SubscriptionGate isPremium={false} feature="l'historique complet">
            <div className="h-32" />
          </SubscriptionGate>
        )}

        {/* Tabs simplifiés */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/30 border border-slate-700/30 p-1">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">À venir</TabsTrigger>
              <TabsTrigger value="analyzed" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Analysés</TabsTrigger>
              <TabsTrigger value="finished" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Terminés</TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Tous</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-5">
            <LeagueFilter onLeagueChange={setSelectedLeague} selectedLeague={selectedLeague} />
          </div>
        </div>

        {/* Live Matches Section */}
        {liveMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 border-2 border-red-500/50">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-red-400 text-base">EN DIRECT</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LiveMatchCard
                    match={match}
                    onRefreshLive={refreshLiveMatch}
                    isRefreshing={refreshingLiveId === match.id}
                    onViewDetails={(m) => setSelectedLiveMatch(m)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Matches Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Chargement...</span>
            </div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
              <Target className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-6">Aucun match</h3>
            {user?.role === 'admin' && (
              <LoadMatchesButton 
                existingMatches={matches}
                onMatchesLoaded={() => queryClient.invalidateQueries({ queryKey: ["matches"] })}
              />
            )}
          </motion.div>
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
                  {match.prediction && match.result === "pending" && (
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

            {/* Premium upgrade prompt for free users */}
            {!isPremium && activeTab === "upcoming" && matches.filter(m => m.status === "upcoming" || !m.status).length > 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <SubscriptionGate 
                  isPremium={false}
                  feature="tous les matchs et pronostics"
                >
                  <div className="h-40" />
                </SubscriptionGate>
              </motion.div>
            )}
          </>
        )}

      </div>

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
    </div>
  );
}