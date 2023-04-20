const { Router } = require('express')
const { login } = require('../controllers/login.controller')

const router = Router()

router.get('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.error("error aca", err);
            return next(err);
        }
        res.sendStatus(200);
    });
});

router.post('/login', login);


module.exports = router;