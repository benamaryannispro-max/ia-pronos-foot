import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

const leagues = [
  "Ligue 1",
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue des Champions",
  "Europa League",
  "Coupe du Monde",
  "Euro"
];

export default function AddMatchDialog({ onAddMatch, isLoading }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    home_team: "",
    away_team: "",
    league: "",
    match_date: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddMatch(formData);
    setFormData({ home_team: "", away_team: "", league: "", match_date: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un match
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nouveau match à analyser</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Équipe domicile</Label>
              <Input
                value={formData.home_team}
                onChange={(e) => setFormData({ ...formData, home_team: e.target.value })}
                placeholder="Ex: PSG"
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Équipe extérieur</Label>
              <Input
                value={formData.away_team}
                onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
                placeholder="Ex: Marseille"
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-slate-300">Compétition</Label>
            <Select
              value={formData.league}
              onValueChange={(value) => setFormData({ ...formData, league: value })}
              required
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Sélectionner une compétition" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {leagues.map((league) => (
                  <SelectItem key={league} value={league} className="text-white hover:bg-slate-700">
                    {league}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-slate-300">Date et heure du match</Label>
            <Input
              type="datetime-local"
              value={formData.match_date}
              onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              "Créer le match"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}