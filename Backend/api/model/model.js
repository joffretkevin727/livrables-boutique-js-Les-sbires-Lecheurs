const db = require('../../config/db');

// ==================
// CHAMPIONS
// ==================

const getAllChampions = () => {
    return db.query('SELECT * FROM champions');
};

const getChampionById = (id) => {
    return db.query('SELECT * FROM champions WHERE id = ?', [id]);
};

const getChampionSkins = (id) => {
    return db.query('SELECT id, url_centered, url_loadscreen, prix FROM skins WHERE champion_id = ?', [id]);
};

const getChampionImage = (id) => {
    return db.query('SELECT url_centered, url_loadscreen FROM champion_images WHERE champion_id = ?', [id]);
};

const getChampionRoles = (id) => {
    return db.query(`
        SELECT r.nom AS name FROM roles r
        JOIN champion_roles cr ON cr.role_id = r.id
        WHERE cr.champion_id = ?`, [id]);
};

const getSimilarChampions = (id) => {
    return db.query(`
        (SELECT DISTINCT c.*,
        (SELECT COUNT(*) FROM champion_roles cr2 WHERE cr2.champion_id = c.id
        AND cr2.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)) as roles_en_commun,
        (c.genre = (SELECT genre FROM champions WHERE id = ?)) as meme_genre
        FROM champions c
        JOIN champion_roles cr1 ON cr1.champion_id = c.id
        WHERE cr1.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)
        AND c.id != ?
        AND (SELECT COUNT(*) FROM champion_roles cr2 WHERE cr2.champion_id = c.id
        AND cr2.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)) = 2
        AND c.genre = (SELECT genre FROM champions WHERE id = ?)
        LIMIT 2)

        UNION

        (SELECT DISTINCT c.*,
        (SELECT COUNT(*) FROM champion_roles cr2 WHERE cr2.champion_id = c.id
        AND cr2.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)) as roles_en_commun,
        (c.genre = (SELECT genre FROM champions WHERE id = ?)) as meme_genre
        FROM champions c
        JOIN champion_roles cr1 ON cr1.champion_id = c.id
        WHERE cr1.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)
        AND c.id != ?
        AND (SELECT COUNT(*) FROM champion_roles cr2 WHERE cr2.champion_id = c.id
        AND cr2.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)) = 2
        AND c.genre != (SELECT genre FROM champions WHERE id = ?)
        LIMIT 2)

        UNION

        (SELECT DISTINCT c.*,
        (SELECT COUNT(*) FROM champion_roles cr2 WHERE cr2.champion_id = c.id
        AND cr2.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)) as roles_en_commun,
        (c.genre = (SELECT genre FROM champions WHERE id = ?)) as meme_genre
        FROM champions c
        JOIN champion_roles cr1 ON cr1.champion_id = c.id
        WHERE cr1.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)
        AND c.id != ?
        AND (SELECT COUNT(*) FROM champion_roles cr2 WHERE cr2.champion_id = c.id
        AND cr2.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)) = 1
        AND c.genre = (SELECT genre FROM champions WHERE id = ?)
        LIMIT 2)

        UNION

        (SELECT DISTINCT c.*,
        (SELECT COUNT(*) FROM champion_roles cr2 WHERE cr2.champion_id = c.id
        AND cr2.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)) as roles_en_commun,
        (c.genre = (SELECT genre FROM champions WHERE id = ?)) as meme_genre
        FROM champions c
        JOIN champion_roles cr1 ON cr1.champion_id = c.id
        WHERE cr1.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)
        AND c.id != ?
        AND (SELECT COUNT(*) FROM champion_roles cr2 WHERE cr2.champion_id = c.id
        AND cr2.role_id IN (SELECT role_id FROM champion_roles WHERE champion_id = ?)) = 1
        AND c.genre != (SELECT genre FROM champions WHERE id = ?)
        LIMIT 2)
    `, [id, id, id, id, id, id,
        id, id, id, id, id, id,
        id, id, id, id, id, id,
        id, id, id, id, id, id]);
};

const filterChampions = (filters) => {
    let query = 'SELECT * FROM champions WHERE 1=1';
    const values = [];

    if (filters.difficulte) {
        query += ' AND difficulte = ?';
        values.push(filters.difficulte);
    }
    if (filters.genre) {
        query += ' AND genre = ?';
        values.push(filters.genre);
    }
    if (filters.espece) {
        query += ' AND espece = ?';
        values.push(filters.espece);
    }
    if (filters.role) {
        query += ` AND id IN (
            SELECT champion_id FROM champion_roles cr
            JOIN roles r ON r.id = cr.role_id
            WHERE r.nom = ?)`;
        values.push(filters.role);
    }

    return db.query(query, values);
};

const sortChampions = (order) => {
    const direction = order === 'desc' ? 'DESC' : 'ASC';
    return db.query(`SELECT * FROM champions ORDER BY price ${direction}`);
};

// ==================
// USERS
// ==================

const getUserByEmail = (email) => {
    return db.query('SELECT * FROM users WHERE email = ?', [email]);
};

const createUser = (name, lastname, email, password) => {
    return db.query(
        'INSERT INTO users (name, lastname, email, password) VALUES (?, ?, ?, ?)',
        [name, lastname, email, password]
    );
};

// ==================
// PANIER
// ==================

const getPanierByUser = (user_id) => {
    return db.query(`
        SELECT p.*, c.name, c.price, ci.url_centered, ci.url_loadscreen
        FROM panier p
        JOIN champions c ON c.id = p.champion_id
        LEFT JOIN champion_images ci ON ci.champion_id = p.champion_id
        WHERE p.user_id = ?`, [user_id]);
};

const addToPanier = (user_id, champion_id, skin_id, quantite) => {
    return db.query(
        'INSERT INTO panier (user_id, champion_id, skin_id, quantite) VALUES (?, ?, ?, ?)',
        [user_id, champion_id, skin_id, quantite]
    );
};

const updatePanier = (id, quantite) => {
    return db.query('UPDATE panier SET quantite = ? WHERE id = ?', [quantite, id]);
};

const deleteFromPanier = (id) => {
    return db.query('DELETE FROM panier WHERE id = ?', [id]);
};

// ==================
// COMMANDES
// ==================

const createCommande = (user_id, adresse_id, total) => {
    return db.query(
        `INSERT INTO commandes (user_id, adresse_id, statut, total)
         VALUES (?, ?, 'en attente', ?)`,
        [user_id, adresse_id, total]
    );
};

const getCommandesByUser = (user_id) => {
    return db.query('SELECT * FROM commandes WHERE user_id = ?', [user_id]);
};

const updateStock = (champion_id, quantite) => {
    return db.query(
        'UPDATE champions SET stock = stock - ? WHERE id = ?',
        [quantite, champion_id]
    );
};

// ==================
// FAVORIS
// ==================

const getFavorisByUser = (user_id) => {
    return db.query(`
        SELECT f.*, c.name, c.price, ci.url_centered, ci.url_loadscreen
        FROM favoris f
        JOIN champions c ON c.id = f.champion_id
        LEFT JOIN champion_images ci ON ci.champion_id = f.champion_id
        WHERE f.user_id = ?`, [user_id]);
};

const addFavori = (user_id, champion_id) => {
    return db.query(
        'INSERT INTO favoris (user_id, champion_id) VALUES (?, ?)',
        [user_id, champion_id]
    );
};

const deleteFavori = (id) => {
    return db.query('DELETE FROM favoris WHERE id = ?', [id]);
};

// ==================
// ADRESSES
// ==================

const getAdressesByUser = (user_id) => {
    return db.query('SELECT * FROM adresses WHERE user_id = ?', [user_id]);
};

const addAdresse = (user_id, street, city, code_postal, country) => {
    return db.query(
        'INSERT INTO adresses (user_id, street, city, code_postal, country) VALUES (?, ?, ?, ?, ?)',
        [user_id, street, city, code_postal, country]
    );
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
    getUserByEmail,
    createUser,
    getPanierByUser,
    addToPanier,
    updatePanier,
    deleteFromPanier,
    createCommande,
    getCommandesByUser,
    updateStock,
    getFavorisByUser,
    addFavori,
    deleteFavori,
    getAdressesByUser,
    addAdresse
};