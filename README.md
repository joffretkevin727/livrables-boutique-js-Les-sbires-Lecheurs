# Poro Corp

## Description

Poro Corp est une application web permettant de consulter un catalogue de champions, d’interagir avec leurs fiches détaillées et de gérer un système complet incluant les favoris, le panier et les commandes.

Le projet repose sur une architecture client-serveur avec un frontend en HTML/CSS/JavaScript et un backend en Node.js avec Express, connecté à une base de données MySQL.

---

## Fonctionnalités principales

- Affichage d’un catalogue dynamique de champions
- Filtres par rôle, difficulté et genre
- Tri par prix
- Barre de recherche en temps réel
- Affichage détaillé d’un champion
- Système de favoris lié à l’utilisateur connecté
- Gestion d’un panier
- Création de commandes
- Gestion des utilisateurs (inscription, connexion)
- Gestion des adresses de livraison

---

## Architecture du projet

PROJETJS_LES-SBIRES-LECHEURS
│
├── Backend
│   │
│   ├── api
│   │   ├── routes
│   │   │   └── router.js
│   │   ├── controller
│   │   │   └── controller.js
│   │   └── model
│   │       └── model.js
│   │
│   ├── config
│   │   └── db.js
│   │
│   ├── assets
│   │   └── ressources statiques / fichiers utiles au backend
│   │
│   ├── ressource
│   │   └── données ou fichiers annexes
│   │
│   ├── .env
│   └── app.js
│
├── frontend
│   │
│   ├── css
│   │   ├── catalogue.css
│   │   ├── card.css
│   │   ├── header.css
│   │   └── favoris.css
│   │
│   ├── img
│   │   └── images du site
│   │
│   ├── script
│   │   ├── catalogue.js
│   │   └── favoris.js
│   │
│   └── template
│       ├── catalogue.html
│       ├── product.html
│       ├── cart.html
│       ├── connexion.html
│       ├── register.html
│       ├── profil.html
│       ├── delivery.html
│       └── favoris.html
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md

### Frontend

Le frontend gère l’interface utilisateur et les interactions avec l’API.



👤 AUTEUR
Développeur : Kevin & Quentin
Projet : Challenge JS
