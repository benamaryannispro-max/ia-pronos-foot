import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Percent, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryStats({ history }) {
  const stats = {
    total: history.length,
    wins: history.filter(h => h.result === "win").length,
    losses: history.filter(h => h.result === "loss").length,
    pending: history.filter(h => h.result === "pending").length
  };

  const winRate = stats.wins + stats.losses > 0
    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
    : 0;

  const totalProfit = history.reduce((acc, h) => acc + (h.profit || 0), 0);

  const statItems = [
    {
      label: "Pronostics",
      value: stats.total,
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      label: "Gagnés",
      value: stats.wins,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      label: "Perdus",
      value: stats.losses,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10"
    },
    {
      label: "Taux",
      value: `${winRate}%`,
      icon: Percent,
      color: winRate >= 60 ? "text-emerald-400" : winRate >= 40 ? "text-amber-400" : "text-red-400",
      bg: winRate >= 60 ? "bg-emerald-500/10" : winRate >= 40 ? "bg-amber-500/10" : "bg-red-500/10"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-4 mb-6"
    >
      <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4" />
        Performance globale
      </h3>
      
      <div className="grid grid-cols-4 gap-3">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "rounded-xl p-3 text-center",
              item.bg
            )}
          >
            <item.icon className={cn("w-5 h-5 mx-auto mb-1", item.color)} />
            <p className={cn("text-xl font-bold", item.color)}>{item.value}</p>
            <p className="text-xs text-slate-400">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {stats.pending > 0 && (
        <p className="text-xs text-slate-500 text-center mt-3">
          {stats.pending} pronostic(s) en attente de résultat
        </p>
      )}
    </motion.div>
  );
}