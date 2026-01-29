import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LEAGUES = [
  { name: "Ligue 1", country: "France" },
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
      // Utiliser l'IA avec recherche internet pour récupérer les matchs à venir
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Donne-moi la liste des matchs de football des 7 prochains jours pour ces compétitions:
- Ligue 1 (France)
- Premier League (Angleterre)
- La Liga (Espagne)
- Serie A (Italie)
- Bundesliga (Allemagne)
- Ligue des Champions
- Europa League

Pour chaque match, donne: l'équipe à domicile, l'équipe à l'extérieur, la compétition, et la date/heure exacte du match.
Donne uniquement les matchs confirmés avec des dates précises.
Nous sommes en janvier/février 2025.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  home_team: { type: "string" },
                  away_team: { type: "string" },
                  league: { type: "string" },
                  match_date: { type: "string", description: "Format ISO: YYYY-MM-DDTHH:MM:SS" }
                },
                required: ["home_team", "away_team", "league", "match_date"]
              }
            }
          },
          required: ["matches"]
        }
      });

      if (result.matches && result.matches.length > 0) {
        // Filtrer les matchs qui existent déjà
        const existingKeys = new Set(
          existingMatches.map(m => `${m.home_team}-${m.away_team}-${m.match_date?.split('T')[0]}`.toLowerCase())
        );

        const newMatches = result.matches.filter(m => {
          const key = `${m.home_team}-${m.away_team}-${m.match_date?.split('T')[0]}`.toLowerCase();
          return !existingKeys.has(key);
        });

        // Créer les nouveaux matchs
        if (newMatches.length > 0) {
          const matchesToCreate = newMatches.map(m => ({
            ...m,
            status: "upcoming",
            result: "pending",
            external_id: `${m.home_team}-${m.away_team}-${m.match_date}`.toLowerCase().replace(/\s/g, '-')
          }));

          await base44.entities.Match.bulkCreate(matchesToCreate);
          setLoadedCount(newMatches.length);
        }

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
      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
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