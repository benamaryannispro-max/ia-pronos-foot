import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Sparkles, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import PredictionBadge from "./PredictionBadge";
import TeamLogo from "./TeamLogo";
import LeagueLogo from "./LeagueLogo";
import BookmakerOdds from "./BookmakerOdds";
import { Button } from "@/components/ui/button";

export default function MatchCard({ match, onAnalyze, isAnalyzing, onViewDetails }) {
  const matchDate = new Date(match.match_date);
  
  const getResultBadge = () => {
    if (match.result === "win") {
      return (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 z-10">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">Gagné</span>
        </div>
      );
    }
    if (match.result === "loss") {
      return (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/50 z-10">
          <XCircle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-semibold text-red-400">Perdu</span>
        </div>
      );
    }
    return null;
  };

  const bookmakerOdds = {
    winamax: match.odds_winamax,
    betclic: match.odds_betclic,
    parionssport: match.odds_parionssport
  };

  const hasOdds = match.odds_winamax || match.odds_betclic || match.odds_parionssport;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-700/50",
        "bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900",
        "backdrop-blur-xl p-5 group"
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {getResultBadge()}
      
      {/* League & Date */}
      <div className="flex items-center justify-between mb-4">
        <div className="px-3 py-1.5 rounded-full bg-slate-700/50 text-xs font-medium text-slate-300">
          <LeagueLogo league={match.league} size="xs" showName={true} />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(matchDate, "dd MMM", { locale: fr })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {format(matchDate, "HH:mm")}
          </span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex-1 text-center">
          <div className="mx-auto mb-2">
            <TeamLogo teamName={match.home_team} size="md" logoUrl={match.logo_home} />
          </div>
          <p className="font-semibold text-white text-sm">{match.home_team}</p>
        </div>

        <div className="px-4">
          {match.final_score ? (
            <div className="text-2xl font-bold text-white">{match.final_score}</div>
          ) : (
            <div className="text-slate-500 font-medium">VS</div>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className="mx-auto mb-2">
            <TeamLogo teamName={match.away_team} size="md" logoUrl={match.logo_away} />
          </div>
          <p className="font-semibold text-white text-sm">{match.away_team}</p>
        </div>
      </div>

      {/* Bookmaker Odds */}
      {hasOdds && (
        <div className="mb-4">
          <BookmakerOdds odds={bookmakerOdds} compact={true} />
        </div>
      )}

      {/* Prediction */}
      {match.prediction ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <PredictionBadge prediction={match.prediction} confidence={match.confidence} />
          </div>
          
          {match.analysis && (() => {
            let analysisText;
            try {
              const parsed = JSON.parse(match.analysis);
              analysisText = parsed.analysis;
            } catch {
              analysisText = match.analysis;
            }
            return (
              <p className="text-xs text-slate-400 text-center line-clamp-2 mt-2">
                {analysisText}
              </p>
            );
          })()}

          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(match)}
              className="w-full text-slate-400 hover:text-white mt-2"
            >
              Voir l'analyse complète
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      ) : (
        <Button
          onClick={() => onAnalyze(match)}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyser avec l'IA
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
}