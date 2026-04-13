const db = require('../../config/db');

// ==================
// CHAMPIONS
// ==================

const getAllChampions = () => {
    return db.query(`SELECT c.*, ci.url_loadscreen 
        FROM champions c
        INNER JOIN champion_images ci ON c.id = ci.champion_id`);
};

const getChampionById = (id) => {
    return db.query(`
        SELECT c.*, ci.url_centered, ci.url_loadscreen, 
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', s.id, /* <--- AJOUTE CETTE LIGNE ICI */
                'url_centered', s.url_centered,
                'url_loadscreen', s.url_loadscreen
            )
         ) FROM skins s WHERE s.champion_id = c.id) AS skins
        FROM champions c
        LEFT JOIN champion_images ci ON c.id = ci.champion_id
        WHERE c.id = ?
    `, [id]);
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
    // On part d'une requête de base qui récupère aussi l'image par défaut
    let query = `
        SELECT c.*, ci.url_loadscreen 
        FROM champions c 
        LEFT JOIN champion_images ci ON ci.champion_id = c.id 
        WHERE 1=1`;
    let values = [];

    // Filtre par Rôles (Jointure nécessaire)
    if (filters.roles) {
        const rolesArray = filters.roles.split(',');
        query += ` AND c.id IN (
            SELECT champion_id FROM champion_roles cr 
            JOIN roles r ON r.id = cr.role_id 
            WHERE r.nom IN (?)
        )`;
        values.push(rolesArray);
    }

    // Filtre par Difficultés
    if (filters.difficultes) {
        const diffArray = filters.difficultes.split(',');
        query += ` AND c.difficulte IN (?)`;
        values.push(diffArray);
    }

    // Filtre par Genres
    if (filters.genres) {
        const genreArray = filters.genres.split(',');
        query += ` AND c.genre IN (?)`;
        values.push(genreArray);
    }

    return db.query(query, values);
};

const sortChampions = (order) => {
    const direction = order === 'desc' ? 'DESC' : 'ASC';
    return db.query(`SELECT * FROM champions ORDER BY price ${direction}`);
};

const applyRandomPromotions = async () => {
    await db.query("UPDATE champions SET reduction = 0"); // Reset
    return db.query(`
        UPDATE champions 
        SET reduction = ELT(FLOOR(1 + (RAND() * 4)), 10, 20, 50, 75)
        WHERE id IN (SELECT id FROM (SELECT id FROM champions ORDER BY RAND() LIMIT 10) as t)
    `); // Applique 10 réductions
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
        SELECT 
            p.id, 
            p.quantite,
            p.skin_id,
            c.name AS champion_name, 
            c.price, 
            c.reduction,
            -- Calcul du prix remisé si une réduction existe
            CASE 
                WHEN c.reduction > 0 THEN FLOOR(c.price * (1 - c.reduction / 100))
                ELSE c.price 
            END AS final_price,
            c.devise,
            COALESCE(s.url_loadscreen, ci.url_loadscreen) AS final_url_loadscreen
        FROM panier p
        JOIN champions c ON c.id = p.champion_id
        LEFT JOIN champion_images ci ON ci.champion_id = c.id
        LEFT JOIN skins s ON s.id = p.skin_id
        WHERE p.user_id = ?`, [user_id]);
};

const addToPanier = (user_id, champion_id, skin_id, quantite) => {
    // On s'assure que skin_id est null si aucun skin n'est sélectionné
    const finalSkinId = skin_id === "original" || !skin_id ? null : skin_id;
    return db.query(
        'INSERT INTO panier (user_id, champion_id, skin_id, quantite) VALUES (?, ?, ?, ?)',
        [user_id, champion_id, finalSkinId, quantite]
    );
};

const updatePanier = (id, quantite) => {
    return db.query('UPDATE panier SET quantite = ? WHERE id = ?', [quantite, id]);
};

const deleteFromPanier = (id) => {
    return db.query('DELETE FROM panier WHERE id = ?', [id]);
};

const clearPanier = (user_id) => {
    return db.query('DELETE FROM panier WHERE user_id = ?', [user_id]);
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

const createCommandeItem = (commande_id, champion_id, skin_id, quantite, price) => {
    return db.query(
        `INSERT INTO commande_items (commande_id, champion_id, skin_id, quantite, price_unity)
         VALUES (?, ?, ?, ?, ?)`,
        [commande_id, champion_id, skin_id, quantite, price]
    );
};

const getCommandesByUser = (user_id) => {
    return db.query('SELECT * FROM commandes WHERE user_id = ?', [user_id]);
};

const updateStock = (champion_id, quantite) => {
    return db.query(
        'UPDATE champions SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [quantite, champion_id, quantite]
    );
};

// ==================
// FAVORIS
// ==================

const getFavorisByUser = (user_id) => {
    return db.query(`
        SELECT 
            f.id AS favori_id, 
            f.champion_id, 
            c.name, 
            c.price, 
            c.reduction, 
            c.devise,
            ci.url_loadscreen,
            (SELECT s.url_loadscreen FROM skins s WHERE s.champion_id = c.id LIMIT 1) AS skin_hover
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
    applyRandomPromotions,
    getUserByEmail,
    createUser,
    getPanierByUser,
    addToPanier,
    updatePanier,
    deleteFromPanier,
    clearPanier,
    createCommande,
    createCommandeItem,
    getCommandesByUser,
    updateStock,
    getFavorisByUser,
    addFavori,
    deleteFavori,
    getAdressesByUser,
    addAdresse
};