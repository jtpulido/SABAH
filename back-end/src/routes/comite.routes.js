const { Router } = require('express');
const passport = require('passport');
const { obtenerTodosProyectos, obtenerProyectosTerminados, obtenerProyectosDesarrollo } = require('../controllers/comite.controller')
const router = Router()


router.get('/proyectos/obtenerTodos', passport.authenticate('jwt', { session: false }), obtenerTodosProyectos);
router.get('/proyectos/obtenerTerminados', passport.authenticate('jwt', { session: false }), obtenerProyectosTerminados);
router.get('/proyectos/obtenerEnCurso', passport.authenticate('jwt', { session: false }), obtenerProyectosDesarrollo);

module.exports = router;