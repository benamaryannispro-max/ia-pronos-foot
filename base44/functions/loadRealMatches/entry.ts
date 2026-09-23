import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const LEAGUE_CODES = {
  "Ligue 1": "FL1",
  "Premier League": "PL",
  "La Liga": "PD",
  "Serie A": "SA",
  "Bundesliga": "BL1",
  "Ligue des Champions": "CL"
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const apiKey = Deno.env.get("FOOTBALL_DATA_API_KEY");
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const allMatches = [];
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Récupérer les matchs pour chaque ligue
    for (const [leagueName, leagueCode] of Object.entries(LEAGUE_CODES)) {
      try {
        const response = await fetch(
          `https://api.football-data.org/v4/competitions/${leagueCode}/matches?dateFrom=${today}&dateTo=${nextWeek}`,
          {
            headers: { 'X-Auth-Token': apiKey }
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          for (const match of data.matches || []) {
            allMatches.push({
              home_team: match.homeTeam.name,
              away_team: match.awayTeam.name,
              league: leagueName,
              match_date: match.utcDate,
              logo_home: match.homeTeam.crest,
              logo_away: match.awayTeam.crest,
              status: "upcoming",
              result: "pending",
              external_id: `fbd-${match.id}`
            });
          }
        }
        
        // Attendre entre les requêtes (limite de 10 req/min)
        await new Promise(resolve => setTimeout(resolve, 7000));
        
      } catch (error) {
        console.error(`Erreur ${leagueName}:`, error);
      }
    }

    // Récupérer les matchs existants
    const existingMatches = await base44.asServiceRole.entities.Match.list("-match_date", 500);
    const existingIds = new Set(existingMatches.map(m => m.external_id));

    // Filtrer les nouveaux matchs
    const newMatches = allMatches.filter(m => !existingIds.has(m.external_id));

    // Créer les nouveaux matchs
    if (newMatches.length > 0) {
      await base44.asServiceRole.entities.Match.bulkCreate(newMatches);
    }

    return Response.json({
      success: true,
      total_matches: allMatches.length,
      new_matches: newMatches.length,
      loaded_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Load matches error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});