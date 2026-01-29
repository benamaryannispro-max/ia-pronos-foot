import { cn } from "@/lib/utils";

const bookmakers = [
  {
    id: "winamax",
    name: "Winamax",
    color: "from-red-600 to-red-800",
    textColor: "text-white",
    logo: "🔴"
  },
  {
    id: "betclic",
    name: "Betclic",
    color: "from-orange-500 to-orange-700",
    textColor: "text-white",
    logo: "🟠"
  },
  {
    id: "parionssport",
    name: "Parions Sport",
    color: "from-green-600 to-green-800",
    textColor: "text-white",
    logo: "🟢"
  }
];

export default function BookmakerOdds({ odds, compact = false }) {
  if (!odds || Object.keys(odds).length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {bookmakers.map((bookie) => {
          const bookieOdds = odds[bookie.id];
          if (!bookieOdds) return null;
          
          return (
            <div
              key={bookie.id}
              className={cn(
                "px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r flex items-center gap-1",
                bookie.color,
                bookie.textColor
              )}
            >
              <span>{bookie.logo}</span>
              <span className="font-bold">{bookieOdds.recommended?.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-slate-400 mb-2">Cotes des bookmakers</h4>
      <div className="grid grid-cols-3 gap-2">
        {bookmakers.map((bookie) => {
          const bookieOdds = odds[bookie.id];
          if (!bookieOdds) return null;
          
          return (
            <div
              key={bookie.id}
              className={cn(
                "rounded-xl p-3 bg-gradient-to-br",
                bookie.color,
                bookie.textColor
              )}
            >
              <div className="text-xs font-medium opacity-90 mb-1">{bookie.name}</div>
              <div className="grid grid-cols-3 gap-1 text-center text-xs">
                <div>
                  <div className="opacity-70">1</div>
                  <div className="font-bold">{bookieOdds.home?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="opacity-70">N</div>
                  <div className="font-bold">{bookieOdds.draw?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="opacity-70">2</div>
                  <div className="font-bold">{bookieOdds.away?.toFixed(2)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}