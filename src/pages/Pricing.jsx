import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

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

  const handleSubscribe = async (plan) => {
    if (window.self !== window.top) {
      alert("Le paiement doit s'effectuer depuis l'application publiée. Veuillez ouvrir l'app dans un nouvel onglet.");
      return;
    }

    try {
      const response = await base44.functions.invoke('createCheckout', { plan });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Erreur checkout:", error);
      alert("Erreur lors de la création du paiement. Veuillez réessayer.");
    }
  };

  const plans = [
    {
      name: "Gratuit",
      price: 0,
      period: "mois",
      description: "Découvrez les pronostics IA",
      features: [
        "3 matchs par jour",
        "Pronostics basiques",
        "Statistiques limitées",
        "Avec publicités"
      ],
      limitations: true,
      buttonText: "Plan actuel",
      buttonVariant: "outline",
      planKey: null
    },
    {
      name: "Premium",
      price: billingPeriod === "monthly" ? 9.99 : 79.99,
      period: billingPeriod === "monthly" ? "mois" : "an",
      savings: billingPeriod === "yearly" ? "Économisez 33%" : null,
      description: "Accès illimité à tous les pronostics",
      features: [
        "Tous les matchs illimités",
        "Pronostics détaillés avec IA",
        "Statistiques avancées",
        "Historique complet",
        "Notifications en temps réel",
        "Analyses live des matchs",
        "Sans publicité",
        "Support prioritaire"
      ],
      highlighted: true,
      buttonText: isPremium ? "Abonnement actif" : "Devenir Premium",
      buttonVariant: "default",
      planKey: billingPeriod
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Tarifs simples et transparents</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choisissez votre <span className="text-amber-400">plan</span>
          </h1>
          
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Démarrez gratuitement ou passez Premium pour un accès illimité à tous les pronostics IA
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-4 p-2 bg-slate-800/50 rounded-full border border-slate-700">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingPeriod === "monthly"
                  ? "bg-amber-500 text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingPeriod === "yearly"
                  ? "bg-amber-500 text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Annuel
              <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                -33%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20"
                  : "bg-slate-800/50 border border-slate-700"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full">
                  <span className="text-xs font-bold text-black flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    RECOMMANDÉ
                  </span>
                </div>
              )}

              {plan.savings && (
                <div className="absolute -top-4 right-4 px-3 py-1 bg-emerald-500 rounded-full">
                  <span className="text-xs font-bold text-white">{plan.savings}</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">{plan.price}€</span>
                  <span className="text-slate-400">/ {plan.period}</span>
                </div>
              </div>

              <Button
                onClick={() => plan.planKey && handleSubscribe(plan.planKey)}
                disabled={plan.limitations || isPremium}
                size="lg"
                className={`w-full mb-6 text-base py-6 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold"
                    : ""
                }`}
                variant={plan.buttonVariant}
              >
                {plan.highlighted && <Crown className="w-4 h-4 mr-2" />}
                {plan.buttonText}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.highlighted ? "bg-amber-500" : "bg-slate-700"
                    }`}>
                      <Check className={`w-3 h-3 ${
                        plan.highlighted ? "text-black" : "text-slate-400"
                      }`} />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Questions fréquentes
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: "Puis-je annuler mon abonnement à tout moment ?",
                a: "Oui, vous pouvez annuler votre abonnement Premium à tout moment. Vous conserverez l'accès jusqu'à la fin de votre période de facturation."
              },
              {
                q: "Les pronostics sont-ils garantis ?",
                a: "Nos pronostics sont générés par IA avec analyse approfondie, mais le sport reste imprévisible. Nous affichons notre taux de réussite en toute transparence."
              },
              {
                q: "Comment fonctionne la version gratuite ?",
                a: "Avec la version gratuite, vous avez accès à 3 matchs par jour avec des pronostics basiques. Passez Premium pour un accès illimité."
              },
              {
                q: "Puis-je changer de forfait ?",
                a: "Oui, vous pouvez passer du forfait mensuel à annuel à tout moment pour bénéficier de la réduction."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
              >
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}