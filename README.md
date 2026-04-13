📥 PORO CORP - BOUTIQUE LEAGUE OF LEGENDS 📥
Un projet e-commerce complet réalisé en architecture MVC (Node.js, Express, MySQL).

📖 PRÉSENTATION DU PROJET
Poro Corp est une application web permettant de parcourir les champions de League of Legends, de visualiser leurs skins, de les ajouter à un panier et de simuler une commande.

Front-end : HTML5, CSS3, Tailwind CSS, JavaScript (Vanilla)

Back-end : Node.js, Express

Base de données : MySQL (Architecture relationnelle)

✨ FONCTIONNALITÉS PRINCIPALES
🛡️ Gestion des Produits
Affichage dynamique du catalogue via une API REST.

Système de filtrage avancé par Rôle, Difficulté et Genre via menu déroulant.

Recherche en temps réel par nom de champion.

Tri des prix (croissant/décroissant).

🎨 Expérience Utilisateur (UX)
Carrousel interactif sur la page produit pour choisir ses skins.

Effet Hover : survoler une carte dans le catalogue affiche un skin.

Responsive Design : interface adaptée aux mobiles et tablettes.

🛒 Tunnel d'Achat
Gestion du Panier : ajout de champions ou de skins spécifiques.

Système de Livraison : gestion des adresses utilisateur.

Validation de commande : mise à jour automatique des stocks et reset du panier après achat.

🛠️ INSTALLATION & CONFIGURATION
1️⃣ Pré-requis
Node.js installé.

Un serveur MySQL (XAMPP / WAMP / MAMP).

2️⃣ Installation du projet
Bash
# Cloner le projet
git clone [URL_DU_REPO]

# Installer les dépendances
npm install
3️⃣ Configuration de la Base de Données
Ouvrez phpMyAdmin.

Allez dans Query, puis copeir-coller le contenue des fichiers dans l'ordre :

- schema.sql --> Executer

- data.sql --> Executer

- images.sql --> Executer

4️⃣ Lancement
Bash
# Lancer le site

alllez dans votre terminal sur le projet, puis ecriver :

npm run projet

Puis patienter jusqu'a la l'ouverture de la page catalogue.


🏗️ ARCHITECTURE DU CODE (MVC)
Le projet est découpé de manière professionnelle pour une meilleure maintenance :

📂 /Models : Contient les requêtes SQL (Interaction BDD).

📂 /Controllers : Logique métier et gestion des réponses API.

📂 /Routes : Définition des points d'entrée (Endpoints).

📂 /Frontend : Fichiers HTML, CSS et Scripts clients.


👤 AUTEUR
Développeur : Kevin & Quentin
Projet : Challenge JS - Oral de fin d'année.
