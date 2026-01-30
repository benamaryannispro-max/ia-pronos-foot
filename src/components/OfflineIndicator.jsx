import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-16 left-0 right-0 z-50 mx-4"
        >
          <div className="max-w-md mx-auto bg-orange-500/90 backdrop-blur-md border border-orange-400 rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg">
            <WifiOff className="w-5 h-5 text-white" />
            <p className="text-white text-sm font-semibold">
              Mode hors ligne • Certaines fonctionnalités sont limitées
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}