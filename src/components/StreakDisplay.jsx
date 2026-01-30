import { Flame, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function StreakDisplay({ streakDays = 0, bestStreak = 0 }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 rounded-2xl p-6 text-center"
      >
        <Flame className="w-10 h-10 text-orange-400 mx-auto mb-3" />
        <p className="text-4xl font-bold text-orange-400 mb-1">{streakDays}</p>
        <p className="text-sm text-slate-300 font-semibold">Jours consécutifs</p>
        {streakDays >= 3 && (
          <p className="text-xs text-orange-400 mt-2">🔥 En feu !</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-2xl p-6 text-center"
      >
        <Calendar className="w-10 h-10 text-purple-400 mx-auto mb-3" />
        <p className="text-4xl font-bold text-purple-400 mb-1">{bestStreak}</p>
        <p className="text-sm text-slate-300 font-semibold">Meilleur record</p>
      </motion.div>
    </div>
  );
}