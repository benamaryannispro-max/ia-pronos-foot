import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity, TrendingUp, AlertCircle, Clock, Target } from "lucide-react";
import PredictionBadge from "./PredictionBadge";
import TeamLogo from "./TeamLogo";
import LeagueLogo from "./LeagueLogo";
import BookmakerOdds from "./BookmakerOdds";

export default function LiveAnalysisDialog({ match, open, onOpenChange }) {
  if (!match) return null;

  const matchDate = new Date(match.match_date);
  
  const bookmakerOdds = {
    winamax: match.odds_winamax,
    betclic: match.odds_betclic,
    parionssport: match.odds_parionssport
  };

  const hasOdds = match.odds_winamax || match.odds_betclic || match.odds_parionssport;

  let liveAnalysisData = null;
  if (match.live_analysis) {
    try {
      liveAnalysisData = JSON.parse(match.live_analysis);
    } catch {
      liveAnalysisData = { summary: match.live_analysis };
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-red-500/50 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-400 animate-pulse" />
            Analyse Live
            <span className="ml-auto px-2 py-1 rounded-full bg-red-500 text-xs">EN DIRECT</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Match Info */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="px-3 py-1 rounded-full bg-slate-700">
                <LeagueLogo league={match.league} size="sm" showName={true} />
              </div>
              <div className="flex items-center gap-2 text-sm text-red-400 font-bold">
                <Clock className="w-4 h-4 animate-pulse" />
                {match.live_minute || 0}' - EN COURS
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="mx-auto mb-2">
                  <TeamLogo teamName={match.home_team} size="lg" />
                </div>
                <p className="font-bold text-lg">{match.home_team}</p>
              </div>
              
              <div className="text-4xl font-bold text-white bg-slate-700/50 rounded-xl px-6 py-3">
                {match.live_score || "0 - 0"}
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-2">
                  <TeamLogo teamName={match.away_team} size="lg" />
                </div>
                <p className="font-bold text-lg">{match.away_team}</p>
              </div>
            </div>
          </div>

          {/* Live Events */}
          {match.live_events && match.live_events.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Événements du match
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {match.live_events.map((event, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm bg-slate-700/30 rounded-lg p-2">
                    <span className="font-bold text-red-400 min-w-[3rem]">{event.minute}'</span>
                    <span className="text-xl">
                      {event.type === 'goal' ? '⚽' : 
                       event.type === 'yellow_card' ? '🟨' : 
                       event.type === 'red_card' ? '🟥' : 
                       event.type === 'substitution' ? '🔄' : '📝'}
                    </span>
                    <span className="text-slate-300 flex-1">{event.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Original Prediction */}
          {match.prediction && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Pronostic initial
              </h3>
              <div className="flex items-center justify-center">
                <PredictionBadge prediction={match.prediction} confidence={match.confidence} size="lg" />
              </div>
            </div>
          )}

          {/* Bookmaker Odds */}
          {hasOdds && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <BookmakerOdds odds={bookmakerOdds} compact={false} />
            </div>
          )}

          {/* Live Analysis */}
          {liveAnalysisData && (
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/50 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-400" />
                Analyse IA en direct
              </h3>
              <div className="space-y-3">
                <p className="text-slate-300 leading-relaxed">{liveAnalysisData.summary}</p>
                
                {liveAnalysisData.momentum && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Momentum:</div>
                    <div className="text-sm text-white font-semibold">{liveAnalysisData.momentum}</div>
                  </div>
                )}
                
                {liveAnalysisData.key_factors && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Facteurs clés:</div>
                    <div className="text-sm text-slate-300">{liveAnalysisData.key_factors}</div>
                  </div>
                )}
                
                {liveAnalysisData.prediction_update && (
                  <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-3">
                    <div className="text-xs text-amber-400 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Mise à jour du pronostic:
                    </div>
                    <div className="text-sm text-white font-semibold">{liveAnalysisData.prediction_update}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}