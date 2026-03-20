require('dotenv').config();
const express = require('express');
const app = express();
const port = 6767;
const cors = require('cors');

app.use(cors({
    origin: "*"
}));

app.use(express.json());

const championRouter = require('./api/router/router');

app.use(championRouter);

app.listen(port, () => console.log(`server is running on port ${port}. Here is the link : http://localhost:6767/champions `));