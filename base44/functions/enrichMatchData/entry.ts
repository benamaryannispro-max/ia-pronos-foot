import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId } = await req.json();

    if (!matchId) {
      return Response.json({ error: 'Match ID required' }, { status: 400 });
    }

    const match = await base44.entities.Match.get(matchId);
    if (!match) {
      return Response.json({ error: 'Match not found' }, { status: 404 });
    }

    // Fetch team stats for both teams
    const homeTeamStats = await base44.entities.TeamStats.filter({
      team_name: match.home_team,
      league: match.league
    });

    const awayTeamStats = await base44.entities.TeamStats.filter({
      team_name: match.away_team,
      league: match.league
    });

    const homeStats = homeTeamStats[0];
    const awayStats = awayTeamStats[0];

    // Build enriched analysis
    let enrichedAnalysis = "";

    if (homeStats && awayStats) {
      enrichedAnalysis = `📊 **Statistiques enrichies**\n\n`;
      
      enrichedAnalysis += `**${match.home_team}** (${homeStats.position}e, ${homeStats.points} pts)\n`;
      enrichedAnalysis += `- Forme: ${homeStats.form || "N/A"}\n`;
      enrichedAnalysis += `- V-N-D: ${homeStats.wins}-${homeStats.draws}-${homeStats.losses}\n`;
      enrichedAnalysis += `- Buts: ${homeStats.goals_for} marqués, ${homeStats.goals_against} encaissés\n\n`;

      enrichedAnalysis += `**${match.away_team}** (${awayStats.position}e, ${awayStats.points} pts)\n`;
      enrichedAnalysis += `- Forme: ${awayStats.form || "N/A"}\n`;
      enrichedAnalysis += `- V-N-D: ${awayStats.wins}-${awayStats.draws}-${awayStats.losses}\n`;
      enrichedAnalysis += `- Buts: ${awayStats.goals_for} marqués, ${awayStats.goals_against} encaissés\n\n`;

      // Add to existing analysis
      const existingAnalysis = match.analysis || "";
      const updatedAnalysis = enrichedAnalysis + "\n" + existingAnalysis;

      await base44.entities.Match.update(matchId, {
        analysis: updatedAnalysis,
        logo_home: homeStats.logo_url || match.logo_home,
        logo_away: awayStats.logo_url || match.logo_away
      });

      return Response.json({
        success: true,
        enriched: true,
        home_stats: homeStats,
        away_stats: awayStats
      });
    } else {
      return Response.json({
        success: true,
        enriched: false,
        message: 'Team stats not found. Run syncFootballData first.'
      });
    }

  } catch (error) {
    console.error('Enrich error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});