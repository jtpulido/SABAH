const express = require('express');
const passport = require('passport');
const router = express.Router();

const { registro, estudiantesNuevo, estudiantesEliminados, cambioUsuarioRol, obtenerTodosProyectos, obtenerProyectosDirector, obtenerProyectosJurado, obtenerProyectosLector, obtenerProyectosTerminados, modificarProyecto, cambiarEstado, obtenerProyectosDesarrollo, obtenerProyecto, obtenerUsuarios, verUsuario, rolDirector, rolLector, rolJurado, agregarUsuario, sendEmail, modificarUsuario } = require('../controllers/admin.controller');

router.post('/registro', registro);
router.get('/admin/obtenerTodos', passport.authenticate('jwt', { session: false }), obtenerTodosProyectos);
router.get('/admin/obtenerTerminados', passport.authenticate('jwt', { session: false }), obtenerProyectosTerminados);
router.get('/admin/obtenerEnCurso', passport.authenticate('jwt', { session: false }), obtenerProyectosDesarrollo);
router.post('/admin/verProyecto', passport.authenticate('jwt', { session: false }), obtenerProyecto);

router.post('/admin/obtenerProyectosDirector', passport.authenticate('jwt', { session: false }), obtenerProyectosDirector);
router.post('/admin/obtenerProyectosLector', passport.authenticate('jwt', { session: false }), obtenerProyectosLector);
router.post('/admin/obtenerProyectosJurado', passport.authenticate('jwt', { session: false }), obtenerProyectosJurado);

router.get('/admin/obtenerUsuarios', passport.authenticate('jwt', { session: false }), obtenerUsuarios);
router.post('/admin/verUsuario', passport.authenticate('jwt', { session: false }), verUsuario);

router.post('/admin/agregarUsuario', passport.authenticate('jwt', { session: false }), agregarUsuario);
router.post('/admin/sendEmail', passport.authenticate('jwt', { session: false }), sendEmail);

router.post('/admin/rolDirector', passport.authenticate('jwt', { session: false }), rolDirector);
router.post('/admin/rolLector', passport.authenticate('jwt', { session: false }), rolLector);
router.post('/admin/rolJurado', passport.authenticate('jwt', { session: false }), rolJurado);

router.post('/admin/modificarUsuario', passport.authenticate('jwt', { session: false }), modificarUsuario);

router.put('/admin/cambiarEstado', passport.authenticate('jwt', { session: false }), cambiarEstado);
router.put('/admin/modificarProyecto', passport.authenticate('jwt', { session: false }), modificarProyecto);
router.post('/admin/cambioUsuarioRol', passport.authenticate('jwt', { session: false }), cambioUsuarioRol);

router.post('/admin/estudiantesNuevo', passport.authenticate('jwt', { session: false }), estudiantesNuevo);
router.post('/admin/estudiantesEliminados', passport.authenticate('jwt', { session: false }), estudiantesEliminados);

module.exports = router;