const express = require('express');
const passport = require('passport');
const router = express.Router();

const { obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerProyecto, rolDirector, rolLector, rolJurado, verUsuario } = require('../controllers/usuarios.controller');

router.post('/usuario/obtenerProyectosDesarrolloRol', passport.authenticate('jwt', { session: false }), obtenerProyectosDesarrolloRol);
router.post('/usuario/obtenerProyectosCerradosRol', passport.authenticate('jwt', { session: false }), obtenerProyectosCerradosRol);
router.post('/usuario/obtenerProyecto', passport.authenticate('jwt', { session: false }), obtenerProyecto);

router.post('/usuario/rolDirector', passport.authenticate('jwt', { session: false }), rolDirector);
router.post('/usuario/rolLector', passport.authenticate('jwt', { session: false }), rolLector);
router.post('/usuario/rolJurado', passport.authenticate('jwt', { session: false }), rolJurado);

router.post('/usuario/verUsuario', passport.authenticate('jwt', { session: false }), verUsuario);

module.exports = router;