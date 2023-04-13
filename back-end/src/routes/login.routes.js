const { Router } = require('express')
const {  isNotLoggedIN } = require('../lib/auth');
const { login } = require('../controllers/login.controller')
const router = Router()

router.post('/login', isNotLoggedIN, login);


module.exports = router;