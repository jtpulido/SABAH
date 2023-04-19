const { Router } = require('express')
const isAuthenticated = require('../lib/auth');

const { obtenerProyectos } = require('../controllers/comite.controller')
const router = Router()


router.get('/obtenerProyectos', isAuthenticated, obtenerProyectos);

module.exports = router;