import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { predictionResult } = await req.json();

    const stats = await base44.entities.UserStats.filter({ user_email: user.email });
    let userStats = stats[0];

    if (!userStats) {
      userStats = await base44.entities.UserStats.create({
        user_email: user.email,
        points: 0,
        level: 1,
        streak_days: 0,
        badges: [],
        total_predictions: 0,
        total_wins: 0,
        best_streak: 0,
        current_win_streak: 0
      });
    }

    const newTotalPredictions = userStats.total_predictions + 1;
    const newTotalWins = predictionResult === 'win' ? userStats.total_wins + 1 : userStats.total_wins;
    const newWinStreak = predictionResult === 'win' ? userStats.current_win_streak + 1 : 0;
    const newBestStreak = Math.max(userStats.best_streak || 0, newWinStreak);

    const pointsEarned = predictionResult === 'win' ? 10 : 0;
    const newPoints = userStats.points + pointsEarned;
    const newLevel = Math.floor(newPoints / 100) + 1;

    const newBadges = [...(userStats.badges || [])];
    const notifications = [];

    if (newTotalPredictions === 1 && !newBadges.includes("first_prediction")) {
      newBadges.push("first_prediction");
      notifications.push({ type: "badge_earned", title: "🌟 Badge débloqué !", message: "Première Étoile - Votre 1er pronostic" });
    }
    if (newTotalPredictions === 5 && !newBadges.includes("5_predictions")) {
      newBadges.push("5_predictions");
      notifications.push({ type: "badge_earned", title: "🏅 Badge Bronze !", message: "Débutant - 5 pronostics" });
    }
    if (newTotalPredictions === 20 && !newBadges.includes("20_predictions")) {
      newBadges.push("20_predictions");
      notifications.push({ type: "badge_earned", title: "🥈 Badge Silver !", message: "Régulier - 20 pronostics" });
    }
    if (newTotalPredictions === 50 && !newBadges.includes("50_predictions")) {
      newBadges.push("50_predictions");
      notifications.push({ type: "badge_earned", title: "🥇 Badge Gold !", message: "Expert - 50 pronostics" });
    }
    if (newTotalPredictions === 100 && !newBadges.includes("100_predictions")) {
      newBadges.push("100_predictions");
      notifications.push({ type: "badge_earned", title: "👑 Badge Gold !", message: "Maître - 100 pronostics" });
    }
    if (newTotalWins === 1 && !newBadges.includes("first_win")) {
      newBadges.push("first_win");
      notifications.push({ type: "badge_earned", title: "⚡ Badge débloqué !", message: "1ère Victoire" });
    }
    if (newTotalWins === 10 && !newBadges.includes("10_wins")) {
      newBadges.push("10_wins");
      notifications.push({ type: "badge_earned", title: "📈 Badge Silver !", message: "Vainqueur - 10 victoires" });
    }

    await base44.entities.UserStats.update(userStats.id, {
      points: newPoints,
      level: newLevel,
      total_predictions: newTotalPredictions,
      total_wins: newTotalWins,
      current_win_streak: newWinStreak,
      best_streak: newBestStreak,
      badges: newBadges
    });

    for (const notif of notifications) {
      await base44.entities.Notification.create({
        user_email: user.email,
        ...notif
      });
    }

    return Response.json({ 
      success: true, 
      newBadges: notifications.map(n => n.message),
      points: newPoints,
      level: newLevel
    });
  } catch (error) {
    console.error("Error updating user stats:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});