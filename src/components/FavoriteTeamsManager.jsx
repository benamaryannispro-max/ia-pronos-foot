import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Plus, Trash2, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TeamLogo from "./TeamLogo";
import { toast } from "sonner";

export default function FavoriteTeamsManager({ userEmail }) {
  const [newTeam, setNewTeam] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', userEmail],
    queryFn: () => base44.entities.FavoriteTeam.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (teamName) => base44.entities.FavoriteTeam.create({
      user_email: userEmail,
      team_name: teamName
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setNewTeam("");
      setIsAdding(false);
      toast.success("Équipe favorite ajoutée !", {
        description: "Vous serez notifié quand elle jouera"
      });
    }
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: (id) => base44.entities.FavoriteTeam.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success("Équipe retirée des favoris");
    }
  });

  const handleAdd = () => {
    if (newTeam.trim()) {
      addFavoriteMutation.mutate(newTeam.trim());
    }
  };

  return (
    <Card className="bg-slate-800/40 border-slate-700/30">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          Mes Équipes Favorites
          <div className="ml-auto flex items-center gap-1 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
            <Bell className="w-3 h-3" />
            Notifications actives
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Liste des favoris */}
          <AnimatePresence>
            {favorites.map((fav) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
              >
                <div className="flex items-center gap-3">
                  <TeamLogo teamName={fav.team_name} size="sm" logoUrl={fav.logo_url} />
                  <span className="text-white font-semibold">{fav.team_name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteFavoriteMutation.mutate(fav.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Ajouter un favori */}
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <Input
                placeholder="Nom de l'équipe..."
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="bg-slate-700/50 border-slate-600 text-white"
                autoFocus
              />
              <Button onClick={handleAdd} disabled={!newTeam.trim() || addFavoriteMutation.isPending}>
                Ajouter
              </Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>
                Annuler
              </Button>
            </motion.div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="w-full border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-cyan-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une équipe favorite
            </Button>
          )}

          <p className="text-xs text-slate-500 text-center mt-4">
            🔔 Vous recevrez une notification quand vos équipes favorites joueront
          </p>
        </div>
      </CardContent>
    </Card>
  );
}