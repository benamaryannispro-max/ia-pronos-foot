import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, Calendar, Trophy, Target, BarChart3 } from "lucide-react";
import PredictionBadge from "./PredictionBadge";
import TeamLogo from "./TeamLogo";
import LeagueLogo from "./LeagueLogo";
import BookmakerOdds from "./BookmakerOdds";

const predictionLabels = {
  "home_win": "Victoire Domicile",
  "draw": "Match Nul",
  "away_win": "Victoire Extérieur",
  "over_2.5": "Plus de 2.5 buts",
  "under_2.5": "Moins de 2.5 buts",
  "btts_yes": "Les 2 équipes marquent",
  "btts_no": "Les 2 ne marquent pas"
};

export default function AnalysisDialog({ match, open, onOpenChange, historyStats }) {
  if (!match) return null;

  const matchDate = new Date(match.match_date);
  
  const bookmakerOdds = {
    winamax: match.odds_winamax,
    betclic: match.odds_betclic,
    parionssport: match.odds_parionssport
  };

  const hasOdds = match.odds_winamax || match.odds_betclic || match.odds_parionssport;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Analyse IA détaillée
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Match Info */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="px-3 py-1 rounded-full bg-slate-700">
                <LeagueLogo league={match.league} size="sm" showName={true} />
              </div>
              <span className="text-sm text-slate-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(matchDate, "EEEE dd MMMM à HH:mm", { locale: fr })}
              </span>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="mx-auto mb-2">
                  <TeamLogo teamName={match.home_team} size="lg" />
                </div>
                <p className="font-bold text-lg">{match.home_team}</p>
              </div>
              <span className="text-2xl font-bold text-slate-500">VS</span>
              <div className="text-center">
                <div className="mx-auto mb-2">
                  <TeamLogo teamName={match.away_team} size="lg" />
                </div>
                <p className="font-bold text-lg">{match.away_team}</p>
              </div>
            </div>
          </div>

          {/* Bookmaker Odds */}
          {hasOdds && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <BookmakerOdds odds={bookmakerOdds} compact={false} />
            </div>
          )}

          {/* Prediction */}
          <div className="bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              Pronostic
            </h3>
            <div className="flex items-center justify-center">
              <PredictionBadge prediction={match.prediction} confidence={match.confidence} size="lg" />
            </div>
          </div>

          {/* Analysis */}
          {match.analysis && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Analyse
              </h3>
              <p className="text-slate-300 leading-relaxed">{match.analysis}</p>
            </div>
          )}

          {/* Historical Stats */}
          {historyStats && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-purple-400" />
                Historique de nos pronostics
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{historyStats.total}</p>
                  <p className="text-xs text-slate-400">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{historyStats.wins}</p>
                  <p className="text-xs text-slate-400">Gagnés</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{historyStats.winRate}%</p>
                  <p className="text-xs text-slate-400">Réussite</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}