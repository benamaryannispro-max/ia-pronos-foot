import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Zap, Crown } from "lucide-react";
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

      {/* Historique détaillé */}
      {isPremium ? (
        history.length > 0 ? (
          <HistoryStats history={history} />
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