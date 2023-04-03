const { Router } = require('express')
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const { isLoggedIn, isNotLoggedIN } = require('../lib/auth');
const { login } = require('../controllers/inicio.controller')
const { register } = require('../controllers/usuario.controller')
const router = Router()

router.post('/login', isNotLoggedIN, login);

router.get('/logout', isLoggedIn, (req, res) => {
  req.logOut();
});
router.post('/register',isNotLoggedIN, register);

module.exports = router;