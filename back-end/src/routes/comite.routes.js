const { Router } = require('express');
const passport = require('passport');
const { obtenerProyecto, obtenerTodosProyectos, obtenerProyectosTerminados, obtenerProyectosDesarrollo, asignarCodigoProyecto,obtenerDirectoresProyectosActivos, obtenerDirectoresProyectosInactivos, obtenerJuradosProyectosActivos, obtenerJuradosProyectosInactivos, obtenerLectoresProyectosActivos, obtenerLectoresProyectosInactivos } = require('../controllers/comite.controller')
const router = Router()


router.get('/comite/obtenerTodos', passport.authenticate('jwt', { session: false }), obtenerTodosProyectos);
router.get('/comite/obtenerTerminados', passport.authenticate('jwt', { session: false }), obtenerProyectosTerminados);
router.get('/comite/obtenerEnCurso', passport.authenticate('jwt', { session: false }), obtenerProyectosDesarrollo);
router.post('/comite/verProyecto', passport.authenticate('jwt', { session: false }), obtenerProyecto);
router.post('/comite/asignarCodigo', passport.authenticate('jwt', { session: false }), asignarCodigoProyecto);
router.post('/comite/directoresproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerDirectoresProyectosActivos);
router.post('/comite/directoresproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerDirectoresProyectosInactivos);
router.post('/comite/juradosproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerJuradosProyectosActivos);
router.post('/comite/juradosproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerJuradosProyectosInactivos);
router.post('/comite/lectoresproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerLectoresProyectosActivos);
router.post('/comite/lectoresproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerLectoresProyectosInactivos);

module.exports = router;