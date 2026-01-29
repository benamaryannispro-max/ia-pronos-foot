import { useState } from "react";

// Mapping des noms d'équipes vers leurs logos (API-Football ou logos publics)
const getTeamLogoUrl = (teamName) => {
  // Normaliser le nom
  const normalized = teamName?.toLowerCase().trim();
  
  // Logos des équipes principales (utilise l'API logo.clearbit.com ou logos connus)
  const teamLogos = {
    // Ligue 1
    "psg": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/86/Paris_Saint-Germain_Logo.svg/1200px-Paris_Saint-Germain_Logo.svg.png",
    "paris saint-germain": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/86/Paris_Saint-Germain_Logo.svg/1200px-Paris_Saint-Germain_Logo.svg.png",
    "paris sg": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/86/Paris_Saint-Germain_Logo.svg/1200px-Paris_Saint-Germain_Logo.svg.png",
    "marseille": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/43/Logo_Olympique_de_Marseille.svg/1200px-Logo_Olympique_de_Marseille.svg.png",
    "olympique de marseille": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/43/Logo_Olympique_de_Marseille.svg/1200px-Logo_Olympique_de_Marseille.svg.png",
    "om": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/43/Logo_Olympique_de_Marseille.svg/1200px-Logo_Olympique_de_Marseille.svg.png",
    "lyon": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/e2/Olympique_lyonnais_%28logo%29.svg/1200px-Olympique_lyonnais_%28logo%29.svg.png",
    "olympique lyonnais": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/e2/Olympique_lyonnais_%28logo%29.svg/1200px-Olympique_lyonnais_%28logo%29.svg.png",
    "ol": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/e2/Olympique_lyonnais_%28logo%29.svg/1200px-Olympique_lyonnais_%28logo%29.svg.png",
    "monaco": "https://upload.wikimedia.org/wikipedia/fr/thumb/b/ba/AS_Monaco_FC.svg/1200px-AS_Monaco_FC.svg.png",
    "as monaco": "https://upload.wikimedia.org/wikipedia/fr/thumb/b/ba/AS_Monaco_FC.svg/1200px-AS_Monaco_FC.svg.png",
    "lille": "https://upload.wikimedia.org/wikipedia/fr/thumb/6/62/Logo_LOSC_Lille_2018.svg/1200px-Logo_LOSC_Lille_2018.svg.png",
    "losc": "https://upload.wikimedia.org/wikipedia/fr/thumb/6/62/Logo_LOSC_Lille_2018.svg/1200px-Logo_LOSC_Lille_2018.svg.png",
    "rennes": "https://upload.wikimedia.org/wikipedia/fr/thumb/9/9e/Logo_Stade_Rennais_FC.svg/1200px-Logo_Stade_Rennais_FC.svg.png",
    "stade rennais": "https://upload.wikimedia.org/wikipedia/fr/thumb/9/9e/Logo_Stade_Rennais_FC.svg/1200px-Logo_Stade_Rennais_FC.svg.png",
    "lens": "https://upload.wikimedia.org/wikipedia/fr/thumb/f/f9/Logo_RC_Lens.svg/1200px-Logo_RC_Lens.svg.png",
    "rc lens": "https://upload.wikimedia.org/wikipedia/fr/thumb/f/f9/Logo_RC_Lens.svg/1200px-Logo_RC_Lens.svg.png",
    "nice": "https://upload.wikimedia.org/wikipedia/fr/thumb/2/2e/Logo_OGC_Nice_2013.svg/1200px-Logo_OGC_Nice_2013.svg.png",
    "ogc nice": "https://upload.wikimedia.org/wikipedia/fr/thumb/2/2e/Logo_OGC_Nice_2013.svg/1200px-Logo_OGC_Nice_2013.svg.png",
    "strasbourg": "https://upload.wikimedia.org/wikipedia/fr/thumb/d/d5/Logo_Racing_Club_de_Strasbourg.svg/1200px-Logo_Racing_Club_de_Strasbourg.svg.png",
    "nantes": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/44/Logo_FC_Nantes_2019.svg/1200px-Logo_FC_Nantes_2019.svg.png",
    "fc nantes": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/44/Logo_FC_Nantes_2019.svg/1200px-Logo_FC_Nantes_2019.svg.png",
    "montpellier": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Montpellier_H%C3%A9rault_Sport_Club_%28logo%2C_2000%29.svg/1200px-Montpellier_H%C3%A9rault_Sport_Club_%28logo%2C_2000%29.svg.png",
    "reims": "https://upload.wikimedia.org/wikipedia/fr/thumb/0/0e/Stade_de_Reims_Logo.svg/1200px-Stade_de_Reims_Logo.svg.png",
    "toulouse": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/5e/Toulouse_FC_2018.svg/1200px-Toulouse_FC_2018.svg.png",
    "brest": "https://upload.wikimedia.org/wikipedia/fr/thumb/0/05/Logo_Stade_Brestois.svg/1200px-Logo_Stade_Brestois.svg.png",
    "lorient": "https://upload.wikimedia.org/wikipedia/fr/thumb/6/6b/Logo_FC_Lorient.svg/1200px-Logo_FC_Lorient.svg.png",
    "auxerre": "https://upload.wikimedia.org/wikipedia/fr/thumb/d/df/AJ_Auxerre.svg/1200px-AJ_Auxerre.svg.png",
    "angers": "https://upload.wikimedia.org/wikipedia/fr/thumb/0/0d/Logo_Angers_SCO.svg/1200px-Logo_Angers_SCO.svg.png",
    "le havre": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/ed/Logo_Havre_AC.svg/1200px-Logo_Havre_AC.svg.png",
    "saint-etienne": "https://upload.wikimedia.org/wikipedia/fr/thumb/f/fd/Logo_AS_Saint-%C3%89tienne.svg/1200px-Logo_AS_Saint-%C3%89tienne.svg.png",
    
    // Premier League
    "manchester city": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/43/Logo_Manchester_City_2016.svg/1200px-Logo_Manchester_City_2016.svg.png",
    "man city": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/43/Logo_Manchester_City_2016.svg/1200px-Logo_Manchester_City_2016.svg.png",
    "manchester united": "https://upload.wikimedia.org/wikipedia/fr/thumb/b/b9/Logo_Manchester_United.svg/1200px-Logo_Manchester_United.svg.png",
    "man utd": "https://upload.wikimedia.org/wikipedia/fr/thumb/b/b9/Logo_Manchester_United.svg/1200px-Logo_Manchester_United.svg.png",
    "liverpool": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/54/Logo_FC_Liverpool.svg/1200px-Logo_FC_Liverpool.svg.png",
    "arsenal": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png",
    "chelsea": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/5c/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png",
    "tottenham": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/8f/Tottenham_Hotspur_Logo.svg/1200px-Tottenham_Hotspur_Logo.svg.png",
    "tottenham hotspur": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/8f/Tottenham_Hotspur_Logo.svg/1200px-Tottenham_Hotspur_Logo.svg.png",
    "newcastle": "https://upload.wikimedia.org/wikipedia/fr/thumb/1/15/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png",
    "newcastle united": "https://upload.wikimedia.org/wikipedia/fr/thumb/1/15/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png",
    "aston villa": "https://upload.wikimedia.org/wikipedia/fr/thumb/3/3e/Aston_villa_fc.svg/1200px-Aston_villa_fc.svg.png",
    "brighton": "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c1/Brighton_Hove_Albion_logo.svg/1200px-Brighton_Hove_Albion_logo.svg.png",
    "west ham": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/e0/West_Ham_United_FC.svg/1200px-West_Ham_United_FC.svg.png",
    "crystal palace": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/8f/Crystal_Palace_FC_logo.svg/1200px-Crystal_Palace_FC_logo.svg.png",
    "brentford": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/ef/Logo_Brentford_FC_2017.svg/1200px-Logo_Brentford_FC_2017.svg.png",
    "fulham": "https://upload.wikimedia.org/wikipedia/fr/thumb/7/7c/Fulham_FC_%28logo%2C_2001%29.svg/1200px-Fulham_FC_%28logo%2C_2001%29.svg.png",
    "everton": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/4e/Logo_Everton.svg/1200px-Logo_Everton.svg.png",
    "bournemouth": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/e5/Logo_AFC_Bournemouth_2013.svg/1200px-Logo_AFC_Bournemouth_2013.svg.png",
    "wolves": "https://upload.wikimedia.org/wikipedia/fr/thumb/1/1e/Wolverhampton_Wanderers_FC.svg/1200px-Wolverhampton_Wanderers_FC.svg.png",
    "wolverhampton": "https://upload.wikimedia.org/wikipedia/fr/thumb/1/1e/Wolverhampton_Wanderers_FC.svg/1200px-Wolverhampton_Wanderers_FC.svg.png",
    "nottingham forest": "https://upload.wikimedia.org/wikipedia/fr/thumb/b/b4/Logo_Nottingham_Forest.svg/1200px-Logo_Nottingham_Forest.svg.png",
    "ipswich": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/8c/Logo_Ipswich_Town_FC.svg/1200px-Logo_Ipswich_Town_FC.svg.png",
    "leicester": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/4d/Logo_Leicester_City_FC.svg/1200px-Logo_Leicester_City_FC.svg.png",
    "southampton": "https://upload.wikimedia.org/wikipedia/fr/thumb/d/d8/Southampton_FC.svg/1200px-Southampton_FC.svg.png",
    
    // La Liga
    "real madrid": "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c7/Logo_Real_Madrid.svg/1200px-Logo_Real_Madrid.svg.png",
    "barcelona": "https://upload.wikimedia.org/wikipedia/fr/thumb/a/a1/Logo_FC_Barcelona.svg/1200px-Logo_FC_Barcelona.svg.png",
    "fc barcelona": "https://upload.wikimedia.org/wikipedia/fr/thumb/a/a1/Logo_FC_Barcelona.svg/1200px-Logo_FC_Barcelona.svg.png",
    "atletico madrid": "https://upload.wikimedia.org/wikipedia/fr/thumb/9/93/Logo_Atl%C3%A9tico_Madrid_2017.svg/1200px-Logo_Atl%C3%A9tico_Madrid_2017.svg.png",
    "sevilla": "https://upload.wikimedia.org/wikipedia/fr/thumb/9/92/Logo_Sevilla_FC_2007.svg/1200px-Logo_Sevilla_FC_2007.svg.png",
    "real sociedad": "https://upload.wikimedia.org/wikipedia/fr/thumb/3/3e/Real_Sociedad_Logo.svg/1200px-Real_Sociedad_Logo.svg.png",
    "villarreal": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/4e/Villarreal_CF_Logo.svg/1200px-Villarreal_CF_Logo.svg.png",
    "athletic bilbao": "https://upload.wikimedia.org/wikipedia/fr/thumb/6/6b/Logo_Athletic_Bilbao.svg/1200px-Logo_Athletic_Bilbao.svg.png",
    "real betis": "https://upload.wikimedia.org/wikipedia/fr/thumb/a/a4/Real_Betis_Logo.svg/1200px-Real_Betis_Logo.svg.png",
    "valencia": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/8e/Valence_CF_Logo.svg/1200px-Valence_CF_Logo.svg.png",
    "getafe": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/46/Getafe_CF.svg/1200px-Getafe_CF.svg.png",
    "osasuna": "https://upload.wikimedia.org/wikipedia/fr/thumb/0/0c/CA_Osasuna_Logo.svg/1200px-CA_Osasuna_Logo.svg.png",
    "celta vigo": "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c5/RC_Celta_de_Vigo.svg/1200px-RC_Celta_de_Vigo.svg.png",
    "mallorca": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/43/Real_Club_Deportivo_Mallorca_Logo.svg/1200px-Real_Club_Deportivo_Mallorca_Logo.svg.png",
    "girona": "https://upload.wikimedia.org/wikipedia/fr/thumb/c/cc/Logo_Girona_FC.svg/1200px-Logo_Girona_FC.svg.png",
    "rayo vallecano": "https://upload.wikimedia.org/wikipedia/fr/thumb/9/93/Rayo_Vallecano_Logo.svg/1200px-Rayo_Vallecano_Logo.svg.png",
    "almeria": "https://upload.wikimedia.org/wikipedia/fr/thumb/9/9e/UD_Almeria.svg/1200px-UD_Almeria.svg.png",
    "las palmas": "https://upload.wikimedia.org/wikipedia/fr/thumb/4/49/UD_Las_Palmas_Logo.svg/1200px-UD_Las_Palmas_Logo.svg.png",
    "alaves": "https://upload.wikimedia.org/wikipedia/fr/thumb/1/18/Logo_Deportivo_Alaves.svg/1200px-Logo_Deportivo_Alaves.svg.png",
    "cadiz": "https://upload.wikimedia.org/wikipedia/fr/thumb/1/18/Cadiz_CF.svg/1200px-Cadiz_CF.svg.png",
    "granada": "https://upload.wikimedia.org/wikipedia/fr/thumb/a/a1/Granada_CF.svg/1200px-Granada_CF.svg.png",
    
    // Serie A
    "inter milan": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/1200px-FC_Internazionale_Milano_2021.svg.png",
    "inter": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/1200px-FC_Internazionale_Milano_2021.svg.png",
    "ac milan": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png",
    "milan": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png",
    "juventus": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/1200px-Juventus_FC_2017_icon_%28black%29.svg.png",
    "napoli": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/SSC_Neapel.svg/1200px-SSC_Neapel.svg.png",
    "roma": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/80/AS_Roma_Logo_2017.svg/1200px-AS_Roma_Logo_2017.svg.png",
    "as roma": "https://upload.wikimedia.org/wikipedia/fr/thumb/8/80/AS_Roma_Logo_2017.svg/1200px-AS_Roma_Logo_2017.svg.png",
    "lazio": "https://upload.wikimedia.org/wikipedia/fr/thumb/9/9b/SS_Lazio_Logo_2023.svg/1200px-SS_Lazio_Logo_2023.svg.png",
    "atalanta": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/5e/Atalanta_BC_Logo_2023.svg/1200px-Atalanta_BC_Logo_2023.svg.png",
    "fiorentina": "https://upload.wikimedia.org/wikipedia/fr/thumb/a/a1/ACF_Fiorentina.svg/1200px-ACF_Fiorentina.svg.png",
    "torino": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/5a/Torino_FC_Logo.svg/1200px-Torino_FC_Logo.svg.png",
    "bologna": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/e3/Logo_Bologna_FC_2022.svg/1200px-Logo_Bologna_FC_2022.svg.png",
    "udinese": "https://upload.wikimedia.org/wikipedia/fr/thumb/7/7e/Udinese_Calcio_Logo.svg/1200px-Udinese_Calcio_Logo.svg.png",
    "sassuolo": "https://upload.wikimedia.org/wikipedia/fr/thumb/0/08/US_Sassuolo_Calcio_Logo.svg/1200px-US_Sassuolo_Calcio_Logo.svg.png",
    "monza": "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c0/AC_Monza_Logo.svg/1200px-AC_Monza_Logo.svg.png",
    "genoa": "https://upload.wikimedia.org/wikipedia/fr/thumb/6/65/Genoa_CFC_Logo.svg/1200px-Genoa_CFC_Logo.svg.png",
    "lecce": "https://upload.wikimedia.org/wikipedia/fr/thumb/9/94/US_Lecce_Logo.svg/1200px-US_Lecce_Logo.svg.png",
    "cagliari": "https://upload.wikimedia.org/wikipedia/fr/thumb/7/7e/Cagliari_Calcio_Logo.svg/1200px-Cagliari_Calcio_Logo.svg.png",
    "verona": "https://upload.wikimedia.org/wikipedia/fr/thumb/9/9e/Hellas_V%C3%A9rone_logo.svg/1200px-Hellas_V%C3%A9rone_logo.svg.png",
    "empoli": "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c7/Empoli_FC_Logo.svg/1200px-Empoli_FC_Logo.svg.png",
    "frosinone": "https://upload.wikimedia.org/wikipedia/fr/thumb/0/0a/Frosinone_Calcio_Logo.svg/1200px-Frosinone_Calcio_Logo.svg.png",
    "salernitana": "https://upload.wikimedia.org/wikipedia/fr/thumb/1/19/US_Salernitana_1919_Logo.svg/1200px-US_Salernitana_1919_Logo.svg.png",
    
    // Bundesliga
    "bayern munich": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
    "bayern": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
    "borussia dortmund": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png",
    "dortmund": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png",
    "bvb": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png",
    "rb leipzig": "https://upload.wikimedia.org/wikipedia/fr/thumb/0/04/RB_Leipzig_2014_logo.svg/1200px-RB_Leipzig_2014_logo.svg.png",
    "leipzig": "https://upload.wikimedia.org/wikipedia/fr/thumb/0/04/RB_Leipzig_2014_logo.svg/1200px-RB_Leipzig_2014_logo.svg.png",
    "bayer leverkusen": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/ed/Bayer_Leverkusen_Logo.svg/1200px-Bayer_Leverkusen_Logo.svg.png",
    "leverkusen": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/ed/Bayer_Leverkusen_Logo.svg/1200px-Bayer_Leverkusen_Logo.svg.png",
    "eintracht frankfurt": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Eintracht_Frankfurt_Logo.svg/1200px-Eintracht_Frankfurt_Logo.svg.png",
    "frankfurt": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Eintracht_Frankfurt_Logo.svg/1200px-Eintracht_Frankfurt_Logo.svg.png",
    "wolfsburg": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Logo-VfL-Wolfsburg.svg/1200px-Logo-VfL-Wolfsburg.svg.png",
    "borussia monchengladbach": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Borussia_M%C3%B6nchengladbach_logo.svg/1200px-Borussia_M%C3%B6nchengladbach_logo.svg.png",
    "monchengladbach": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Borussia_M%C3%B6nchengladbach_logo.svg/1200px-Borussia_M%C3%B6nchengladbach_logo.svg.png",
    "freiburg": "https://upload.wikimedia.org/wikipedia/fr/thumb/d/d0/SC_Freiburg_Logo.svg/1200px-SC_Freiburg_Logo.svg.png",
    "union berlin": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/1._FC_Union_Berlin_Logo.svg/1200px-1._FC_Union_Berlin_Logo.svg.png",
    "hoffenheim": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Logo_TSG_Hoffenheim.svg/1200px-Logo_TSG_Hoffenheim.svg.png",
    "mainz": "https://upload.wikimedia.org/wikipedia/fr/thumb/e/e6/1._FSV_Mainz_05_Logo.svg/1200px-1._FSV_Mainz_05_Logo.svg.png",
    "werder bremen": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/SV-Werder-Bremen-Logo.svg/1200px-SV-Werder-Bremen-Logo.svg.png",
    "bremen": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/SV-Werder-Bremen-Logo.svg/1200px-SV-Werder-Bremen-Logo.svg.png",
    "augsburg": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/56/FC_Augsburg_Logo.svg/1200px-FC_Augsburg_Logo.svg.png",
    "koln": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/5e/FC_Cologne_Logo.svg/1200px-FC_Cologne_Logo.svg.png",
    "cologne": "https://upload.wikimedia.org/wikipedia/fr/thumb/5/5e/FC_Cologne_Logo.svg/1200px-FC_Cologne_Logo.svg.png",
    "bochum": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/VfL_Bochum_Logo.svg/1200px-VfL_Bochum_Logo.svg.png",
    "heidenheim": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/1._FC_Heidenheim_1846.svg/1200px-1._FC_Heidenheim_1846.svg.png",
    "darmstadt": "https://upload.wikimedia.org/wikipedia/fr/thumb/6/65/SV_Darmstadt_98_Logo.svg/1200px-SV_Darmstadt_98_Logo.svg.png",
    "stuttgart": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/VfB_Stuttgart_1893_Logo.svg/1200px-VfB_Stuttgart_1893_Logo.svg.png",
  };

  // Chercher une correspondance
  for (const [key, url] of Object.entries(teamLogos)) {
    if (normalized?.includes(key) || key.includes(normalized || "")) {
      return url;
    }
  }

  return null;
};

export default function TeamLogo({ teamName, size = "md" }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getTeamLogoUrl(teamName);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-14 h-14",
    lg: "w-20 h-20"
  };

  if (!logoUrl || imgError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-slate-700/50 flex items-center justify-center text-xl`}>
        ⚽
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-white/10 flex items-center justify-center p-1.5 overflow-hidden`}>
      <img
        src={logoUrl}
        alt={teamName}
        className="w-full h-full object-contain"
        onError={() => setImgError(true)}
      />
    </div>
  );
}