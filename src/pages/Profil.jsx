import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Crown, Mail, User as UserIcon, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PremiumBadge from "@/components/PremiumBadge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Profil() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user.email,
        status: "active"
      });
      return subs[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  const isPremium = subscription && subscription.plan !== "free";

  const handleLogout = () => {
    base44.auth.logout();
  };

  const planLabels = {
    "premium_monthly": "Premium Mensuel",
    "premium_yearly": "Premium Annuel",
    "free": "Gratuit"
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* User Info Card */}
        <Card className="bg-slate-800/40 border-slate-700/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Mon Profil
              {isPremium && <PremiumBadge size="sm" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300">
              <UserIcon className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold">{user?.full_name || "Utilisateur"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Mail className="w-5 h-5 text-cyan-400" />
              <span>{user?.email}</span>
            </div>
            {user?.created_date && (
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Membre depuis {format(new Date(user.created_date), "MMMM yyyy", { locale: fr })}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="bg-slate-800/40 border-slate-700/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Abonnement</CardTitle>
          </CardHeader>
          <CardContent>
            {isPremium ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Plan actuel</span>
                  <span className="font-bold text-cyan-400 text-lg">
                    {planLabels[subscription.plan] || subscription.plan}
                  </span>
                </div>
                {subscription.start_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Actif depuis</span>
                    <span className="text-slate-300">
                      {format(new Date(subscription.start_date), "dd MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-4">
                  Gérez votre abonnement depuis votre compte Stripe
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-400 mb-6">Vous êtes sur le plan gratuit</p>
                <Link to={createPageUrl("Pricing")}>
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-base px-8">
                    <Crown className="w-5 h-5 mr-2" />
                    Passer Premium
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          size="lg"
          className="w-full border-slate-700/30 text-slate-300 hover:bg-slate-800/50"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Se déconnecter
        </Button>
      </motion.div>
    </div>
  );
}