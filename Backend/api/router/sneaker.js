const express = require('express');
const router = express.Router();
const sneakercontroller = require('../controller/sneaker');

router.get('/sneakers', sneakercontroller.getSneakers);
router.get('/sneaker/:id', sneakercontroller.getSneakersById);

module.exports = router;