import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Zap, Crown } from "lucide-react";
import { format } from "date-fns";
import StatsCard from "@/components/StatsCard";
import HistoryStats from "@/components/HistoryStats";
import SubscriptionGate from "@/components/SubscriptionGate";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function MesPronostics() {
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

  const { data: history = [] } = useQuery({
    queryKey: ["history"],
    queryFn: () => base44.entities.PredictionHistory.list("-created_date", 200),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  const totalPredictions = history.length;
  const wins = history.filter(h => h.result === "win").length;
  const losses = history.filter(h => h.result === "loss").length;
  const pending = history.filter(h => h.result === "pending").length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const totalProfit = history.reduce((acc, h) => acc + (h.profit || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total"
          value={totalPredictions}
          icon={Trophy}
          bgColor="from-cyan-500/20 to-blue-500/20"
          iconColor="text-cyan-400"
        />
        <StatsCard
          label="Gagnés"
          value={wins}
          icon={Target}
          bgColor="from-emerald-500/20 to-green-500/20"
          iconColor="text-emerald-400"
        />
        <StatsCard
          label="Réussite"
          value={`${winRate}%`}
          icon={TrendingUp}
          bgColor="from-blue-500/20 to-indigo-500/20"
          iconColor="text-blue-400"
        />
        <StatsCard
          label="Profit"
          value={`${totalProfit > 0 ? '+' : ''}${totalProfit.toFixed(0)}€`}
          icon={Zap}
          bgColor="from-cyan-500/20 to-teal-500/20"
          iconColor="text-cyan-400"
          trend={totalProfit > 0 ? "up" : "down"}
        />
      </div>

      {/* Transparence */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
        <p className="text-amber-400 text-sm font-semibold text-center">
          ⚠️ Les pronostics ne sont pas garantis • Résultats basés sur l'analyse IA • Pour divertissement uniquement
        </p>
      </div>

      {/* Advanced Stats Premium */}
      {isPremium && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Statistiques Avancées Premium</h2>
          </div>
          <AdvancedStats history={history} />
        </motion.div>
      )}

      {/* Historique détaillé */}
      {isPremium ? (
        history.length > 0 ? (
          <>
            <HistoryStats history={history} />
            
            {/* Liste complète de l'historique */}
            <div className="mt-8 space-y-3">
              <h3 className="text-xl font-bold text-white mb-4">Historique complet</h3>
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{entry.home_team} vs {entry.away_team}</p>
                      <p className="text-xs text-slate-400">{entry.league}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      entry.result === "win" ? "bg-emerald-500/20 text-emerald-400" :
                      entry.result === "loss" ? "bg-red-500/20 text-red-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {entry.result === "win" ? "✓ Gagné" : entry.result === "loss" ? "✗ Perdu" : "En cours"}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-400">
                      Pronostic du {format(new Date(entry.created_date), "dd/MM/yyyy à HH:mm")}
                    </span>
                    {entry.confidence && (
                      <span className="text-cyan-400 font-semibold">
                        Confiance: {entry.confidence}%
                      </span>
                    )}
                  </div>
                  
                  {entry.final_score && (
                    <p className="text-sm text-slate-300 mt-2">Score: {entry.final_score}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">Aucun pronostic pour le moment</p>
          </div>
        )
      ) : (
        <SubscriptionGate isPremium={false} feature="l'historique complet">
          <div className="h-64" />
        </SubscriptionGate>
      )}
    </div>
  );
}