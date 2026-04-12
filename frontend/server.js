const express = require('express');
const path = require('path');
const app = express();

// On monte la racine du projet pour accéder à /frontend/... et /Backend/...
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));
app.use('/Backend', express.static(path.join(__dirname, '..', 'Backend')));

// Routes
app.get('/catalogue', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/catalogue.html'));
});

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/product.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/cart.html'));
});

app.get('/connexion', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/connexion.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/register.html'));
});

app.get('/profil', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/profil.html'));
});

app.get('/delivery', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/delivery.html'));
});

app.listen(6969, () => console.log("Serveur : http://localhost:6969/catalogue"));