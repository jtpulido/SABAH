const express = require('express');
const passport = require('passport');
const router = express.Router();

const { obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerProyecto, rolDirector, rolLector, rolJurado, verUsuario, obtenerSolicitudesPendientesDirector, obtenerSolicitudesRechazadasDirector, obtenerSolicitudesAprobadasDirector, obtenerSolicitudesPendientesResponderDirector, obtenerSolicitudesPendientesResponderComite, obtenerSolicitudesCerradasAprobadas, obtenerSolicitudesCerradasRechazadas } = require('../controllers/usuarios.controller');

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

router.post('/usuario/verUsuario', passport.authenticate('jwt', { session: false }), verUsuario);

module.exports = router;