import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Zap, Sparkles, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import MatchCard from "@/components/MatchCard";
import LeagueFilter from "@/components/LeagueFilter";
import LoadMatchesButton from "@/components/LoadMatchesButton";
import HistoryStats from "@/components/HistoryStats";
import AnalysisDialog from "@/components/AnalysisDialog";
import UpdateResultDialog from "@/components/UpdateResultDialog";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [analyzingMatchId, setAnalyzingMatchId] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const queryClient = useQueryClient();

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

  // Filtrage des matchs
  const filteredMatches = matches.filter(match => {
    const statusMatch = activeTab === "all" 
      || (activeTab === "upcoming" && (match.status === "upcoming" || !match.status))
      || (activeTab === "finished" && match.status === "finished")
      || (activeTab === "analyzed" && match.prediction);
    
    const leagueMatch = selectedLeague === "all" || match.league === selectedLeague;
    
    return statusMatch && leagueMatch;
  });

  const historyStats = {
    total: history.filter(h => h.result !== "pending").length,
    wins: history.filter(h => h.result === "win").length,
    winRate: history.filter(h => h.result !== "pending").length > 0
      ? Math.round((history.filter(h => h.result === "win").length / history.filter(h => h.result !== "pending").length) * 100)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Propulsé par l'IA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Prono<span className="text-amber-400">Foot</span> IA
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Analyse intelligente avec cotes Winamax, Betclic & Parions Sport
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon={Target}
            label="Total Pronostics"
            value={stats.total}
            color="gold"
          />
          <StatsCard
            icon={Trophy}
            label="Gagnés"
            value={stats.wins}
            color="green"
          />
          <StatsCard
            icon={TrendingUp}
            label="Taux de réussite"
            value={`${winRate}%`}
            color="blue"
          />
          <StatsCard
            icon={Zap}
            label="En attente"
            value={stats.pending}
            color="purple"
          />
        </div>

        {/* History Stats */}
        {history.length > 0 && (
          <HistoryStats history={history} />
        )}

        {/* Actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-800/50 border border-slate-700">
                <TabsTrigger 
                  value="upcoming" 
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                >
                  À venir
                </TabsTrigger>
                <TabsTrigger 
                  value="analyzed"
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                >
                  Analysés
                </TabsTrigger>
                <TabsTrigger 
                  value="finished"
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                >
                  Terminés
                </TabsTrigger>
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                >
                  Tous
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["matches"] })}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <LoadMatchesButton 
                existingMatches={matches}
                onMatchesLoaded={() => queryClient.invalidateQueries({ queryKey: ["matches"] })}
              />
            </div>
          </div>

          {/* League Filter */}
          <LeagueFilter 
            selectedLeague={selectedLeague} 
            onLeagueChange={setSelectedLeague}
          />
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Chargement des matchs...</span>
            </div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <Target className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun match</h3>
            <p className="text-slate-400 mb-6">
              Cliquez sur "Charger les matchs" pour récupérer les prochains matchs
            </p>
            <LoadMatchesButton 
              existingMatches={matches}
              onMatchesLoaded={() => queryClient.invalidateQueries({ queryKey: ["matches"] })}
            />
          </motion.div>
        ) : (
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
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 pb-8"
        >
          <p className="text-xs text-slate-500">
            ⚠️ Les pronostics sont générés par l'IA à titre informatif uniquement. 
            Pariez de manière responsable.
          </p>
        </motion.div>
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
    </div>
  );
}