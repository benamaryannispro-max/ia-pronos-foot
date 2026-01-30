import { motion } from "framer-motion";
import { Lock, Shield, Eye, Database, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Confidentialite() {
  const sections = [
    {
      title: "1. Données collectées",
      icon: Database,
      content: "Nous collectons les données suivantes : adresse email, nom complet, historique de pronostics consultés, préférences d'équipes favorites (pour les abonnés Premium), et données de paiement (via Stripe, nous ne stockons pas les informations bancaires)."
    },
    {
      title: "2. Utilisation des données",
      icon: Eye,
      content: "Vos données sont utilisées exclusivement pour : fournir le service de pronostics, personnaliser votre expérience, envoyer des notifications de matchs, gérer votre abonnement, et améliorer nos algorithmes d'intelligence artificielle. Vos données ne sont jamais vendues à des tiers."
    },
    {
      title: "3. Protection des données",
      icon: Shield,
      content: "Nous utilisons des protocoles de sécurité standards de l'industrie (HTTPS, chiffrement des données sensibles, authentification sécurisée). Vos données sont hébergées sur des serveurs sécurisés conformes aux normes européennes de protection des données (RGPD)."
    },
    {
      title: "4. Cookies et traceurs",
      icon: Lock,
      content: "Nous utilisons des cookies essentiels pour le fonctionnement de l'application (authentification, préférences). Des cookies analytiques peuvent être utilisés pour améliorer le service. Vous pouvez désactiver les cookies non essentiels dans les paramètres de votre navigateur."
    },
    {
      title: "5. Vos droits",
      icon: UserCheck,
      content: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Vous pouvez exercer ces droits en nous contactant à privacy@pronofoot-ia.com. Vous pouvez également supprimer votre compte à tout moment depuis votre profil."
    },
    {
      title: "6. Conservation des données",
      content: "Les données de votre compte sont conservées tant que celui-ci est actif. En cas de suppression de compte, vos données personnelles sont effacées sous 30 jours. Les données anonymisées peuvent être conservées à des fins statistiques."
    },
    {
      title: "7. Partage des données",
      content: "Vos données ne sont partagées qu'avec nos prestataires techniques essentiels : Stripe (paiements), Base44 (hébergement), et services d'envoi d'emails. Ces prestataires sont contractuellement tenus de respecter la confidentialité de vos données."
    },
    {
      title: "8. Mineurs",
      content: "Notre service est strictement réservé aux personnes de 18 ans et plus. Nous ne collectons pas sciemment de données de mineurs. Si vous pensez qu'un mineur a créé un compte, contactez-nous immédiatement."
    },
    {
      title: "9. Modifications",
      content: "Cette politique peut être mise à jour occasionnellement. Nous vous informerons des changements importants par email. La date de dernière mise à jour est indiquée en haut de cette page."
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4">
              <Lock className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Confidentialité & RGPD</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Politique de Confidentialité
            </h1>
            
            <p className="text-slate-400">
              Dernière mise à jour : 30 janvier 2026
            </p>
          </div>

          {/* Trust badge */}
          <Card className="bg-emerald-500/10 border-emerald-500/30 mb-8">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-300 font-semibold">
                Vos données sont protégées et ne sont jamais vendues à des tiers
              </p>
              <p className="text-emerald-200 text-sm mt-2">
                Conforme RGPD • Hébergement sécurisé • Chiffrement des données
              </p>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-slate-800/40 border-slate-700/30">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        {Icon && <Icon className="w-5 h-5 text-cyan-400" />}
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 leading-relaxed">{section.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Contact */}
          <div className="mt-12 text-center">
            <Card className="bg-slate-800/40 border-slate-700/30">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-white mb-2">Contactez-nous</h3>
                <p className="text-slate-400 mb-4">
                  Pour toute question sur la protection de vos données personnelles :
                </p>
                <a href="mailto:privacy@pronofoot-ia.com" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  privacy@pronofoot-ia.com
                </a>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}