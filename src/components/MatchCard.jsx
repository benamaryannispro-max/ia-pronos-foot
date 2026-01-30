import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Sparkles, CheckCircle2, XCircle, ChevronRight, Crown } from "lucide-react";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-700/30",
        "bg-slate-800/40 backdrop-blur-xl p-6 group",
        "hover:border-cyan-500/50 transition-all duration-300"
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {match.is_vip && (
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg z-10">
          <Crown className="w-3 h-3 text-white" />
          <span className="text-xs font-bold text-white">VIP</span>
        </div>
      )}

      {getResultBadge()}
      
      {/* League & Date */}
      {/* Date et heure */}
      <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mb-5">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {format(matchDate, "dd MMM", { locale: fr })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {format(matchDate, "HH:mm")}
        </span>
      </div>

      {/* Teams avec logos plus grands */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 text-center">
          <div className="mx-auto mb-3">
            <TeamLogo teamName={match.home_team} size="lg" logoUrl={match.logo_home} />
          </div>
          <p className="font-bold text-white text-base">{match.home_team}</p>
        </div>

        <div className="px-6">
          {match.final_score ? (
            <div className="text-3xl font-bold text-white">{match.final_score}</div>
          ) : (
            <div className="text-slate-600 font-bold text-lg">VS</div>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className="mx-auto mb-3">
            <TeamLogo teamName={match.away_team} size="lg" logoUrl={match.logo_away} />
          </div>
          <p className="font-bold text-white text-base">{match.away_team}</p>
        </div>
      </div>



      {/* Prediction */}
      {match.prediction ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center mb-3">
            <PredictionBadge prediction={match.prediction} confidence={match.confidence} />
          </div>

          {match.updated_date && (
            <p className="text-xs text-slate-500 text-center">
              Pronostic du {format(new Date(match.updated_date), "dd/MM à HH:mm", { locale: fr })}
            </p>
          )}

          {onViewDetails && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => onViewDetails(match)}
              className="w-full text-cyan-400 hover:text-white border-cyan-500/30 hover:bg-cyan-500/10 font-semibold"
            >
              Voir l'analyse
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      ) : (
        <Button
          onClick={() => onAnalyze(match)}
          disabled={isAnalyzing}
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-base py-6"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Pronostiquer
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
}