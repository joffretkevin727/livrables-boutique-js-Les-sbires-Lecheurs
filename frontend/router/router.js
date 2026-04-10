const express = require('express');
const router = express.Router();

const controllerHome = require('../controller/controllerHome.js')

router.get('/home', controllerHome.Home);