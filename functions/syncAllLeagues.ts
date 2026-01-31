import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const LEAGUES = [
  "Ligue 1",
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga"
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = [];

    // Sync each league sequentially to avoid rate limits
    for (const league of LEAGUES) {
      try {
        const response = await base44.asServiceRole.functions.invoke('syncFootballData', { league });
        results.push({
          league,
          success: true,
          data: response.data
        });
        
        // Wait 7 seconds between requests (10 requests/minute limit)
        await new Promise(resolve => setTimeout(resolve, 7000));
      } catch (error) {
        console.error(`Error syncing ${league}:`, error);
        results.push({
          league,
          success: false,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      results,
      total_leagues: LEAGUES.length,
      synced_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sync all error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});