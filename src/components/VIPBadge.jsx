import { Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function VIPBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50"
    >
      <Crown className="w-3.5 h-3.5 text-white" />
      <span className="text-xs font-bold text-white">VIP</span>
      <Sparkles className="w-3 h-3 text-white" />
    </motion.div>
  );
}