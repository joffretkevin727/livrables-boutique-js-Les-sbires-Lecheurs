const model = require('../model/model');
const bcrypt = require('bcrypt');
const saltRounds = 9;
// ==================
// CHAMPIONS
// ==================

const getAllChampions = async (req, res) => {
    try {
        const [champions] = await model.getAllChampions();
        if (champions.length === 0) {
            return res.status(404).json({ code: '404', message: 'Aucun champion trouvé' });
        }
        res.status(200).json(champions);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const getChampionById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ code: '400', message: 'ID invalide' });
        }
        const [champion] = await model.getChampionById(id);
        if (champion.length === 0) {
            return res.status(404).json({ code: '404', message: 'Champion non trouvé' });
        }
        res.status(200).json(champion[0]);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const getChampionSkins = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ code: '400', message: 'ID invalide' });
        }
        const [skins] = await model.getChampionSkins(id);
        if (skins.length === 0) {
            return res.status(404).json({ code: '404', message: 'Aucun skin trouvé' });
        }
        res.status(200).json(skins);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const getChampionImage = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ code: '400', message: 'ID invalide' });
        }
        const [image] = await model.getChampionImage(id);
        if (image.length === 0) {
            return res.status(404).json({ code: '404', message: 'Image non trouvée' });
        }
        res.status(200).json(image[0]);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const getChampionRoles = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ code: '400', message: 'ID invalide' });
        }
        const [roles] = await model.getChampionRoles(id);
        if (roles.length === 0) {
            return res.status(404).json({ code: '404', message: 'Aucun rôle trouvé' });
        }
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const getSimilarChampions = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ code: '400', message: 'ID invalide' });
        }
        const [champions] = await model.getSimilarChampions(id);
        if (champions.length === 0) {
            return res.status(404).json({ code: '404', message: 'Aucun champion similaire trouvé' });
        }
        res.status(200).json(champions);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const filterChampions = async (req, res) => {
    try {
        // req.query contient les paramètres ?roles=...&genres=...
        const [champions] = await model.filterChampions(req.query);
        res.status(200).json(champions);
    } catch (error) {
        console.error("Erreur SQL Filtre:", error);
        res.status(500).json({ message: error.message });
    }
};

const sortChampions = async (req, res) => {
    try {
        const order = req.query.order;
        if (!order || (order !== 'asc' && order !== 'desc')) {
            return res.status(400).json({ code: '400', message: 'Order invalide, utilisez asc ou desc' });
        }
        const [champions] = await model.sortChampions(order);
        if (champions.length === 0) {
            return res.status(404).json({ code: '404', message: 'Aucun champion trouvé' });
        }
        res.status(200).json(champions);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

// ==================
// USERS
// ==================

const register = async (req, res) => {
    try {
        const { name, lastname, email, password } = req.body;
        if (!name || !lastname || !email || !password) {
            return res.status(400).json({ code: '400', message: 'Tous les champs sont obligatoires' });
        }
        const [existing] = await model.getUserByEmail(email);
        if (existing.length > 0) {
            return res.status(409).json({ code: '409', message: 'Email déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await model.createUser(name, lastname, email, hashedPassword);
        res.status(201).json({ code: '201', message: 'Utilisateur créé avec succès' });
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ code: '400', message: 'Email et mot de passe obligatoires' });
        }
        const [users] = await model.getUserByEmail(email);
        if (users.length === 0) {
            return res.status(404).json({ code: '404', message: 'Utilisateur non trouvé' });
        }
        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ code: '401', message: 'Mot de passe incorrect' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({ code: '200', message: 'Connexion réussie', user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

// ==================
// PANIER
// ==================

const getPanier = async (req, res) => {
    try {
        const user_id = parseInt(req.params.user_id);
        const [panier] = await model.getPanierByUser(user_id);
        
        if (panier.length === 0) {
            return res.status(200).json([]); // Renvoie un tableau vide plutôt qu'une 404
        }
        res.status(200).json(panier);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const addToPanier = async (req, res) => {
    try {
        const { user_id, champion_id, skin_id, quantite } = req.body;
        if (!user_id || !champion_id || !quantite) {
            return res.status(400).json({ code: '400', message: 'Champs manquants' });
        }
        await model.addToPanier(user_id, champion_id, skin_id || null, quantite);
        res.status(201).json({ code: '201', message: 'Ajouté au panier' });
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const updatePanier = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { quantite } = req.body;
        if (isNaN(id) || !quantite) {
            return res.status(400).json({ code: '400', message: 'Données invalides' });
        }
        await model.updatePanier(id, quantite);
        res.status(200).json({ code: '200', message: 'Panier mis à jour' });
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const deleteFromPanier = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ code: '400', message: 'ID invalide' });
        }
        await model.deleteFromPanier(id);
        res.status(200).json({ code: '200', message: 'Supprimé du panier' });
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

// ==================
// COMMANDES
// ==================

const createCommande = async (req, res) => {
    try {
        const { user_id, adresse_id, total, items } = req.body;

        // 1. Créer la commande dans la table 'commandes'
        const [result] = await model.createCommande(user_id, adresse_id, total);
        const commandeId = result.insertId;

        // 2. Transférer les items du panier vers 'commande_items' et mettre à jour les stocks
        for (const item of items) {
            // Ajout dans l'historique des commandes
            await model.createCommandeItem(commandeId, item.champion_id, item.skin_id, item.quantite, item.price);
            // Mise à jour du stock champion
            await model.updateStock(item.champion_id, item.quantite);
        }

        // 3. LE RESET : On vide le panier de l'utilisateur
        await model.clearPanier(user_id);

        res.status(201).json({ 
            code: '201', 
            message: 'Commande validée avec succès et panier réinitialisé.' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: '500', message: 'Erreur lors de la validation de la commande.' });
    }
};

const getCommandes = async (req, res) => {
    try {
        const user_id = parseInt(req.params.user_id);
        if (isNaN(user_id)) {
            return res.status(400).json({ code: '400', message: 'ID invalide' });
        }
        const [commandes] = await model.getCommandesByUser(user_id);
        if (commandes.length === 0) {
            return res.status(404).json({ code: '404', message: 'Aucune commande trouvée' });
        }
        res.status(200).json(commandes);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

// ==================
// FAVORIS
// ==================

const getFavoris = async (req, res) => {
    try {
        const user_id = parseInt(req.params.user_id);
        if (isNaN(user_id)) {
            return res.status(400).json({ code: '400', message: 'ID invalide' });
        }
        const [favoris] = await model.getFavorisByUser(user_id);
        if (favoris.length === 0) {
            return res.status(404).json({ code: '404', message: 'Aucun favori trouvé' });
        }
        res.status(200).json(favoris);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const addFavori = async (req, res) => {
    try {
        const { user_id, champion_id } = req.body;
        if (!user_id || !champion_id) {
            return res.status(400).json({ code: '400', message: 'Champs manquants' });
        }
        await model.addFavori(user_id, champion_id);
        res.status(201).json({ code: '201', message: 'Ajouté aux favoris' });
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const deleteFavori = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ code: '400', message: 'ID invalide' });
        }
        await model.deleteFavori(id);
        res.status(200).json({ code: '200', message: 'Supprimé des favoris' });
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

// ==================
// ADRESSES
// ==================

const getAdresses = async (req, res) => {
    try {
        const user_id = parseInt(req.params.user_id);
        if (isNaN(user_id)) {
            return res.status(400).json({ code: '400', message: 'ID invalide' });
        }
        const [adresses] = await model.getAdressesByUser(user_id);
        if (adresses.length === 0) {
            return res.status(404).json({ code: '404', message: 'Aucune adresse trouvée' });
        }
        res.status(200).json(adresses);
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

const addAdresse = async (req, res) => {
    try {
        const { user_id, street, city, code_postal, country } = req.body;
        if (!user_id || !street || !city) {
            return res.status(400).json({ code: '400', message: 'Champs manquants' });
        }
        await model.addAdresse(user_id, street, city, code_postal, country);
        res.status(201).json({ code: '201', message: 'Adresse ajoutée' });
    } catch (error) {
        res.status(500).json({ code: '500', message: 'Erreur serveur', error });
    }
};

module.exports = {
    getAllChampions,
    getChampionById,
    getChampionSkins,
    getChampionImage,
    getChampionRoles,
    getSimilarChampions,
    filterChampions,
    sortChampions,
    register,
    login,
    getPanier,
    addToPanier,
    updatePanier,
    deleteFromPanier,
    createCommande,
    getCommandes,
    getFavoris,
    addFavori,
    deleteFavori,
    getAdresses,
    addAdresse
};