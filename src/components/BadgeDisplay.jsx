import { Trophy, Target, Flame, Star, Crown, Zap, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const BADGES = {
  "premium_vip": { icon: Crown, label: "VIP Premium", color: "from-purple-500 to-pink-500", tier: "vip", description: "Abonné" },
  "first_prediction": { icon: Star, label: "Première Étoile", color: "from-blue-500 to-cyan-500", tier: "bronze", description: "1er prono" },
  "5_predictions": { icon: Target, label: "Débutant", color: "from-amber-600 to-orange-600", tier: "bronze", description: "5 pronos" },
  "20_predictions": { icon: Trophy, label: "Régulier", color: "from-slate-400 to-slate-500", tier: "silver", description: "20 pronos" },
  "50_predictions": { icon: Award, label: "Expert", color: "from-yellow-500 to-amber-500", tier: "gold", description: "50 pronos" },
  "100_predictions": { icon: Crown, label: "Maître", color: "from-yellow-400 to-yellow-600", tier: "gold", description: "100 pronos" },
  "first_win": { icon: Zap, label: "1ère Victoire", color: "from-emerald-500 to-green-500", tier: "bronze", description: "1er gagnant" },
  "10_wins": { icon: TrendingUp, label: "Vainqueur", color: "from-slate-400 to-slate-500", tier: "silver", description: "10 victoires" },
  "streak_3": { icon: Flame, label: "En Feu", color: "from-amber-600 to-orange-600", tier: "bronze", description: "3 jours" },
  "streak_7": { icon: Flame, label: "Inarrêtable", color: "from-slate-400 to-slate-500", tier: "silver", description: "7 jours" },
  "streak_30": { icon: Flame, label: "Légende", color: "from-yellow-500 to-amber-500", tier: "gold", description: "30 jours" }
};

export default function BadgeDisplay({ badges = [], size = "md", showAll = false }) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9"
  };

  const badgesToShow = showAll ? Object.entries(BADGES) : Object.entries(BADGES).filter(([key]) => badges.includes(key));

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
      {(showAll ? Object.entries(BADGES) : badgesToShow).map(([key, badge]) => {
        const Icon = badge.icon;
        const isEarned = badges.includes(key);
        
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: isEarned ? 1.1 : 1 }}
            className="text-center"
          >
            <div className={`${sizeClasses[size]} mx-auto mb-2 rounded-xl flex items-center justify-center transition-all ${
              isEarned 
                ? `bg-gradient-to-br ${badge.color} shadow-lg shadow-${badge.tier === 'gold' ? 'yellow' : badge.tier === 'silver' ? 'slate' : 'orange'}-500/50` 
                : "bg-slate-800/30 border border-slate-700/50"
            }`}>
              <Icon className={`${iconSizes[size]} ${isEarned ? "text-white" : "text-slate-700"}`} />
            </div>
            <p className={`text-xs font-semibold ${isEarned ? "text-white" : "text-slate-600"}`}>
              {badge.label}
            </p>
            <p className="text-xs text-slate-500">{badge.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

export { BADGES };