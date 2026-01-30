import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HistoryFilters({ filters, onFilterChange, leagues = [] }) {
  const predictionTypeLabels = {
    "all": "Tous les types",
    "home_win": "Victoire Domicile",
    "draw": "Match Nul",
    "away_win": "Victoire Extérieur",
    "over_2.5": "+2.5 buts",
    "under_2.5": "-2.5 buts",
    "btts_yes": "BTTS Oui",
    "btts_no": "BTTS Non"
  };

  const dateRanges = {
    "all": "Toute période",
    "7days": "7 derniers jours",
    "30days": "30 derniers jours",
    "90days": "90 derniers jours"
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <Select value={filters.league} onValueChange={(value) => onFilterChange({ ...filters, league: value })}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700">
            <SelectValue placeholder="Ligue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les ligues</SelectItem>
            {leagues.map(league => (
              <SelectItem key={league} value={league}>{league}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <Select value={filters.predictionType} onValueChange={(value) => onFilterChange({ ...filters, predictionType: value })}>
          <SelectTrigger className="w-44 bg-slate-800/50 border-slate-700">
            <SelectValue placeholder="Type de pari" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(predictionTypeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-slate-400" />
        <Select value={filters.dateRange} onValueChange={(value) => onFilterChange({ ...filters, dateRange: value })}>
          <SelectTrigger className="w-44 bg-slate-800/50 border-slate-700">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(dateRanges).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFilterChange({ league: "all", predictionType: "all", dateRange: "all" })}
        className="text-slate-400 hover:text-white"
      >
        Réinitialiser
      </Button>
    </div>
  );
}