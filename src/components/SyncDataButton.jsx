import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function SyncDataButton({ onSyncComplete }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setIsSyncing(true);
    setStatus(null);
    
    try {
      const response = await base44.functions.invoke('syncAllLeagues', {});
      
      if (response.data.success) {
        setStatus('success');
        setMessage(`${response.data.results.filter(r => r.success).length} ligues synchronisées`);
        onSyncComplete?.();
      } else {
        setStatus('error');
        setMessage("Erreur lors de la synchronisation");
      }
    } catch (error) {
      console.error("Sync error:", error);
      setStatus('error');
      setMessage("Erreur de connexion à l'API");
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setStatus(null);
        setMessage("");
      }, 3000);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        variant="outline"
        size="sm"
        className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Synchronisation...' : 'Sync données'}
      </Button>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full mt-2 left-0 right-0 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap ${
              status === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-red-500/20 border-red-500/50 text-red-400'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
            ) : (
              <AlertCircle className="w-3 h-3 inline mr-1" />
            )}
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}