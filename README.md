# A Golden Ticket
/ !\ Ce projet est en encore en cours de route. / !\

## Description
A Golden Ticket est un projet de visualisation de données du commerce de l'or international avec une focalisation particulière sur le rôle de la Suisse. Le but est d’amener, par le biais d’un jeu, son utilisateur à saisir les mécanismes à l'œuvre derrière le commerce de l'or et les enjeux socio-économiques qui en découle tout en se familiarisant avec plusieurs types de visualisations de données qui se font de plus en plus courants (carte, diagramme en camembert, et autres).
 
Cette visualisation a été réalisée grâce à la librairie d3.js (v.4). 

![Illustration 1 - GoldImportsByCountry](illustration/GoldenTicket_01.png?raw=true "Title")


## Données
Les données d'importations et d'exportations d'or proviennent de l’observatoire de complexité économique (The Observatory of Economic Complexity) et peuvent être téléchargées à cette adresse :
https://oec.world/en/visualize/tree_map/hs92/import/show/all/7108/2017/

Les données cartographiques proviennent d’Elijah Meeks et peuvent être retrouvées à cette adresse :
https://github.com/emeeks/d3_in_action_2/blob/master/data/world.geojson

## Comment jouer (installation et utilisation)
Pour lancer la visualisation, il vous suffit de télécharger le dossier et de le placer sur un serveur en local. Une fois le serveur lancé, il vous suffira d’ouvrir votre navigateur et de vous connecter à celui-ci.

A ce stade, seule la première étape est disponible. L’utilisateur a pour tâche de trouver le plus gros pays importateur d’or en 2017. Sur un globe, le teint des pays change selon le volume importer. L’utilisateur peut zoomer sur le globe (avec la roulette de la souris),  le déplacer (en maintenant le bouton de la souris) et le faire pivoter (avec le curseur) pour l'aider à répondre à la question. Enfin, si l’utilisateur souhaite avoir plus d’information, il peut faire apparaître le nom et le volume d’or importé en survolant les pays.

![Illustration 2 - GoldImportsByCountryEnd](illustration/GoldenTicket_02.png?raw=true "Title")

Deux autres étapes sont prévues. Elles exploreront l’évolution dans le temps du commerce de l’or à travers d'autres visualisations (graphiques, nuage de point) en y incluant des évènements historiques pour comprendre ces derniers. De plus, il sera aussi possible de filtrer les données par années et de choisir l'importation ou l'exportation d'or.

## Crédits
Projet réalisé par John Rose pour le cours "Visualisation de données" de l'Université de Lausanne, sous la supervision d'Isaac Pante.

