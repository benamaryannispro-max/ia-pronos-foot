import { cn } from "@/lib/utils";

const predictionLabels = {
  "home_win": "Victoire Domicile",
  "draw": "Match Nul",
  "away_win": "Victoire Extérieur",
  "over_2.5": "Plus de 2.5 buts",
  "under_2.5": "Moins de 2.5 buts",
  "btts_yes": "Les 2 équipes marquent",
  "btts_no": "Les 2 ne marquent pas"
};

export default function PredictionBadge({ prediction, confidence, size = "md" }) {
  const getConfidenceColor = (conf) => {
    if (conf >= 80) return "from-emerald-500/20 to-emerald-600/20 border-emerald-500/50 text-emerald-400";
    if (conf >= 60) return "from-amber-500/20 to-amber-600/20 border-amber-500/50 text-amber-400";
    return "from-slate-500/20 to-slate-600/20 border-slate-500/50 text-slate-400";
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-full border bg-gradient-to-r font-medium",
      getConfidenceColor(confidence),
      sizeClasses[size]
    )}>
      <span>{predictionLabels[prediction] || prediction}</span>
      <span className="font-bold">{confidence}%</span>
    </div>
  );
}