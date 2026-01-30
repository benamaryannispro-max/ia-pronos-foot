import { motion } from "framer-motion";
import { TrendingUp, Target, Trophy, Zap, Award, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdvancedStats({ history = [] }) {
  const completedPredictions = history.filter(h => h.result !== "pending");
  const wins = history.filter(h => h.result === "win");
  
  const statsByLeague = {};
  completedPredictions.forEach(h => {
    if (!statsByLeague[h.league]) {
      statsByLeague[h.league] = { total: 0, wins: 0 };
    }
    statsByLeague[h.league].total++;
    if (h.result === "win") statsByLeague[h.league].wins++;
  });

  const leagueStats = Object.entries(statsByLeague)
    .map(([league, stats]) => ({
      league,
      ...stats,
      winRate: Math.round((stats.wins / stats.total) * 100)
    }))
    .sort((a, b) => b.winRate - a.winRate);

  const highConfidence = completedPredictions.filter(h => h.confidence >= 75);
  const highConfWinRate = highConfidence.length > 0 
    ? Math.round((highConfidence.filter(h => h.result === "win").length / highConfidence.length) * 100)
    : 0;

  const monthlyProfit = history
    .filter(h => {
      const date = new Date(h.created_date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((acc, h) => acc + (h.profit || 0), 0);

  const avgOdds = wins.length > 0
    ? (wins.reduce((acc, h) => acc + (h.odds || 1.5), 0) / wins.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      {/* Statistiques Premium */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-xl p-4 text-center"
        >
          <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-400">{highConfWinRate}%</p>
          <p className="text-xs text-slate-300">Confiance haute</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50 rounded-xl p-4 text-center"
        >
          <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-emerald-400">{monthlyProfit > 0 ? '+' : ''}{monthlyProfit.toFixed(0)}€</p>
          <p className="text-xs text-slate-300">Ce mois</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-xl p-4 text-center"
        >
          <BarChart3 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-cyan-400">{avgOdds}</p>
          <p className="text-xs text-slate-300">Cote moyenne</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 rounded-xl p-4 text-center"
        >
          <Award className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-400">{wins.length}</p>
          <p className="text-xs text-slate-300">Victoires</p>
        </motion.div>
      </div>

      {/* Stats par ligue */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-white text-lg">Performance par Compétition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leagueStats.slice(0, 5).map((stat, index) => (
              <div key={stat.league} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono text-sm">#{index + 1}</span>
                  <span className="text-white font-semibold text-sm">{stat.league}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">{stat.wins}/{stat.total}</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    stat.winRate >= 70 ? "bg-emerald-500/20 text-emerald-400" :
                    stat.winRate >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-slate-700/50 text-slate-400"
                  }`}>
                    {stat.winRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}