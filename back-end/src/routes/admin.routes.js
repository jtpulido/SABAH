const express = require('express');
const passport = require('passport');
const router = express.Router();

const { prueba, registro, obtenerTodosProyectos, agregarEstudiante, modificarEstudianteProyecto, agregarEstudianteProyecto, obtenerProyectosDirector, obtenerProyectosJurado, obtenerProyectosLector, eliminarEstudiante, agregarLector, modificarLector, agregarUsuarioRol, obtenerProyectosTerminados, modificarUsuarioRol, modificarProyecto, cambiarEstado, obtenerProyectosDesarrollo, obtenerProyecto, obtenerUsuarios, verUsuario, rolDirector, rolLector, rolJurado, agregarUsuario, sendEmail, modificarUsuario } = require('../controllers/admin.controller')

router.delete('/admin/eliminarEstudiante', passport.authenticate('jwt', { session: false }), eliminarEstudiante);

router.delete('/admin/prueba', passport.authenticate('jwt', { session: false }), prueba);

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
router.put('/admin/modificarUsuarioRol', passport.authenticate('jwt', { session: false }), modificarUsuarioRol);
router.put('/admin/modificarLector', passport.authenticate('jwt', { session: false }), modificarLector);
router.put('/admin/modificarEstudianteProyecto', passport.authenticate('jwt', { session: false }), modificarEstudianteProyecto);

router.post('/admin/agregarUsuarioRol', passport.authenticate('jwt', { session: false }), agregarUsuarioRol);
router.post('/admin/agregarLector', passport.authenticate('jwt', { session: false }), agregarLector);
router.post('/admin/agregarEstudianteProyecto', passport.authenticate('jwt', { session: false }), agregarEstudianteProyecto);
router.post('/admin/agregarEstudiante', passport.authenticate('jwt', { session: false }), agregarEstudiante);

module.exports = router;