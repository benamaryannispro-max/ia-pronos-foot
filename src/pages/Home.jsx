import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Zap, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import PremiumBadge from "@/components/PremiumBadge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Home() {
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

  // Rafraîchir l'abonnement après paiement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('subscription') === 'success' && user?.email) {
      // Attendre 2 secondes puis rafraîchir
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['subscription', user.email] });
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, '/');
      }, 2000);
    }
  }, [user?.email, queryClient]);

  const isPremium = subscription && subscription.plan !== "free";

  const { data: matches = [] } = useQuery({
    queryKey: ["matches"],
    queryFn: () => base44.entities.Match.list("-match_date", 100),
    staleTime: 2 * 60 * 1000, // Cache 2 min
    gcTime: 10 * 60 * 1000
  });

  const { data: history = [] } = useQuery({
    queryKey: ["history"],
    queryFn: () => base44.entities.PredictionHistory.list("-created_date", 200),
    staleTime: 5 * 60 * 1000, // Cache 5 min
    gcTime: 15 * 60 * 1000
  });

  const upcomingMatches = matches.filter(m => m.status === "upcoming" || !m.status).length;
  const liveMatches = matches.filter(m => m.status === "live").length;
  const wins = history.filter(h => h.result === "win").length;
  const winRate = history.filter(h => h.result !== "pending").length > 0
    ? Math.round((wins / history.filter(h => h.result !== "pending").length) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Bienvenue {isPremium && <span className="text-cyan-400">Premium</span>}
        </h2>
        
        {/* Taux de réussite visible */}
        {history.length > 0 && (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/50 mt-4">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <span className="text-2xl font-bold text-emerald-400">{winRate}%</span>
            <span className="text-slate-300 text-sm">de réussite ({wins}/{history.filter(h => h.result !== "pending").length})</span>
          </div>
        )}
        
        {!isPremium && (
          <Link to={createPageUrl("Pricing")}>
            <Button size="lg" className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-base px-8">
              <Crown className="w-5 h-5 mr-2" />
              Passer Premium
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total"
          value={history.length}
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
          value={`${history.reduce((acc, h) => acc + (h.profit || 0), 0) > 0 ? '+' : ''}${history.reduce((acc, h) => acc + (h.profit || 0), 0).toFixed(0)}€`}
          icon={Zap}
          bgColor="from-cyan-500/20 to-teal-500/20"
          iconColor="text-cyan-400"
          trend={history.reduce((acc, h) => acc + (h.profit || 0), 0) > 0 ? "up" : "down"}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-2xl p-8 cursor-pointer"
        >
          <Link to={createPageUrl("Matchs")} className="block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Matchs à venir</h3>
              <ArrowRight className="w-6 h-6 text-cyan-400" />
            </div>
            <p className="text-5xl font-bold text-cyan-400 mb-2">{upcomingMatches}</p>
            <p className="text-slate-400">matchs disponibles</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/30 rounded-2xl p-8 cursor-pointer"
        >
          <Link to={createPageUrl("MesPronostics")} className="block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Mes stats</h3>
              <ArrowRight className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-5xl font-bold text-emerald-400 mb-2">{winRate}%</p>
            <p className="text-slate-400">taux de réussite</p>
          </Link>
        </motion.div>
      </div>

      {/* Live indicator */}
      {liveMatches > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Link to={createPageUrl("Matchs")}>
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-2xl font-bold text-red-400">EN DIRECT</span>
              </div>
              <p className="text-slate-300 text-lg">{liveMatches} match{liveMatches > 1 ? 's' : ''} en cours</p>
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}