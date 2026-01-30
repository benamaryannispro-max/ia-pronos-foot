import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, Loader2, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function UpdateLogosButton({ matches, onComplete }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedCount, setUpdatedCount] = useState(0);

  const updateLogos = async () => {
    setIsUpdating(true);
    setUpdatedCount(0);

    try {
      // Filtrer les matchs sans logos
      const matchesWithoutLogos = matches.filter(m => !m.logo_home || !m.logo_away);
      
      if (matchesWithoutLogos.length === 0) {
        setIsUpdating(false);
        return;
      }

      // Traiter par batch de 5 matchs
      for (let i = 0; i < matchesWithoutLogos.length; i += 5) {
        const batch = matchesWithoutLogos.slice(i, i + 5);
        
        // Récupérer les logos pour ce batch
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Trouve les URLs des logos officiels pour ces équipes de football:
${batch.map(m => `- ${m.home_team}\n- ${m.away_team}`).join('\n')}

Pour chaque équipe, donne l'URL directe du logo officiel (PNG ou SVG) depuis Wikipedia ou le site officiel du club.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              logos: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    team_name: { type: "string" },
                    logo_url: { type: "string" }
                  }
                }
              }
            }
          }
        });

        // Créer un mapping des logos
        const logoMap = {};
        if (result.logos) {
          result.logos.forEach(item => {
            const normalized = item.team_name.toLowerCase().trim();
            logoMap[normalized] = item.logo_url;
          });
        }

        // Mettre à jour chaque match du batch
        for (const match of batch) {
          const homeKey = match.home_team.toLowerCase().trim();
          const awayKey = match.away_team.toLowerCase().trim();
          
          const logoHome = logoMap[homeKey] || match.logo_home;
          const logoAway = logoMap[awayKey] || match.logo_away;

          if (logoHome || logoAway) {
            await base44.entities.Match.update(match.id, {
              logo_home: logoHome,
              logo_away: logoAway
            });
          }
        }

        setUpdatedCount(prev => prev + batch.length);
      }

      onComplete();
    } catch (error) {
      console.error("Erreur mise à jour logos:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const matchesWithoutLogos = matches.filter(m => !m.logo_home || !m.logo_away).length;

  if (matchesWithoutLogos === 0) {
    return null;
  }

  return (
    <Button
      onClick={updateLogos}
      disabled={isUpdating}
      variant="outline"
      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
    >
      {isUpdating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Mise à jour {updatedCount}/{matchesWithoutLogos}...
        </>
      ) : (
        <>
          <Image className="w-4 h-4 mr-2" />
          Ajouter les logos ({matchesWithoutLogos} matchs)
        </>
      )}
    </Button>
  );
}