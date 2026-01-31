import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import SyncDataButton from "@/components/SyncDataButton";

export default function Classement() {
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: allStats = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.list("-points", 100);
      return stats;
    },
    staleTime: 60000
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    staleTime: 300000
  });

  const leaderboard = allStats.map(stat => {
    const userData = users.find(u => u.email === stat.user_email);
    return {
      ...stat,
      full_name: userData?.full_name || "Utilisateur"
    };
  });

  const userRank = leaderboard.findIndex(s => s.user_email === user?.email) + 1;

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return "from-yellow-500/20 to-amber-500/20 border-yellow-500/50";
    if (rank === 2) return "from-slate-400/20 to-slate-500/20 border-slate-400/50";
    if (rank === 3) return "from-orange-500/20 to-amber-600/20 border-orange-500/50";
    return "from-slate-800/40 to-slate-900/40 border-slate-700/30";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-400">Classement</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Top Pronostiqueurs</h1>
        {userRank > 0 && (
          <p className="text-slate-400">Votre rang : #{userRank}</p>
        )}
        
        {user?.role === 'admin' && (
          <div className="mt-4">
            <SyncDataButton 
              onSyncComplete={() => {
                queryClient.invalidateQueries({ queryKey: ['teamStats'] });
                queryClient.invalidateQueries({ queryKey: ['leagueStandings'] });
              }}
            />
          </div>
        )}
      </motion.div>

      {/* Podium Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2ème place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-br from-slate-400/20 to-slate-500/20 border-2 border-slate-400/50 rounded-2xl p-4 text-center">
              <Medal className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-400 mb-1">2</p>
              <p className="font-bold text-white text-sm truncate">{leaderboard[1].full_name}</p>
              <div className="mt-3 space-y-1">
                <p className="text-xl font-bold text-cyan-400">{leaderboard[1].points}</p>
                <p className="text-xs text-slate-400">points</p>
              </div>
            </div>
          </motion.div>

          {/* 1ère place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
              👑 CHAMPION
            </div>
            <div className="bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border-2 border-yellow-500/60 rounded-2xl p-6 text-center shadow-lg shadow-yellow-500/20">
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-yellow-400 mb-1">1</p>
              <p className="font-bold text-white truncate">{leaderboard[0].full_name}</p>
              <div className="mt-4 space-y-1">
                <p className="text-2xl font-bold text-cyan-400">{leaderboard[0].points}</p>
                <p className="text-xs text-slate-400">points</p>
              </div>
              {leaderboard[0].streak_days > 0 && (
                <div className="mt-3 flex items-center justify-center gap-1 text-orange-400">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-bold">{leaderboard[0].streak_days} jours</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* 3ème place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-br from-orange-600/20 to-amber-600/20 border-2 border-orange-600/50 rounded-2xl p-4 text-center">
              <Medal className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600 mb-1">3</p>
              <p className="font-bold text-white text-sm truncate">{leaderboard[2].full_name}</p>
              <div className="mt-3 space-y-1">
                <p className="text-xl font-bold text-cyan-400">{leaderboard[2].points}</p>
                <p className="text-xs text-slate-400">points</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reste du classement */}
      <div className="space-y-3">
        {leaderboard.slice(3).map((stat, index) => {
          const rank = index + 4;
          const isCurrentUser = stat.user_email === user?.email;
          
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "bg-slate-800/40 border rounded-xl p-4 flex items-center gap-4",
                isCurrentUser ? "border-cyan-500/50 bg-cyan-500/5" : "border-slate-700/30"
              )}
            >
              <div className="w-10 h-10 bg-slate-700/50 rounded-full flex items-center justify-center">
                <span className="font-bold text-slate-400">#{rank}</span>
              </div>

              <div className="flex-1">
                <p className={cn("font-bold", isCurrentUser ? "text-cyan-400" : "text-white")}>
                  {stat.full_name}
                  {isCurrentUser && <span className="ml-2 text-xs text-cyan-400">(Vous)</span>}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span>{stat.total_wins}/{stat.total_predictions} victoires</span>
                  {stat.streak_days > 0 && (
                    <span className="flex items-center gap-1 text-orange-400">
                      <Flame className="w-3 h-3" />
                      {stat.streak_days}j
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-400">{stat.points}</p>
                <p className="text-xs text-slate-500">points</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-700" />
          <p>Aucun classement pour le moment</p>
        </div>
      )}
    </div>
  );
}