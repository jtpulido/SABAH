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

router.get('/api/session/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    req.sessionStore.get(sessionId, (err, session) => {
        if (err || !session) {
            res.status(404).json({ message: 'Sesión no encontrada' });
        } else {
            res.json({ user: session.user });
        }
    });
});

module.exports = router;