// server.js (situé à la racine de 'projet')
const express = require('express');
const path = require('path');
const app = express();

// RENDRE TOUT LE DOSSIER 'projet' ACCESSIBLE
app.use(express.static(path.join(__dirname, '..')));

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/product.html'));
});

app.listen(6969, () => console.log("Serveur sur http://localhost:6969/product"));