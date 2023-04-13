const { Router } = require('express')
const { isLoggedIn, isNotLoggedIN } = require('../lib/auth');
const { register } = require('../controllers/admin.controller')
const router = Router()

router.get('/logout', isLoggedIn, (req, res) => {
  req.logOut();
});

router.post('/register',isNotLoggedIN, register);

module.exports = router;