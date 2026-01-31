import { useState } from "react";
import { cn } from "@/lib/utils";
import LeagueLogo from "./LeagueLogo";

const leagues = [
  { id: "all", name: "Tous" },
  { id: "Ligue 1", name: "Ligue 1" },
  { id: "Coupe de France", name: "Coupe de France" },
  { id: "Premier League", name: "Premier League" },
  { id: "La Liga", name: "La Liga" },
  { id: "Serie A", name: "Serie A" },
  { id: "Bundesliga", name: "Bundesliga" },
  { id: "Ligue des Champions", name: "Champions League" },
  { id: "Europa League", name: "Europa League" }
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
          {league.id === "all" ? (
            <>
              <span>🌍</span>
              <span>Tous</span>
            </>
          ) : (
            <LeagueLogo league={league.id} size="xs" showName={true} />
          )}
        </button>
      ))}
    </div>
  );
}