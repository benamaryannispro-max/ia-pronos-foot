import { cn } from "@/lib/utils";

const leagues = [
  { id: "all", name: "Tous", emoji: "🌍" },
  { id: "Ligue 1", name: "Ligue 1", emoji: "🇫🇷" },
  { id: "Premier League", name: "Premier League", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "La Liga", name: "La Liga", emoji: "🇪🇸" },
  { id: "Serie A", name: "Serie A", emoji: "🇮🇹" },
  { id: "Bundesliga", name: "Bundesliga", emoji: "🇩🇪" },
  { id: "Ligue des Champions", name: "Champions League", emoji: "⭐" },
  { id: "Europa League", name: "Europa League", emoji: "🏆" }
];

export default function LeagueFilter({ selectedLeague, onLeagueChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {leagues.map((league) => (
        <button
          key={league.id}
          onClick={() => onLeagueChange(league.id)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            "border flex items-center gap-1.5",
            selectedLeague === league.id
              ? "bg-amber-500 text-black border-amber-500"
              : "bg-slate-800/50 text-slate-300 border-slate-700 hover:border-amber-500/50"
          )}
        >
          <span>{league.emoji}</span>
          <span className="hidden sm:inline">{league.name}</span>
        </button>
      ))}
    </div>
  );
}