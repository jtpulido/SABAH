const { Router } = require('express')
const { isLoggedIn} = require('../lib/auth');
const router = Router()


router.get('/logout', isLoggedIn, (req, res) => {
  req.logOut();
});

module.exports = router;