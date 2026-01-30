import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CGU() {
  const sections = [
    {
      title: "1. Objet",
      content: "PronoFoot IA est une application de divertissement proposant des pronostics sportifs générés par intelligence artificielle. L'utilisation de cette application implique l'acceptation pleine et entière des présentes conditions générales."
    },
    {
      title: "2. Conditions d'accès",
      content: "L'accès à l'application est strictement réservé aux personnes majeures (18 ans et plus). En utilisant ce service, vous confirmez avoir l'âge légal requis. L'application est destinée à un usage personnel et non commercial."
    },
    {
      title: "3. Nature du service",
      content: "Les pronostics fournis sont générés par intelligence artificielle à titre informatif et de divertissement uniquement. Ils ne constituent en aucun cas une garantie de résultat, un conseil d'investissement ou une incitation au jeu. L'exactitude des pronostics n'est pas garantie."
    },
    {
      title: "4. Responsabilités",
      content: "L'utilisateur reconnaît que les paris sportifs comportent des risques financiers. PronoFoot IA décline toute responsabilité en cas de pertes financières résultant de l'utilisation des pronostics. L'utilisateur est seul responsable de ses décisions de pari et doit jouer de manière responsable."
    },
    {
      title: "5. Abonnement Premium",
      content: "L'abonnement Premium donne accès à des fonctionnalités avancées. Le paiement est traité de manière sécurisée via Stripe. L'utilisateur peut annuler son abonnement à tout moment. Aucun remboursement n'est effectué pour la période déjà payée."
    },
    {
      title: "6. Propriété intellectuelle",
      content: "Tous les contenus de l'application (textes, analyses, design, logos) sont protégés par le droit d'auteur. Toute reproduction ou utilisation commerciale sans autorisation est interdite."
    },
    {
      title: "7. Données personnelles",
      content: "Les données collectées (email, nom, historique) sont utilisées uniquement pour le fonctionnement du service. Consultez notre Politique de Confidentialité pour plus d'informations. Vos données ne sont jamais vendues à des tiers."
    },
    {
      title: "8. Modification des CGU",
      content: "PronoFoot IA se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements significatifs. L'utilisation continue de l'application après modification vaut acceptation des nouvelles conditions."
    },
    {
      title: "9. Résiliation",
      content: "PronoFoot IA se réserve le droit de suspendre ou résilier l'accès d'un utilisateur en cas de violation des présentes conditions, sans préavis ni remboursement."
    },
    {
      title: "10. Jeu responsable",
      content: "PronoFoot IA encourage le jeu responsable. Si vous ou un proche rencontrez des problèmes liés au jeu, contactez Joueurs Info Service au 09 74 75 13 13 (appel non surtaxé)."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Mentions Légales</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Conditions Générales d'Utilisation
            </h1>
            
            <p className="text-slate-400">
              Dernière mise à jour : 30 janvier 2026
            </p>
          </div>

          {/* Avertissement */}
          <Card className="bg-red-500/10 border-red-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="text-red-300 font-semibold text-lg">
                    ⚠️ Application de divertissement - Réservée aux 18 ans et plus
                  </p>
                  <p className="text-red-200 text-sm">
                    Les pronostics ne sont pas garantis. Jouez uniquement avec de l'argent que vous pouvez vous permettre de perdre. 
                    Le jeu peut être addictif. Joueurs Info Service : 09 74 75 13 13
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-slate-800/40 border-slate-700/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{section.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm">
              Pour toute question concernant ces conditions, contactez-nous à support@pronofoot-ia.com
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}