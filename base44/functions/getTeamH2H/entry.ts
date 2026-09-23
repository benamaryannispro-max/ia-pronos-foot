import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get("FOOTBALL_DATA_API_KEY");
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const { homeTeam, awayTeam } = await req.json();

    // Get team IDs from our database
    const homeStats = await base44.entities.TeamStats.filter({ team_name: homeTeam });
    const awayStats = await base44.entities.TeamStats.filter({ team_name: awayTeam });

    if (!homeStats[0]?.external_id || !awayStats[0]?.external_id) {
      return Response.json({
        success: false,
        message: 'Team IDs not found. Please sync data first.'
      });
    }

    // Fetch head-to-head matches
    const h2hRes = await fetch(
      `https://api.football-data.org/v4/teams/${homeStats[0].external_id}/matches?limit=100`,
      {
        headers: { 'X-Auth-Token': apiKey }
      }
    );

    if (!h2hRes.ok) {
      console.error('H2H API error:', await h2hRes.text());
      return Response.json({ error: 'Failed to fetch H2H data' }, { status: h2hRes.status });
    }

    const h2hData = await h2hRes.json();
    
    // Filter matches between these two teams
    const h2hMatches = h2hData.matches.filter(m => 
      (m.homeTeam.id === homeStats[0].external_id && m.awayTeam.id === awayStats[0].external_id) ||
      (m.homeTeam.id === awayStats[0].external_id && m.awayTeam.id === homeStats[0].external_id)
    ).slice(0, 5); // Last 5 matches

    const h2hSummary = h2hMatches.map(m => {
      const score = m.score.fullTime;
      return `${m.homeTeam.name} ${score.home}-${score.away} ${m.awayTeam.name}`;
    });

    return Response.json({
      success: true,
      matches: h2hMatches.length,
      summary: h2hSummary,
      detailed_matches: h2hMatches
    });

  } catch (error) {
    console.error('H2H error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});