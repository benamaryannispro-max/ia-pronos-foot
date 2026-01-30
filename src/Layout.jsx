import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Trophy, BarChart3, User, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/NotificationBell";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";

export default function Layout({ children }) {
  const location = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000
  });

  useEffect(() => {
    if (user?.email) {
      base44.functions.invoke('trackVisit', {});
    }
  }, [user?.email]);
  
  const navItems = [
    { name: "Accueil", icon: Home, path: "" },
    { name: "Matchs", icon: Trophy, path: "Matchs" },
    { name: "Classement", icon: Award, path: "Classement" },
    { name: "Profil", icon: User, path: "Profil" }
  ];

  const isActive = (path) => {
    if (path === "") return location.pathname === "/" || location.pathname === "";
    return location.pathname.includes(path);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        :root {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
        }
        
        body {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #475569 transparent;
        }
        
        *::-webkit-scrollbar {
          width: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background-color: #475569;
          border-radius: 20px;
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-10" />
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Prono<span className="text-cyan-400">Foot</span>
          </h1>
          {user && <NotificationBell userEmail={user.email} />}
        </div>
      </div>

      {/* Content */}
      <div className="pb-32">
        {children}
      </div>

      {/* Disclaimer */}
      <div className="fixed bottom-16 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/50 py-2 z-40">
        <p className="text-center text-xs text-slate-500">
          ⚠️ Pronostics non garantis • Pour divertissement uniquement • Jouez responsable
        </p>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/50 z-50">
        <div className="max-w-7xl mx-auto px-2">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 px-2 transition-all",
                    active 
                      ? "text-cyan-400" 
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Icon className={cn(
                    "w-6 h-6 mb-1",
                    active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  )} />
                  <span className="text-xs font-semibold">{item.name}</span>
                  {active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}