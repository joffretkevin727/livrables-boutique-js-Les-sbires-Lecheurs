const mysql = require('mysql2');
require('dotenv').config({ path: '../.env' });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
});

// Test de connexion
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erreur connexion BDD :', err.message);
        return;
    }
    console.log('✅ Connecté à MySQL');
    connection.release();
});

module.exports = pool.promise();