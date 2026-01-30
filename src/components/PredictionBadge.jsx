import { cn } from "@/lib/utils";

const predictionLabels = {
  "home_win": "1",
  "draw": "N",
  "away_win": "2",
  "over_2.5": "+2.5",
  "under_2.5": "-2.5",
  "btts_yes": "BTTS",
  "btts_no": "No BTTS",
  "home_win_ht": "1 MT",
  "draw_ht": "N MT",
  "away_win_ht": "2 MT",
  "exact_score_1_0": "1-0",
  "exact_score_2_0": "2-0",
  "exact_score_2_1": "2-1",
  "exact_score_3_0": "3-0",
  "exact_score_0_0": "0-0",
  "exact_score_1_1": "1-1",
  "exact_score_0_1": "0-1",
  "exact_score_0_2": "0-2"
};

export default function PredictionBadge({ prediction, confidence, size = "md" }) {
  const getConfidenceColor = (conf) => {
    if (conf >= 75) return "from-emerald-500/20 to-green-500/20 border-emerald-500/50 text-emerald-400";
    if (conf >= 60) return "from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400";
    return "from-slate-500/20 to-slate-600/20 border-slate-500/50 text-slate-300";
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-2",
    md: "px-4 py-2 text-base gap-2.5",
    lg: "px-5 py-2.5 text-lg gap-3"
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-xl border-2 bg-gradient-to-r font-bold",
      getConfidenceColor(confidence),
      sizeClasses[size]
    )}>
      <span>{predictionLabels[prediction] || prediction}</span>
      <span className="opacity-75">{confidence}%</span>
    </div>
  );
}