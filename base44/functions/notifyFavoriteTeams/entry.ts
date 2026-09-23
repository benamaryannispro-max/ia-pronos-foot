import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const favorites = await base44.asServiceRole.entities.FavoriteTeam.list();
    const matches = await base44.asServiceRole.entities.Match.filter({ status: "upcoming" });
    
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const upcomingMatches = matches.filter(m => {
      const matchDate = new Date(m.match_date);
      return matchDate >= now && matchDate <= in24Hours;
    });
    
    let notificationsSent = 0;
    
    for (const fav of favorites) {
      const matchesForTeam = upcomingMatches.filter(m => 
        m.home_team.toLowerCase().includes(fav.team_name.toLowerCase()) ||
        m.away_team.toLowerCase().includes(fav.team_name.toLowerCase())
      );
      
      for (const match of matchesForTeam) {
        const existing = await base44.asServiceRole.entities.Notification.filter({
          user_email: fav.user_email,
          match_id: match.id,
          type: "favorite_team_playing"
        });
        
        if (existing.length === 0) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: fav.user_email,
            type: "favorite_team_playing",
            title: `❤️ ${fav.team_name} joue bientôt !`,
            message: `${match.home_team} vs ${match.away_team}`,
            match_id: match.id,
            priority: "high"
          });
          notificationsSent++;
        }
      }
    }
    
    return Response.json({ 
      success: true, 
      notificationsSent,
      message: `${notificationsSent} notifications envoyées`
    });
  } catch (error) {
    console.error("Erreur notifyFavoriteTeams:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});