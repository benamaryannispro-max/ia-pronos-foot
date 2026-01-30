import { Target, Clock, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SecondaryPredictions({ predictions = [] }) {
  if (!predictions || predictions.length === 0) return null;

  const getIcon = (type) => {
    if (type === "halftime") return Clock;
    if (type === "exact_score") return Hash;
    return Target;
  };

  const getLabel = (type) => {
    if (type === "halftime") return "Mi-Temps";
    if (type === "exact_score") return "Score";
    return type;
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 75) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
    if (conf >= 60) return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50";
    return "bg-slate-600/20 text-slate-300 border-slate-600/50";
  };

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-slate-500 font-semibold mb-2">PRONOSTICS SECONDAIRES</p>
      <div className="flex flex-wrap gap-2">
        {predictions.map((pred, index) => {
          const Icon = getIcon(pred.type);
          return (
            <div
              key={index}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold",
                getConfidenceColor(pred.confidence)
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{getLabel(pred.type)}</span>
              <span className="font-mono">{pred.prediction}</span>
              <span className="opacity-75">{pred.confidence}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}