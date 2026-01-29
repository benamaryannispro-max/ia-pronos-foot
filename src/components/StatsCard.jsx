import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, label, value, trend, color = "gold" }) {
  const colorClasses = {
    gold: "from-amber-500/10 to-yellow-600/10 border-amber-500/30",
    green: "from-emerald-500/10 to-green-600/10 border-emerald-500/30",
    blue: "from-blue-500/10 to-indigo-600/10 border-blue-500/30",
    purple: "from-purple-500/10 to-violet-600/10 border-purple-500/30"
  };

  const iconColors = {
    gold: "text-amber-400",
    green: "text-emerald-400",
    blue: "text-blue-400",
    purple: "text-purple-400"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5",
        "backdrop-blur-xl bg-slate-900/50",
        colorClasses[color]
      )}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs mt-2 font-medium",
              trend > 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% ce mois
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl bg-slate-800/50",
          iconColors[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}