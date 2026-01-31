import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const LEAGUE_CODES = {
  "Ligue 1": "FL1",
  "Premier League": "PL",
  "La Liga": "PD",
  "Serie A": "SA",
  "Bundesliga": "BL1",
  "Ligue des Champions": "CL",
  "Europa League": "EL"
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

    const { league } = await req.json();
    const leagueCode = LEAGUE_CODES[league];

    if (!leagueCode) {
      return Response.json({ error: 'League not supported' }, { status: 400 });
    }

    // Fetch standings
    const standingsRes = await fetch(
      `https://api.football-data.org/v4/competitions/${leagueCode}/standings`,
      {
        headers: { 'X-Auth-Token': apiKey }
      }
    );

    if (!standingsRes.ok) {
      console.error('Football-Data API error:', await standingsRes.text());
      return Response.json({ error: 'Failed to fetch data' }, { status: standingsRes.status });
    }

    const standingsData = await standingsRes.json();
    const table = standingsData.standings?.[0]?.table || [];

    // Update or create league standing
    const existingStanding = await base44.asServiceRole.entities.LeagueStanding.filter({
      league,
      season: standingsData.season?.startDate ? standingsData.season.startDate.substring(0, 4) + '/' + standingsData.season.endDate.substring(0, 4) : "2024/2025"
    });

    const standingsPayload = {
      league,
      season: standingsData.season?.startDate ? standingsData.season.startDate.substring(0, 4) + '/' + standingsData.season.endDate.substring(0, 4) : "2024/2025",
      standings: table.map(t => ({
        position: t.position,
        team_name: t.team.name,
        played: t.playedGames,
        won: t.won,
        draw: t.draw,
        lost: t.lost,
        points: t.points,
        goals_for: t.goalsFor,
        goals_against: t.goalsAgainst,
        goal_difference: t.goalDifference
      })),
      last_updated: new Date().toISOString()
    };

    if (existingStanding[0]) {
      await base44.asServiceRole.entities.LeagueStanding.update(existingStanding[0].id, standingsPayload);
    } else {
      await base44.asServiceRole.entities.LeagueStanding.create(standingsPayload);
    }

    // Update team stats
    for (const team of table) {
      const existingTeam = await base44.asServiceRole.entities.TeamStats.filter({
        team_name: team.team.name,
        league
      });

      const teamPayload = {
        team_name: team.team.name,
        league,
        external_id: team.team.id,
        logo_url: team.team.crest,
        form: team.form || "",
        wins: team.won,
        draws: team.draw,
        losses: team.lost,
        goals_for: team.goalsFor,
        goals_against: team.goalsAgainst,
        points: team.points,
        position: team.position,
        played_games: team.playedGames,
        last_updated: new Date().toISOString()
      };

      if (existingTeam[0]) {
        await base44.asServiceRole.entities.TeamStats.update(existingTeam[0].id, teamPayload);
      } else {
        await base44.asServiceRole.entities.TeamStats.create(teamPayload);
      }
    }

    return Response.json({
      success: true,
      league,
      teams_updated: table.length,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});