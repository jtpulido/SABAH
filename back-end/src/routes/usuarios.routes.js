const express = require('express');
const passport = require('passport');
const router = express.Router();

const { obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerProyecto } = require('../controllers/usuarios.controller');

router.post('/usuario/obtenerProyectosDesarrolloRol', passport.authenticate('jwt', { session: false }), obtenerProyectosDesarrolloRol);
router.post('/usuario/obtenerProyectosCerradosRol', passport.authenticate('jwt', { session: false }), obtenerProyectosCerradosRol);
router.post('/usuario/obtenerProyecto', passport.authenticate('jwt', { session: false }), obtenerProyecto);

module.exports = router;