const express = require('express');
const router = express.Router();
const sneakercontroller = require('../controller/sneaker');

router.get('/champions', sneakercontroller.getChampions);
router.get('/champion/:id', sneakercontroller.getChampionByID);

module.exports = router;