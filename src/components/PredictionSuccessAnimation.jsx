import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";

export default function PredictionSuccessAnimation({ show, onComplete, prediction, confidence }) {
  useEffect(() => {
    if (show) {
      // Confetti burst
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      
      const colors = ['#22d3ee', '#3b82f6', '#06b6d4', '#0ea5e9'];
      
      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: colors
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      }());

      // Auto-hide after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 max-w-md mx-4"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-6 relative"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center relative">
                <CheckCircle2 className="w-10 h-10 text-white" />
                
                {/* Sparkles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-2 -right-2" />
                  <Sparkles className="w-4 h-4 text-cyan-400 absolute -bottom-1 -left-1" />
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                Pronostic généré ! 🎯
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                L'IA a analysé le match avec succès
              </p>

              {/* Prediction Badge */}
              {prediction && confidence && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50"
                >
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-bold text-lg">{prediction}</span>
                  <span className="text-cyan-400 font-bold text-lg">{confidence}%</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}