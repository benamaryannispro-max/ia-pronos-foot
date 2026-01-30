import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { RefreshCw, Settings } from "lucide-react";
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

export default function Matchs() {
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
      const recentHistory = history.filter(h => h.result !== "pending").slice(0, 20);
      const historyContext = recentHistory.length > 0 
        ? `\n\nHistorique récent:\n${recentHistory.map(h => 
            `- ${h.home_team} vs ${h.away_team}: ${h.prediction}, ${h.result}`
          ).join('\n')}`
        : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyse ce match de football:

${match.home_team} vs ${match.away_team}
${match.league} - ${match.match_date}

Recherche:
1. Cotes actuelles (Winamax, Betclic, Parions Sport)
2. Blessés/Suspendus
3. Top 3 buteurs de chaque équipe
4. Forme des 5 derniers matchs
5. Confrontations directes
${historyContext}

Analyse courte et pronostic précis.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            prediction: {
              type: "string",
              enum: ["home_win", "draw", "away_win", "over_2.5", "under_2.5", "btts_yes", "btts_no"]
            },
            confidence: { type: "number" },
            analysis: { type: "string" },
            key_injuries: { type: "string" },
            top_scorers_home: { type: "string" },
            top_scorers_away: { type: "string" },
            team_form: { type: "string" },
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
    
    const historyEntry = history.find(h => h.match_id === matchId);
    if (historyEntry) {
      await base44.entities.PredictionHistory.update(historyEntry.id, {
        final_score: data.final_score,
        result: data.result
      });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    }
  };

  const refreshLiveMatch = async (match) => {
    setRefreshingLiveId(match.id);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyse live: ${match.home_team} vs ${match.away_team}
Score actuel: ${match.live_score || "0-0"}
Minute: ${match.live_minute || 0}'

Recherche temps réel:
- Score et minute exacts
- Événements récents
- Cotes actuelles
- Analyse momentum`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            live_score: { type: "string" },
            live_minute: { type: "number" },
            recent_events: { type: "array", items: { type: "object" } },
            summary: { type: "string" },
            momentum: { type: "string" }
          }
        }
      });

      const liveAnalysisData = {
        summary: result.summary,
        momentum: result.momentum
      };

      await updateMatchMutation.mutateAsync({
        id: match.id,
        data: {
          live_score: result.live_score || match.live_score,
          live_minute: result.live_minute || match.live_minute,
          live_events: result.recent_events || [],
          live_analysis: JSON.stringify(liveAnalysisData),
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
    </div>
  );
}