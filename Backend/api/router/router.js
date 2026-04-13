const express = require('express');
const router = express.Router();
const controller = require('../controller/controller');

// ==================
// CHAMPIONS
// ==================

router.get('/champions', controller.getAllChampions);
router.get('/champions/filter', controller.filterChampions);
router.get('/champions/sort', controller.sortChampions);
router.get('/champions/refresh-promos', controller.applyRandomPromotions);
router.get('/champions/:id', controller.getChampionById);
router.get('/champions/:id/skins', controller.getChampionSkins);
router.get('/champions/:id/image', controller.getChampionImage);
router.get('/champions/:id/roles', controller.getChampionRoles);
router.get('/champions/:id/similaires', controller.getSimilarChampions);

// ==================
// USERS
// ==================

router.post('/users/register', controller.register);
router.post('/users/login', controller.login);

// ==================
// PANIER
// ==================

router.get('/panier/:user_id', controller.getPanier);
router.post('/panier', controller.addToPanier);
router.put('/panier/:id', controller.updatePanier);
router.delete('/panier/:id', controller.deleteFromPanier);

// ==================
// COMMANDES
// ==================

router.post('/commandes', controller.createCommande);
router.get('/commandes/:user_id', controller.getCommandes);

// ==================
// FAVORIS
// ==================

router.get('/favoris/:user_id', controller.getFavoris);
router.post('/favoris', controller.addFavori);
router.delete('/favoris/:id', controller.deleteFavori);

// ==================
// ADRESSES
// ==================

router.get('/adresses/:user_id', controller.getAdresses);
router.post('/adresses', controller.addAdresse);

// ==================
// ERREURS
// ==================

router.use((req, res) => {
    res.status(404).json({ code: '404',message: 'Route non trouvée' });
});

module.exports = router;