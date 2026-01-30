import { motion } from "framer-motion";
import { Clock, TrendingUp, AlertCircle, RefreshCw, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import PredictionBadge from "./PredictionBadge";
import TeamLogo from "./TeamLogo";
import LeagueLogo from "./LeagueLogo";
import BookmakerOdds from "./BookmakerOdds";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function LiveMatchCard({ match, onRefreshLive, isRefreshing, onViewDetails }) {
  const bookmakerOdds = {
    winamax: match.odds_winamax,
    betclic: match.odds_betclic,
    parionssport: match.odds_parionssport
  };

  const hasOdds = match.odds_winamax || match.odds_betclic || match.odds_parionssport;
  
  const lastUpdate = match.live_updated_at 
    ? formatDistanceToNow(new Date(match.live_updated_at), { addSuffix: true, locale: fr })
    : null;

  let liveAnalysisData = null;
  if (match.live_analysis) {
    try {
      liveAnalysisData = JSON.parse(match.live_analysis);
    } catch {
      liveAnalysisData = { summary: match.live_analysis };
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2",
        "bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900",
        "backdrop-blur-xl p-5",
        "border-red-500/50 shadow-lg shadow-red-500/20"
      )}
    >
      {/* Live indicator pulse effect */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
      
      {/* Live Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 z-10 animate-pulse">
        <div className="w-2 h-2 rounded-full bg-white" />
        <span className="text-xs font-bold text-white">EN DIRECT</span>
      </div>
      
      {/* League & Time */}
      <div className="flex items-center justify-between mb-4">
        <div className="px-3 py-1.5 rounded-full bg-slate-700/50 text-xs font-medium text-slate-300">
          <LeagueLogo league={match.league} size="xs" showName={true} />
        </div>
        <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>{match.live_minute || 0}'</span>
        </div>
      </div>

      {/* Teams & Live Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-center">
          <div className="mx-auto mb-2">
            <TeamLogo teamName={match.home_team} size="md" logoUrl={match.logo_home} />
          </div>
          <p className="font-semibold text-white text-sm">{match.home_team}</p>
        </div>
        
        <div className="px-6">
          <div className="text-3xl font-bold text-white bg-slate-800/80 rounded-xl px-4 py-2">
            {match.live_score || "0 - 0"}
          </div>
        </div>
        
        <div className="flex-1 text-center">
          <div className="mx-auto mb-2">
            <TeamLogo teamName={match.away_team} size="md" logoUrl={match.logo_away} />
          </div>
          <p className="font-semibold text-white text-sm">{match.away_team}</p>
        </div>
      </div>

      {/* Live Events */}
      {match.live_events && match.live_events.length > 0 && (
        <div className="mb-4 bg-slate-800/50 rounded-xl p-3 max-h-24 overflow-y-auto">
          <div className="text-xs text-slate-400 mb-1">Événements récents:</div>
          <div className="space-y-1">
            {match.live_events.slice(-3).reverse().map((event, idx) => (
              <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                <span className="font-bold text-red-400">{event.minute}'</span>
                <span>{event.type === 'goal' ? '⚽' : event.type === 'yellow_card' ? '🟨' : event.type === 'red_card' ? '🟥' : '🔄'}</span>
                <span>{event.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookmaker Odds */}
      {hasOdds && (
        <div className="mb-4">
          <BookmakerOdds odds={bookmakerOdds} compact={true} />
        </div>
      )}

      {/* Original Prediction */}
      {match.prediction && (
        <div className="mb-4 bg-slate-800/50 rounded-xl p-3">
          <div className="text-xs text-slate-400 mb-2">Pronostic initial:</div>
          <div className="flex items-center justify-center">
            <PredictionBadge prediction={match.prediction} confidence={match.confidence} size="sm" />
          </div>
        </div>
      )}

      {/* Live Analysis */}
      {liveAnalysisData && (
        <div className="mb-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <span className="text-xs font-semibold text-red-400">Analyse en direct</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
            {liveAnalysisData.summary}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => onRefreshLive(match)}
          disabled={isRefreshing}
          size="sm"
          variant="outline"
          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Actualisation...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 mr-1" />
              Actualiser
            </>
          )}
        </Button>
        
        {onViewDetails && (
          <Button
            onClick={() => onViewDetails(match)}
            size="sm"
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white"
          >
            Détails
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-center mt-3 text-xs text-slate-500">
          Mis à jour {lastUpdate}
        </div>
      )}
    </motion.div>
  );
}