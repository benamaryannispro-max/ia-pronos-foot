import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, Trophy, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import MatchCard from "@/components/MatchCard";
import AnalysisDialog from "@/components/AnalysisDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function HistoriqueMatchs() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedResult, setSelectedResult] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000
  });

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["historicalMatches"],
    queryFn: async () => {
      const allMatches = await base44.entities.Match.list("-match_date", 500);
      return allMatches.filter(m => 
        m.status === "finished" && 
        m.prediction
      );
    },
    staleTime: 5 * 60 * 1000
  });

  const leagues = [...new Set(matches.map(m => m.league))].sort();

  const getDateRange = (filter) => {
    const now = new Date();
    switch(filter) {
      case "today":
        return new Date(now.setHours(0, 0, 0, 0));
      case "week":
        return new Date(now.setDate(now.getDate() - 7));
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1));
      case "3months":
        return new Date(now.setMonth(now.getMonth() - 3));
      default:
        return null;
    }
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = searchTerm === "" || 
      match.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.away_team.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLeague = selectedLeague === "all" || match.league === selectedLeague;
    const matchesResult = selectedResult === "all" || match.result === selectedResult;
    
    const dateRange = getDateRange(dateFilter);
    const matchesDate = !dateRange || new Date(match.match_date) >= dateRange;
    
    return matchesSearch && matchesLeague && matchesResult && matchesDate;
  });

  const stats = {
    total: filteredMatches.length,
    wins: filteredMatches.filter(m => m.result === "win").length,
    losses: filteredMatches.filter(m => m.result === "loss").length,
    winRate: filteredMatches.length > 0 
      ? Math.round((filteredMatches.filter(m => m.result === "win").length / filteredMatches.length) * 100)
      : 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          Historique des Matchs
        </h1>
        <p className="text-slate-400">Tous les matchs analysés avec résultats</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">Total</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
          <div className="text-emerald-400 text-sm mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Gagnés
          </div>
          <div className="text-3xl font-bold text-emerald-400">{stats.wins}</div>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
          <div className="text-red-400 text-sm mb-1 flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            Perdus
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.losses}</div>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
          <div className="text-amber-400 text-sm mb-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Réussite
          </div>
          <div className="text-3xl font-bold text-amber-400">{stats.winRate}%</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/30 rounded-xl p-5 mb-6 border border-slate-700/30"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Filtres de recherche</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher une équipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          {/* League Filter */}
          <Select value={selectedLeague} onValueChange={setSelectedLeague}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue placeholder="Toutes les ligues" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">Toutes les ligues</SelectItem>
              {leagues.map(league => (
                <SelectItem key={league} value={league}>{league}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Result Filter */}
          <Select value={selectedResult} onValueChange={setSelectedResult}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue placeholder="Tous les résultats" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">Tous les résultats</SelectItem>
              <SelectItem value="win">✅ Gagnés</SelectItem>
              <SelectItem value="loss">❌ Perdus</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue placeholder="Toutes les dates" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">Toutes les dates</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">7 derniers jours</SelectItem>
              <SelectItem value="month">30 derniers jours</SelectItem>
              <SelectItem value="3months">3 derniers mois</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filters */}
        {(searchTerm || selectedLeague !== "all" || selectedResult !== "all" || dateFilter !== "all") && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedLeague("all");
                setSelectedResult("all");
                setDateFilter("all");
              }}
              className="text-slate-400 hover:text-white"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </motion.div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
        </div>
      ) : filteredMatches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Aucun match trouvé</p>
          <p className="text-slate-500 text-sm mt-2">
            Essayez de modifier vos filtres de recherche
          </p>
        </motion.div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-slate-400 text-sm">
              {filteredMatches.length} match{filteredMatches.length > 1 ? 's' : ''} trouvé{filteredMatches.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <MatchCard
                  match={match}
                  onViewDetails={(m) => setSelectedMatch(m)}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Analysis Dialog */}
      <AnalysisDialog
        match={selectedMatch}
        open={!!selectedMatch}
        onOpenChange={(open) => !open && setSelectedMatch(null)}
        historyStats={stats}
      />
    </div>
  );
}