import { motion } from "framer-motion";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SubscriptionGate({ 
  isPremium, 
  feature = "cette fonctionnalité",
  children 
}) {
  if (isPremium) {
    return children;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center"
    >
      {/* Blurred background preview */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="blur-sm opacity-30">
          {children}
        </div>
      </div>

      {/* Lock overlay */}
      <div className="relative z-10 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
          <Lock className="w-8 h-8 text-black" />
        </div>
        
        <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Crown className="w-6 h-6 text-amber-400" />
          Fonctionnalité Premium
        </h3>
        
        <p className="text-slate-300 max-w-md mx-auto">
          Débloquez {feature} et toutes les fonctionnalités avancées avec l'abonnement Premium
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link to={createPageUrl("Pricing")}>
            <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold">
              <Sparkles className="w-4 h-4 mr-2" />
              Passer Premium
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}