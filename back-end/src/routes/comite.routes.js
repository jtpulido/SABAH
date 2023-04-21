const { Router } = require('express');
const passport = require('passport');
const { obtenerProyectos } = require('../controllers/comite.controller')
const router = Router()


router.get('/obtenerProyectos', passport.authenticate('jwt', { session: false }), obtenerProyectos);


module.exports = router;