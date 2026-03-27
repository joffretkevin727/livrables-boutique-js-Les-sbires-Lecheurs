const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const app = express();
const port = 6767;
const cors = require('cors');

app.use(cors({
    origin: "*"
}));

app.use(express.json());

// Rend le dossier assets accessible via http://localhost:6767/assets/...
app.use('/assets', express.static(path.join(__dirname, 'assets')));


const championRouter = require('./api/router/router');

app.use(championRouter);

app.listen(port, () => console.log(`api is running on port ${port}. Here is the link : http://localhost:6767/champions `));