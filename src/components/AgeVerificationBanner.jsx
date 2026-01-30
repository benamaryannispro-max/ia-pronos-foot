import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function AgeVerificationBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('age_verified');
    if (!verified) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('age_verified', 'true');
    setShowBanner(false);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  🔞 Vérification d'âge
                </h2>
                
                <p className="text-slate-300 leading-relaxed">
                  Cette application contient des pronostics de paris sportifs et est strictement réservée aux personnes majeures.
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-300 text-sm text-center font-semibold">
                  Avez-vous 18 ans ou plus ?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAccept}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Oui, j'ai +18 ans
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Non
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-6">
                En continuant, vous confirmez avoir l'âge légal pour accéder à ce contenu
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}