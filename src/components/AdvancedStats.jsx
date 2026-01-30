import { motion } from "framer-motion";
import { TrendingUp, Target, Trophy, Zap, Award, BarChart3, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function AdvancedStats({ history = [] }) {
  const completedPredictions = history.filter(h => h.result !== "pending");
  const wins = history.filter(h => h.result === "win");
  
  // Stats par ligue
  const statsByLeague = {};
  completedPredictions.forEach(h => {
    if (!statsByLeague[h.league]) {
      statsByLeague[h.league] = { total: 0, wins: 0 };
    }
    statsByLeague[h.league].total++;
    if (h.result === "win") statsByLeague[h.league].wins++;
  });

  const leagueStats = Object.entries(statsByLeague)
    .map(([league, stats]) => ({
      league,
      ...stats,
      winRate: Math.round((stats.wins / stats.total) * 100)
    }))
    .sort((a, b) => b.winRate - a.winRate);

  // Stats par type de pari
  const statsByPredictionType = {};
  completedPredictions.forEach(h => {
    const type = h.prediction || "unknown";
    if (!statsByPredictionType[type]) {
      statsByPredictionType[type] = { total: 0, wins: 0 };
    }
    statsByPredictionType[type].total++;
    if (h.result === "win") statsByPredictionType[type].wins++;
  });

  const predictionTypeLabels = {
    "home_win": "Victoire Dom.",
    "draw": "Match Nul",
    "away_win": "Victoire Ext.",
    "over_2.5": "+2.5 buts",
    "under_2.5": "-2.5 buts",
    "btts_yes": "BTTS Oui",
    "btts_no": "BTTS Non"
  };

  const predictionTypeData = Object.entries(statsByPredictionType)
    .map(([type, stats]) => ({
      name: predictionTypeLabels[type] || type,
      winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0,
      wins: stats.wins,
      total: stats.total
    }));

  // Évolution dans le temps (7 derniers jours)
  const last30Days = completedPredictions.slice(0, 30).reverse();
  const evolutionData = [];
  let cumulativeWins = 0;
  let cumulativeTotal = 0;

  last30Days.forEach((h, index) => {
    cumulativeTotal++;
    if (h.result === "win") cumulativeWins++;
    
    if ((index + 1) % 5 === 0 || index === last30Days.length - 1) {
      evolutionData.push({
        point: Math.floor((index + 1) / 5) + 1,
        winRate: Math.round((cumulativeWins / cumulativeTotal) * 100)
      });
    }
  });

  const highConfidence = completedPredictions.filter(h => h.confidence >= 75);
  const highConfWinRate = highConfidence.length > 0 
    ? Math.round((highConfidence.filter(h => h.result === "win").length / highConfidence.length) * 100)
    : 0;

  const monthlyProfit = history
    .filter(h => {
      const date = new Date(h.created_date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((acc, h) => acc + (h.profit || 0), 0);

  const avgOdds = wins.length > 0
    ? (wins.reduce((acc, h) => acc + (h.odds || 1.5), 0) / wins.length).toFixed(2)
    : 0;

  const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* KPIs Premium */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-xl p-4 text-center"
        >
          <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-400">{highConfWinRate}%</p>
          <p className="text-xs text-slate-300">Confiance haute</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50 rounded-xl p-4 text-center"
        >
          <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-emerald-400">{monthlyProfit > 0 ? '+' : ''}{monthlyProfit.toFixed(0)}€</p>
          <p className="text-xs text-slate-300">Ce mois</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-xl p-4 text-center"
        >
          <BarChart3 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-cyan-400">{avgOdds}</p>
          <p className="text-xs text-slate-300">Cote moyenne</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 rounded-xl p-4 text-center"
        >
          <Award className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-400">{wins.length}</p>
          <p className="text-xs text-slate-300">Victoires</p>
        </motion.div>
      </div>

      {/* Graphiques */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Évolution du taux de réussite */}
        {evolutionData.length > 0 && (
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Évolution du taux de réussite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="point" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#cbd5e1' }}
                  />
                  <Line type="monotone" dataKey="winRate" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Réussite par type de pari */}
        {predictionTypeData.length > 0 && (
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Réussite par type de pari
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={predictionTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#cbd5e1' }}
                  />
                  <Bar dataKey="winRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats par ligue */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Performance par Compétition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leagueStats.slice(0, 8).map((stat, index) => (
              <div key={stat.league} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-slate-400 font-mono text-sm w-6">#{index + 1}</span>
                  <span className="text-white font-semibold text-sm truncate">{stat.league}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">{stat.wins}/{stat.total}</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold min-w-[60px] text-center ${
                    stat.winRate >= 70 ? "bg-emerald-500/20 text-emerald-400" :
                    stat.winRate >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-slate-700/50 text-slate-400"
                  }`}>
                    {stat.winRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}