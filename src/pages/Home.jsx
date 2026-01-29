import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Zap, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import MatchCard from "@/components/MatchCard";
import AddMatchDialog from "@/components/AddMatchDialog";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [analyzingMatchId, setAnalyzingMatchId] = useState(null);
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: () => base44.entities.Match.list("-match_date", 50)
  });

  const createMatchMutation = useMutation({
    mutationFn: (data) => base44.entities.Match.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches"] })
  });

  const updateMatchMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Match.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches"] })
  });

  const analyzeMatch = async (match) => {
    setAnalyzingMatchId(match.id);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un expert en analyse de paris sportifs football. Analyse ce match et donne un pronostic:

Match: ${match.home_team} vs ${match.away_team}
Compétition: ${match.league}
Date: ${match.match_date}

Donne ton analyse détaillée et ton pronostic. Prends en compte:
- La forme récente des équipes
- Les confrontations directes
- Les absences potentielles
- Le contexte du match

Sois précis et donne un niveau de confiance réaliste.`,
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
              description: "Niveau de confiance entre 50 et 95"
            },
            odds: {
              type: "number",
              description: "Cote estimée entre 1.20 et 5.00"
            },
            analysis: {
              type: "string",
              description: "Analyse détaillée en 2-3 phrases"
            }
          },
          required: ["prediction", "confidence", "odds", "analysis"]
        }
      });

      await updateMatchMutation.mutateAsync({
        id: match.id,
        data: {
          prediction: result.prediction,
          confidence: Math.min(95, Math.max(50, result.confidence)),
          odds: result.odds,
          analysis: result.analysis
        }
      });
    } catch (error) {
      console.error("Erreur analyse:", error);
    } finally {
      setAnalyzingMatchId(null);
    }
  };

  // Calcul des stats
  const stats = {
    total: matches.length,
    wins: matches.filter(m => m.result === "win").length,
    losses: matches.filter(m => m.result === "loss").length,
    pending: matches.filter(m => m.result === "pending").length
  };
  
  const winRate = stats.wins + stats.losses > 0 
    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) 
    : 0;

  // Filtrage des matchs
  const filteredMatches = matches.filter(match => {
    if (activeTab === "upcoming") return match.status === "upcoming" || !match.status;
    if (activeTab === "finished") return match.status === "finished";
    return true;
  });

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
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Propulsé par l'IA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Prono<span className="text-amber-400">Foot</span> IA
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Analyse intelligente des matchs de football pour des pronostics optimisés
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            trend={winRate > 50 ? winRate - 50 : null}
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

        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger 
                value="upcoming" 
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
              >
                À venir
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
            <AddMatchDialog 
              onAddMatch={createMatchMutation.mutateAsync}
              isLoading={createMatchMutation.isPending}
            />
          </div>
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
              Ajoutez votre premier match pour obtenir une analyse IA
            </p>
            <AddMatchDialog 
              onAddMatch={createMatchMutation.mutateAsync}
              isLoading={createMatchMutation.isPending}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MatchCard
                  match={match}
                  onAnalyze={analyzeMatch}
                  isAnalyzing={analyzingMatchId === match.id}
                />
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
    </div>
  );
}