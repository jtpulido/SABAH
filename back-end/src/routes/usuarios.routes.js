const express = require('express');
const passport = require('passport');
const router = express.Router();

const { obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerProyecto, rolDirector, rolLector, rolJurado, verUsuario, obtenerSolicitudesPendientesResponderDirector, obtenerSolicitudesPendientesResponderComite, obtenerSolicitudesCerradasAprobadas, obtenerSolicitudesCerradasRechazadas, guardarSolicitud, agregarAprobacion, obtenerListaProyectos, obtenerReunionesPendientes, obtenerReunionesCanceladas, obtenerReunionesCompletas } = require('../controllers/usuarios.controller');
const { verEntregasPendientesUsuarioRol, verEntregasRealizadasCalificadasUsuarioRol, verEntregasRealizadasSinCalificarUsuarioRol } = require('../controllers/entregas.controller');

router.post('/usuario/obtenerProyectosDesarrolloRol', passport.authenticate('jwt', { session: false }), obtenerProyectosDesarrolloRol);
router.post('/usuario/obtenerProyectosCerradosRol', passport.authenticate('jwt', { session: false }), obtenerProyectosCerradosRol);
router.get('/usuario/obtenerProyecto/:proyecto_id', passport.authenticate('jwt', { session: false }), obtenerProyecto);

router.post('/usuario/rolDirector', passport.authenticate('jwt', { session: false }), rolDirector);
router.post('/usuario/rolLector', passport.authenticate('jwt', { session: false }), rolLector);
router.post('/usuario/rolJurado', passport.authenticate('jwt', { session: false }), rolJurado);

router.get('/usuario/obtenerSolicitudesPendientes/:id', passport.authenticate('jwt', { session: false }), obtenerSolicitudesPendientesResponderDirector);
router.get('/usuario/obtenerSolicitudesPendientesComite/:id', passport.authenticate('jwt', { session: false }), obtenerSolicitudesPendientesResponderComite);
router.get('/usuario/obtenerSolicitudesCerradasAprobadas/:id', passport.authenticate('jwt', { session: false }), obtenerSolicitudesCerradasAprobadas);
router.get('/usuario/obtenerSolicitudesCerradasRechazadas/:id', passport.authenticate('jwt', { session: false }), obtenerSolicitudesCerradasRechazadas);
router.post('/usuario/guardarSolicitud', passport.authenticate('jwt', { session: false }), guardarSolicitud);
router.post('/usuario/solicitudes/agregarAprobacion', passport.authenticate('jwt', { session: false }), agregarAprobacion);
router.get('/usuario/obtenerProyectos/:id', passport.authenticate('jwt', { session: false }), obtenerListaProyectos);

router.get('/usuario/entregas/pendientes/:id_usuario/:id_rol', passport.authenticate('jwt', { session: false }), verEntregasPendientesUsuarioRol);
router.get('/usuario/entregas/realizadas/calificadas/:id_usuario/:id_rol', passport.authenticate('jwt', { session: false }), verEntregasRealizadasCalificadasUsuarioRol);
router.get('/usuario/entregas/realizadas/porCalificar/:id_usuario/:id_rol', passport.authenticate('jwt', { session: false }), verEntregasRealizadasSinCalificarUsuarioRol);

router.post('/usuario/verUsuario', passport.authenticate('jwt', { session: false }), verUsuario);

router.post('/usuario/obtenerReunionesPendientes', passport.authenticate('jwt', { session: false }), obtenerReunionesPendientes);
router.post('/usuario/obtenerReunionesCompletas', passport.authenticate('jwt', { session: false }), obtenerReunionesCompletas);
router.post('/usuario/obtenerReunionesCanceladas', passport.authenticate('jwt', { session: false }), obtenerReunionesCanceladas);

module.exports = router;