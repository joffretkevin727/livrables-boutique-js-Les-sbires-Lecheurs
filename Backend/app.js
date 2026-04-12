const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const app = express();
const port = 6767;
const cors = require('cors');

// Import du controller pour l'initialisation
const championController = require('./api/controller/controller'); 

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const championRouter = require('./api/router/router');
app.use(championRouter);

// Passage en async pour gérer l'initialisation au démarrage
app.listen(port, async () => {
    console.log(`api is running on port ${port}. http://localhost:6767/champions`);

    try {
        // Appelle la logique du controller au lancement
        await championController.applyRandomPromotions(); 
        console.log("Les 10 promotions aléatoires ont été appliquées avec succès.");
    } catch (error) {
        console.error("Erreur lors de l'application des promotions au démarrage :", error);
    }
});