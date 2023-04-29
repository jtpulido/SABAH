const { Router } = require('express');
const passport = require('passport');
const { obtenerProyecto,obtenerTodosProyectos, obtenerProyectosTerminados, obtenerProyectosDesarrollo } = require('../controllers/comite.controller')
const router = Router()


router.get('/comite/obtenerTodos', passport.authenticate('jwt', { session: false }), obtenerTodosProyectos);
router.get('/comite/obtenerTerminados', passport.authenticate('jwt', { session: false }), obtenerProyectosTerminados);
router.get('/comite/obtenerEnCurso', passport.authenticate('jwt', { session: false }), obtenerProyectosDesarrollo);
router.post('/comite/verProyecto', passport.authenticate('jwt', { session: false }), obtenerProyecto);

module.exports = router;