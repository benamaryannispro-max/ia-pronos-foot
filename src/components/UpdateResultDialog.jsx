import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function UpdateResultDialog({ match, open, onOpenChange, onUpdate, isLoading }) {
  const [score, setScore] = useState(match?.final_score || "");
  const [result, setResult] = useState(match?.result || "pending");

  const handleSubmit = () => {
    onUpdate(match.id, {
      final_score: score,
      result: result,
      status: "finished"
    });
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Mettre à jour le résultat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="text-center p-4 bg-slate-800/50 rounded-xl">
            <p className="font-semibold">{match.home_team} vs {match.away_team}</p>
            <p className="text-sm text-slate-400">{match.league}</p>
          </div>

          <div className="space-y-2">
            <Label>Score final</Label>
            <Input
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Ex: 2 - 1"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Résultat du pronostic</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={result === "win" ? "default" : "outline"}
                onClick={() => setResult("win")}
                className={result === "win" 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "border-slate-600 hover:bg-slate-800"
                }
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Gagné
              </Button>
              <Button
                type="button"
                variant={result === "loss" ? "default" : "outline"}
                onClick={() => setResult("loss")}
                className={result === "loss" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "border-slate-600 hover:bg-slate-800"
                }
              >
                <XCircle className="w-4 h-4 mr-2" />
                Perdu
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !score || result === "pending"}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Enregistrer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}