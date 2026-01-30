import { motion } from "framer-motion";
import { Zap, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LivePredictions({ livePredictions, liveAnalysis }) {
  if (!livePredictions && !liveAnalysis) return null;

  const parsedAnalysis = typeof liveAnalysis === 'string' 
    ? JSON.parse(liveAnalysis) 
    : liveAnalysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            Pronostics Dynamiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {livePredictions?.adjusted_prediction && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Prono ajusté:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-400">{livePredictions.adjusted_prediction}</span>
                <span className="text-xs text-purple-300">{livePredictions.adjusted_confidence}%</span>
              </div>
            </div>
          )}

          {livePredictions?.next_goal_team && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Prochain but:</span>
              <span className="font-bold text-cyan-400">{livePredictions.next_goal_team}</span>
            </div>
          )}

          {livePredictions?.final_score_prediction && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Score final prévu:</span>
              <span className="font-bold text-emerald-400 font-mono">{livePredictions.final_score_prediction}</span>
            </div>
          )}

          {parsedAnalysis?.stats && (
            <div className="pt-2 border-t border-purple-500/20">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Possession:</span>
                  <span className="ml-1 text-white font-semibold">{parsedAnalysis.stats.possession_home}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Tirs:</span>
                  <span className="ml-1 text-white font-semibold">{parsedAnalysis.stats.shots_home}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}