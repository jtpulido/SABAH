
const { registro } = require('../controllers/admin.controller')


const express = require('express');
const passport = require('passport');
const router = express.Router();
router.post('/registro', registro);


module.exports = router;