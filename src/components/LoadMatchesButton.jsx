import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LEAGUES = [
  { name: "Ligue 1", country: "France" },
  { name: "Coupe de France", country: "France" },
  { name: "Premier League", country: "Angleterre" },
  { name: "La Liga", country: "Espagne" },
  { name: "Serie A", country: "Italie" },
  { name: "Bundesliga", country: "Allemagne" },
  { name: "Ligue des Champions", country: "Europe" },
  { name: "Europa League", country: "Europe" }
];

export default function LoadMatchesButton({ existingMatches, onMatchesLoaded }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const loadMatches = async () => {
    setIsLoading(true);
    setLoadedCount(0);

    try {
      // Utiliser l'API Football-Data.org pour récupérer les vrais matchs
      const result = await base44.functions.invoke('loadRealMatches', {});
      
      if (result.data?.success) {
        setLoadedCount(result.data.new_matches);
        onMatchesLoaded();
      }
    } catch (error) {
      console.error("Erreur chargement matchs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={loadMatches}
      disabled={isLoading}
      variant="outline"
      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Chargement...
        </>
      ) : loadedCount > 0 ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          {loadedCount} matchs ajoutés
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Charger les matchs
        </>
      )}
    </Button>
  );
}