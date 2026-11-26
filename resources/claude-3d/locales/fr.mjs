// Texte français. Même forme que zh.mjs, avec en plus les entrées du catalogue que zh garde dans ../catalog.mjs.
// Les espaces insécables et les apostrophes typographiques sont posées par build.mjs : écrire ici « mot », x : y, 3 secondes.
// Vocabulaire Blender : celui de l'interface française de Blender 5.2 (Rendre l'animation, Éclairage zone,
// Prévisualisation du matériau, Précalcul, Fréquence d'images, Image clé, Argile, frame).
export default {
  htmlLang: 'fr',
  title: 'Réaliser une vidéo 3D avec Claude',
  description: "Apprendre à construire un plan 3D à partir d'un fichier Blender d'appareil photo, et consulter des outils, des exemples et des estimations de rendu.",
  titleJoin: ' | ',
  descriptionJoin: '. ',
  chrome: {
    skip: 'Aller au contenu', hub: 'Tous les guides', brand: 'Manuel vidéo', nav: 'Rubriques du guide', languages: 'Langue',
    theme: 'Changer de thème', themeLabel: 'Thème', references: 'Références'
  },
  pages: {
    home: {nav: 'Méthodes', title: 'Méthodes'},
    tools: {nav: 'Outils', title: 'Comparatif des outils'},
    cases: {nav: 'Exemples', title: 'Exemples'},
    estimate: {nav: 'Estimations', title: 'Estimations de temps et de coût'},
    handbook: {nav: 'Manuel', title: 'Manuel de projet'}
  },
  common: {download: 'Télécharger le fichier Blender', study: "Étude d'un appareil bi-objectif"},
  home: {
    h1: 'La vidéo 3D<br> avec Claude',
    intro: 'Commencez par cet appareil photo bi-objectif. Ouvrez la scène, déplacez la caméra ou changez de jeu de lumières, et regardez ce que devient le même plan.',
    sample: "Voir l'extrait de 3 secondes",
    alt: 'Appareil photo bi-objectif vert foncé, rendu dans Blender avec ses matériaux',
    viewsLabel: 'Changer de vue de rendu',
    views: {studio: 'Matériaux', clay: 'Argile', detail: 'Gros plan'},
    routesTitle: 'Choisir une méthode selon le livrable',
    routesLabel: 'Livrable',
    routes: {
      native: ['Scène modifiable', 'Scène Blender', 'Gardez les modèles, les caméras et les matériaux dans un même fichier. Si le client veut changer la distance focale ou un reflet, vous relancez le rendu des plans concernés.'],
      code: ['Gabarit vidéo', 'Gabarit Remotion', "Passez les textes, les couleurs et le format d'image en paramètres. La timeline du générique se réutilise, et chaque version linguistique s'exporte séparément."],
      video: ['Clips générés', "Vidéo générée d'après des images de référence", "Fixez une image de référence du sujet, puis écrivez l'action et le cadrage de chaque plan séparément. Gardez les clips candidats et disposez-les dans un logiciel de montage."]
    },
    related: 'Voir les outils associés',
    adviser: 'Affiner selon le sujet et le matériel',
    subject: 'Sujet filmé',
    subjects: {product: 'Produit physique', ui: 'Interface logicielle', scene: 'Architecture ou environnement', story: 'Personnages ou récit'},
    machine: 'Matériel de production',
    machines: {laptop: 'Ordinateur portable courant', mac: 'Mac Apple Silicon', gpu: 'Carte graphique dédiée ou machine de rendu'}
  },
  tools: {
    search: 'Rechercher un outil', searchPlaceholder: 'Nom, usage ou mise en œuvre', category: 'Catégorie', allCategories: 'Toutes les catégories',
    viewComparison: 'Voir le comparatif', compare: 'Comparer', compareAria: 'Comparer {name}', details: 'Limites et mise en œuvre',
    limit: 'Limites', setup: 'Mise en œuvre', none: 'Aucun outil ne correspond à ces filtres.', reset: 'Effacer les filtres',
    selected: 'Outils sélectionnés', clear: 'Vider le comparatif', hint: "Cochez des outils dans la liste pour en comparer jusqu'à trois."
  },
  cases: {
    videoLabel: "Plan en orbite autour de l'appareil bi-objectif, muet, 3 secondes",
    spec: 'Blender 5.2 · 24 fps · 72 images',
    text: "La caméra tourne de 48 degrés autour du boîtier. Mettez en pause sur l'image où le reflet sur la lentille est le plus marqué, ouvrez le fichier, déplacez l'éclairage zone placé à l'avant gauche et comparez les reflets sur la lentille.",
    openVideo: 'Ouvrir la vidéo',
    exercise: 'Modifier ce plan avec Claude',
    exerciseIntro: 'Donnez cette consigne et le nom du fichier à un Claude capable de piloter Blender.',
    exercisePrompt: "Ouvre twin-66.blend et va à la frame 48. Déplace l'éclairage zone Key strip d'une demi-unité Blender vers la gauche, en le gardant orienté vers le centre du boîtier. Rends une image avant la modification et une après, puis compare le reflet sur la lentille du haut. Enregistre la scène modifiée sous le nom twin-light.blend.",
    worksTitle: 'Films et démonstrations techniques',
    type: "Type d'exemple",
    allTypes: 'Tous les types'
  },
  estimate: {
    index: "Types d'estimation",
    pricePlaceholder: 'Prix unitaire',
    calculators: {
      render: {
        title: 'Temps de rendu',
        intro: 'Saisissez le temps mesuré pour une image sur la machine cible.',
        fields: {seconds: 'Durée (secondes)', fps: "Fréquence d'images (fps)", per: 'Temps par image (secondes)'},
        note: "Le nombre d'images est arrondi à l'entier supérieur, puis multiplié par le temps par image. Le résultat suppose une seule machine qui rend sans interruption.",
        source: "Sortie d'animation dans Blender"
      },
      quota: {
        title: "Quota d'abonnement",
        intro: "Relevez l'écart d'usage avant et après un essai, à l'intérieur d'une même fenêtre de limite.",
        fields: {percent: "Usage de l'essai (%)", tested: "Plans de l'essai", shots: 'Plans prévus'},
        note: "Usage de l'essai × plans prévus ÷ plans de l'essai. Valable seulement pour des tâches proches par le modèle, le contexte et la complexité.",
        source: "Limites d'utilisation de Claude"
      },
      api: {
        title: "Coût de l'API",
        intro: 'Reprenez les prix unitaires dans la grille tarifaire du modèle utilisé. Les montants sont en dollars américains.',
        fields: {input: "Tokens d'entrée", output: 'Tokens de sortie', inprice: "Prix d'entrée ($ par million de tokens)", outprice: 'Prix de sortie ($ par million de tokens)'},
        note: "Les tokens d'entrée et de sortie sont multipliés chacun par leur prix unitaire, puis divisés par un million. Le cache, les remises du traitement par lots et les crédits vidéo externes se comptent à part.",
        source: "Grille tarifaire d'Anthropic"
      }
    }
  },
  handbook: {
    index: 'Chapitres du manuel',
    workflow: 'Du storyboard à la livraison',
    prompt: 'Prompt du kit de développement',
    sources: 'Références',
    steps: [
      ['Noter les exigences de livraison', "Notez la durée, la fréquence d'images, le format d'image et les exigences sonores. Si les fichiers sources 3D sont à livrer, convenez aussi de la version du logiciel et de la façon d'empaqueter les ressources externes."],
      ['Dessiner les plans principaux', 'Réservez une ligne à chaque plan, avec ses frames de début et de fin, le mouvement du sujet et celui de la caméra. Mettez les dimensions du produit, les images de référence et les fichiers de logo dans la liste des assets.'],
      ['Tester le passage le plus difficile', "Prenez les 3 à 5 secondes les plus difficiles et faites-en un essai. Contrôlez les contours et les occultations sur un rendu argile, les reflets en Prévisualisation du matériau. Notez le temps de rendu d'une image et le pic de mémoire vidéo."],
      ['Sortir image par image', "Rendez chaque plan en images numérotées en continu. Après un échec, recalculez les images manquantes. À l'assemblage, reprenez la fréquence d'images du projet. Vérifiez les retours à la ligne des sous-titres et les points de coupe du son dans le format d'image final."],
      ['Revoir et livrer', 'Regardez la vidéo entière une fois, en guettant le scintillement, les maillages qui se traversent et le niveau sonore après chaque coupe. Ouvrez le projet source depuis un autre dossier et vérifiez les textures, les polices, les licences des assets et les réglages de sortie.']
    ],
    assemble: "Assembler en MP4 la séquence d'images du fichier d'exemple",
    assembleText: "Dans Blender, choisissez « Rendre l'animation ». Un dossier frames apparaît à côté du fichier. Lancez la commande ci-dessous depuis le dossier qui contient le fichier.",
    ffmpegDocs: "Documentation FFmpeg sur les séquences d'images",
    modelsTitle: 'Répartition entre les modèles Claude',
    modelsText: "Pour organiser plusieurs plans à la fois ou chercher une erreur de rendu, Opus peut décomposer le travail. Une fois le gabarit arrêté, changer les sous-titres, modifier les paramètres et ranger les scripts peut revenir à Sonnet. Faites d'abord un essai sur un seul plan, puis choisissez le modèle d'après le temps et l'usage mesurés.",
    promptIntro: 'Écrivez les conditions de ce tournage en tête du prompt et confiez-le à Claude avec le storyboard, les ressources et les exigences de rendu et de livraison.',
    brief: [
      ['Projet', "Présentation d'un appareil bi-objectif"],
      ['Matériel et système', 'MacBook Pro, 18 Go'],
      ['Budget', '10 euros au plus pour les services externes'],
      ['Livraison', '20 secondes, 1080p, avec le projet modifiable']
    ],
    copy: 'Copier le prompt',
    download: 'Télécharger en TXT',
    fullPrompt: 'Lire le prompt complet',
    original: "Télécharger le prompt d'origine",
    references: ["Sortie d'animation dans Blender", 'ThreeCanvas dans Remotion', "Séquences d'images avec FFmpeg", 'Licence des assets Poly Haven', "Limites d'utilisation des abonnements Claude", "Tarifs de l'API Anthropic", 'Présentation des modèles Claude'],
    elsewhere: 'Le code source des plugins de production est rangé dans le {tools}, et les démonstrations de leurs auteurs dans les {cases}.'
  },
  catalog: {
    categories: {native: 'Logiciels 3D et connecteurs', code: 'Animation par le code', skill: 'Skills de production', asset: 'Ressources et sortie', video: 'Vidéo générée'},
    caseTypes: {film: 'Films terminés', template: 'Gabarits et exemples', demo: 'Démonstrations techniques'},
    // Nom de l'outil : [usage, limite, mise en œuvre]
    tools: {
      'Blender': ['Modélisation, éclairage et rendu, avec à la livraison un fichier .blend qui reste modifiable.', "Le temps de rendu par image dépend de la scène, de l'échantillonnage et du matériel.", "Régler les caméras et les images clés en Python, puis sortir une séquence d'images."],
      'Blender MCP': ['Inspecter ou modifier depuis Claude la scène Blender ouverte.', 'La conception des plans et les réglages de rendu doivent quand même être inscrits dans le fichier.', "Activer l'extension correspondante dans Blender, puis connecter un client MCP."],
      'mcp-for-blender': ["Connecteur Blender maintenu par la communauté, avec des exemples d'intégration de modèles et de ressources d'environnement.", "Le connecteur peut exécuter du code. Vérifier les permissions des outils avant de s'en servir.", "Associer l'add-on communautaire au serveur qui lui correspond."],
      'Cinema 4D MCP': ['Ajuster des objets et du motion design dans un projet Cinema 4D existant.', "Le poste de production doit disposer d'un Cinema 4D en état de marche.", 'Reprendre les réglages MoGraph et de rendu déjà présents dans le projet.'],
      'Unreal Engine MCP': ["Appeler les outils de l'éditeur et consulter la scène dans Unreal Editor.", 'Les capacités du plugin dépendent de la version du moteur utilisée par le projet.', 'Gérer les plans dans Sequencer et sortir avec Movie Render Queue.'],
      'Remotion': ['Agencer les plans, les sous-titres et les pistes audio avec React.', 'Les scènes 3D complexes demandent des composants de rendu supplémentaires.', "Changer par paramètres le nom du produit, la langue ou le format d'image."],
      'React Three Fiber': ['Écrire des scènes Three.js sous forme de composants React.', "À l'export vidéo, l'animation doit redonner le même résultat chaque fois qu'une image donnée est calculée.", 'Rendre dans le ThreeCanvas de Remotion.'],
      'Three.js': ["Piloter les modèles, les matériaux, les caméras et l'éclairage dans le navigateur.", "L'enregistrement audio, la timeline et l'encodage vidéo sont à prévoir séparément.", "À associer à Remotion ou à un outil d'export image par image."],
      'HyperFrames': ["Mettre en scène des démos d'interface, du texte et des médias avec des éléments web.", "Les plans qui demandent des modèles et de l'éclairage nécessitent une scène 3D à part.", "Placer les animations web existantes et les captures vidéo d'écran sur une même timeline."],
      'blender-film': ["Traversée d'une ville de nuit, avec les scripts de trajectoire de vol, d'éclairage et de son.", "La vitesse de vol et les positions de caméra sont à ajuster à l'échelle de la scène.", "À utiliser avec Blender. Voir le film terminé de l'auteur, le vol de nuit en ville."],
      'blender-forest': ["Décompose un décor de forêt, la dispersion de la végétation et le mouvement d'une voiture.", 'La densité des arbres et les matériaux pèsent sur la mémoire vidéo.', 'Contrôler la végétation, les reflets de carrosserie et les ombres portées sur des images représentatives.'],
      'blender-car-film': ["Storyboard, chute de neige et scripts multicaméras d'un court métrage de voiture par nuit de neige.", 'Le modèle du véhicule et les ressources externes sont à remplacer selon le projet.', "Les plans partagent le même jeu d'assets. Les sortir séparément, puis monter."],
      'EL4CTEO / blender-skills': ['Consignes classées par tâche : modélisation, UV, matériaux, rigging et précalcul.', "La version de Blender requise peut varier d'un skill à l'autre.", 'Choisir le skill dont le plan en cours a besoin.'],
      'claude-3d-harness': ['Gère les étapes de production, les versions des skills et les fichiers intermédiaires.', 'Vérifier ses conventions de dossiers avant de lui confier un projet existant.', 'Suivre les étapes de scène et les points de contrôle du dépôt.'],
      'CloudAI-X / threejs-skills': ["Exemples Three.js d'animation, de shaders et de performance.", "La timeline vidéo et l'export restent à développer à part.", 'À utiliser avec des scènes Three.js ou des composants R3F.'],
      'cinematic-3d-video': ["Produit des films courts à partir d'une scène Three.js, de captures du navigateur et de FFmpeg.", "Vérifier d'abord la sortie image par image du gabarit dans le navigateur cible.", 'Convient aux génériques et aux animations de logo que des primitives géométriques suffisent à décrire.'],
      'Meshy 3D Agent': ["Générer un modèle à partir d'un texte ou d'une image de référence, puis l'importer dans la scène.", 'Les dimensions, la topologie et les contours du modèle sont à vérifier à la main.', 'Après import dans Blender, comparer avec les images de référence du produit.'],
      'Poly Haven': ['Chercher des HDRI, des textures et des modèles sous licence CC0.', 'La résolution téléchargée joue sur la taille du projet et la mémoire de rendu.', "Éclairer avec une HDRI et choisir les textures selon la taille réelle de l'image."],
      'FFmpeg': ['Assembler des images consécutives en vidéo, encoder et multiplexer la piste audio.', "La numérotation de la séquence et la fréquence d'images en entrée doivent correspondre aux réglages de rendu.", "Lit les séquences d'images exportées par Blender ou par un navigateur."],
      'Runway MCP': ["Appeler depuis Claude les outils d'image et de vidéo de Runway.", "Un compte Runway est nécessaire. L'usage de génération est compté à part.", 'Générer des clips candidats à partir du storyboard et des images du sujet, puis monter.'],
      'Google Flow': ["Générer et agencer des plans vidéo à partir d'éléments de référence.", "Les modèles disponibles et les types d'entrée dépendent des réglages actuels du produit.", "Comparer d'abord l'apparence d'un même sujet dans des plans voisins."],
      'Kling AI': ['Générer des plans avec les images de référence, les prompts et les images clés de Kling.', 'Les dimensions géométriques locales se spécifient difficilement une à une.', 'Conserver les images de référence et les paramètres de génération, et vérifier les raccords au montage.']
    },
    // Même ordre que cases dans ../catalog.mjs : [nom, description]
    cases: [
      ['Vol de nuit en ville', "Un vol à la première personne de 10 secondes. Suivez la trajectoire de la caméra et observez la vitesse à laquelle les immeubles proches traversent le cadre."],
      ['Route en forêt', "Une voiture traverse une forêt dense. Repérez l'intervalle auquel les arbres se répètent et l'évolution des reflets sur la carrosserie."],
      ['Court métrage de voiture par nuit de neige', '20 secondes, six positions de caméra. Après chaque changement de position, regardez comment se raccordent les phares, la neige et la direction de la voiture.'],
      ['Scène de salle de classe et Blender MCP', 'Voyez comment le connecteur officiel lit la scène et appelle les outils de Blender.'],
      ["Exemples de scènes de l'add-on communautaire", "L'auteur montre des consignes de modélisation et l'import de ressources externes. Le dépôt contient le code source de l'add-on."],
      ['Chambre sur un toit par nuit de pluie', "Comparez le rendu argile et l'image finale pour distinguer ce qui vient de la géométrie, des matériaux et de la postproduction."],
      ['Gabarit de téléphone en 3D', "Ouvrez l'aperçu de Studio, avancez image par image, puis examinez la caméra et le modèle du produit dans le gabarit."],
      ['Animations web et vidéos de lancement', "Voyez comment les différents gabarits agencent les titres, les captures vidéo d'interface et les transitions."],
      ['Édition de scène dans Cinema 4D', "Regardez la sélection d'objets et les modifications de scène dans la démonstration officielle."],
      ["Exemple de connexion à l'éditeur Unreal", "Consultez les conditions d'activation du plugin, la méthode de connexion et les outils appelables dans l'éditeur."],
      ["Génération d'accessoires 3D", "Des exemples de génération de modèles, de texturage, de rigging et d'export d'assets."],
      ['Appeler Runway depuis Claude', "L'exemple de connexion officiel explique comment demander des images ou des vidéos dans une conversation."],
      ['Sélection de Flow TV', "Regardez les courts métrages par chaîne et comparez la cohérence du sujet d'un plan à l'autre."],
      ['Images de référence et images clés', "Dans les exemples officiels, comparez l'image de référence, la description du mouvement et le clip obtenu."]
    ]
  },
  runtime: {
    common: {
      theme: {light: 'Clair', dark: 'Sombre', toLight: 'Passer au mode clair', toDark: 'Passer au mode sombre'}
    },
    home: {
      views: {clay: "Rendu argile de l'appareil, même position de caméra et mêmes lumières", detail: "Gros plan sur les lentilles et les fûts d'objectif en métal de l'appareil"},
      subjects: {
        product: "Mesurez d'abord les proportions du boîtier et laissez un reflet sur le bord des objectifs pour contrôler les contours.",
        ui: "Enregistrez l'interface d'origine et séparez ses textes de l'image sur des calques distincts, pour changer de langue facilement.",
        scene: 'Fixez les proportions du bâtiment et les positions de caméra sur un rendu argile, puis placez les détails dans ce que les plans laissent voir.',
        story: "Dessinez les endroits où les personnages entrent dans le cadre et en sortent, et gardez une image de référence de raccord pour chaque plan voisin."
      },
      devices: {
        laptop: "Faites d'abord un aperçu en basse résolution sur la machine et notez le temps d'une image.",
        mac: 'Sur une même image, comparez le CPU et les réglages de rendu Metal disponibles, et notez le temps et la mémoire.',
        gpu: "Vérifiez la mémoire vidéo sur l'image la plus chargée en textures avant de planifier le rendu complet."
      },
      codeAdvice: "Exportez un passage image par image sur cette machine et vérifiez les polices, la taille du canevas et le rythme de l'animation.",
      videoAdvice: "Le temps de génération et les crédits sont ceux qu'enregistre le service. La machine locale sert surtout au montage.",
      adviceJoin: ' '
    },
    tools: {
      found: {one: '{n} outil affiché', other: '{n} outils affichés'},
      picked: ' ({n})',
      chosen: {one: '{n} outil sélectionné sur trois.', other: '{n} outils sélectionnés sur trois.'},
      shortcut: 'Comparer la sélection ({n})',
      tableLabel: 'Usage, limites et mise en œuvre des outils sélectionnés',
      tool: 'Outil',
      remove: 'Retirer',
      removeAria: 'Retirer {name}',
      rows: ['Usage', 'Limites', 'Mise en œuvre']
    },
    cases: {},
    estimate: {
      frames: {one: '{n} image', other: '{n} images'},
      minutes: {one: 'environ {n} minute', other: 'environ {n} minutes'},
      renderJoin: ', ',
      quota: 'Environ {n} % de cette fenêtre de limite',
      cost: '{n} $',
      invalid: '{label} : saisissez un nombre valide.',
      range: 'Ces valeurs dépassent la plage de calcul.'
    },
    handbook: {
      briefJoin: ' : ',
      copied: 'Prompt copié.',
      selectedAll: 'Tout le texte est sélectionné. Utilisez la commande de copie du système.',
      fileName: 'claude-3d-prompt-projet.txt'
    }
  }
};
