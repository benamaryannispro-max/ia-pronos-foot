import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await base44.entities.UserStats.filter({ user_email: user.email });
    let userStats = stats[0];

    const today = new Date().toISOString().split('T')[0];

    if (!userStats) {
      userStats = await base44.entities.UserStats.create({
        user_email: user.email,
        points: 0,
        level: 1,
        streak_days: 1,
        last_visit_date: today,
        badges: [],
        total_predictions: 0,
        total_wins: 0,
        best_streak: 0,
        current_win_streak: 0
      });
      
      return Response.json({ streak: 1, isNew: true });
    }

    const lastVisit = userStats.last_visit_date;
    
    if (lastVisit === today) {
      return Response.json({ streak: userStats.streak_days, isNew: false });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    const newBadges = [...(userStats.badges || [])];
    const notifications = [];

    if (lastVisit === yesterdayStr) {
      newStreak = (userStats.streak_days || 0) + 1;
      
      if (newStreak === 3 && !newBadges.includes("streak_3")) {
        newBadges.push("streak_3");
        notifications.push({ 
          type: "badge_earned", 
          title: "🔥 Badge débloqué !", 
          message: "En Feu - 3 jours consécutifs" 
        });
      }
      if (newStreak === 7 && !newBadges.includes("streak_7")) {
        newBadges.push("streak_7");
        notifications.push({ 
          type: "badge_earned", 
          title: "🔥 Badge Silver !", 
          message: "Inarrêtable - 7 jours consécutifs" 
        });
      }
      if (newStreak === 30 && !newBadges.includes("streak_30")) {
        newBadges.push("streak_30");
        notifications.push({ 
          type: "badge_earned", 
          title: "🔥 Badge Gold !", 
          message: "Légende - 30 jours consécutifs" 
        });
      }
    }

    await base44.entities.UserStats.update(userStats.id, {
      streak_days: newStreak,
      last_visit_date: today,
      badges: newBadges
    });

    for (const notif of notifications) {
      await base44.entities.Notification.create({
        user_email: user.email,
        ...notif
      });
    }

    return Response.json({ 
      streak: newStreak, 
      isNew: true,
      newBadges: notifications.map(n => n.message)
    });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});