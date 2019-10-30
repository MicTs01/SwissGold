# A Golden Ticket


## Description
"A Golden Switzerland" est un projet de visualisation de données du commerce de l'or international avec une focalisation particulière sur le rôle de la Suisse. Le but est d’amener, par le biais d’interaction, son utilisateur à saisir la place de la Suisse dans le commerce de l'or tout en se familiarisant avec plusieurs types de visualisations de données qui se font de plus en plus courants.
 
Cette visualisation a été réalisée grâce à la librairie d3.js (v.4). 

![Illustration 1 - GoldImportsByCountry](illustration/GoldenSwitzerland_01.PNG?raw=true "Title")


## Données
Les données d'importations et d'exportations d'or proviennent de l’observatoire de complexité économique (The Observatory of Economic Complexity) et peuvent être téléchargées à cette adresse :
https://oec.world/en/visualize/tree_map/hs92/import/show/all/7108/2017/

Les données cartographiques proviennent d’Elijah Meeks et peuvent être retrouvées à cette adresse :
https://github.com/emeeks/d3_in_action_2/blob/master/data/world.geojson

## Installation et utilisation)
Pour lancer la visualisation, il vous suffit de télécharger le dossier et de le placer sur un serveur en local. Une fois le serveur lancé, il vous suffira d’ouvrir votre navigateur, de vous connecter à celui-ci et de lancer GoldenTicket.html.
Dans la première étape, l’utilisateur a pour tâche de trouver le plus gros pays importateur d’or en 2017. Sur un globe, la couleur des pays change selon le volume importer. L’utilisateur peut zoomer sur le globe (avec la roulette de la souris) et le faire pivoter (avec le curseur) pour l'aider à répondre à la question. Enfin, si l’utilisateur souhaite avoir plus d’information, il peut faire apparaître le nom et le volume d’or importé en survolant les pays.
Dans la deuxième étape est présenté le commerce de l'or suisse. D'où vient-il ? Où est-il envoyé ? Enfin, dans la dernière étape, l'utilisateur peut parcourir à nouveau les données observées pour la période de 2008 à 2017.

![Illustration 2 - GoldImportsByCountryFull](illustration/GoldenSwitzerland_02.PNG?raw=true "Title")

## Crédits
Projet réalisé par John Rose pour le cours "Visualisation de données" de l'Université de Lausanne, sous la supervision d'Isaac Pante.

