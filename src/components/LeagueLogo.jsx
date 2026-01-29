import { useState } from "react";

const leagueLogos = {
  "Ligue 1": "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c2/Ligue_1_Uber_Eats_Logo.svg/1200px-Ligue_1_Uber_Eats_Logo.svg.png",
  "Premier League": "https://upload.wikimedia.org/wikipedia/fr/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
  "La Liga": "https://upload.wikimedia.org/wikipedia/fr/thumb/1/13/LaLiga.svg/1200px-LaLiga.svg.png",
  "Serie A": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/e9/Serie_A_logo_2022.svg/1200px-Serie_A_logo_2022.svg.png",
  "Bundesliga": "https://upload.wikimedia.org/wikipedia/fr/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png",
  "Ligue des Champions": "https://upload.wikimedia.org/wikipedia/fr/thumb/b/bf/UEFA_Champions_League_logo_2.svg/1200px-UEFA_Champions_League_logo_2.svg.png",
  "Champions League": "https://upload.wikimedia.org/wikipedia/fr/thumb/b/bf/UEFA_Champions_League_logo_2.svg/1200px-UEFA_Champions_League_logo_2.svg.png",
  "Europa League": "https://upload.wikimedia.org/wikipedia/fr/thumb/0/03/UEFA_Europa_League_logo.svg/1200px-UEFA_Europa_League_logo.svg.png",
  "Conference League": "https://upload.wikimedia.org/wikipedia/fr/thumb/9/92/UEFA_Europa_Conference_League_Logo.svg/1200px-UEFA_Europa_Conference_League_Logo.svg.png"
};

const leagueEmojis = {
  "Ligue 1": "🇫🇷",
  "Premier League": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "La Liga": "🇪🇸",
  "Serie A": "🇮🇹",
  "Bundesliga": "🇩🇪",
  "Ligue des Champions": "⭐",
  "Champions League": "⭐",
  "Europa League": "🏆",
  "Conference League": "🎖️"
};

export default function LeagueLogo({ league, size = "sm", showName = true }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = leagueLogos[league];
  const emoji = leagueEmojis[league] || "⚽";

  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  if (!logoUrl || imgError) {
    return (
      <div className="flex items-center gap-1.5">
        <span>{emoji}</span>
        {showName && <span>{league}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <img
          src={logoUrl}
          alt={league}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
      {showName && <span className="text-sm">{league}</span>}
    </div>
  );
}