import { Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function PremiumBadge({ size = "md" }) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold ${sizeClasses[size]} shadow-lg`}
    >
      <Crown className={`${iconSizes[size]} fill-current`} />
      <span>PREMIUM</span>
    </motion.div>
  );
}