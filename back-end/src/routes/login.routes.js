const express = require('express');
const passport = require('passport');
const router = express.Router();
const { inicioSesion, confirmarCorreo, confirmarCodigo, getEstados, getEtapas, sendEmail, verificarCodigo, cambiarContrasena, codigoProy, getModalidades, getDirectores, inscribirPropuesta, getIdUltProy, agregarEstudiante, getIdUltEst, agregarEstudianteProyecto, agregarUsuarioRol } = require('../controllers/login.controller');

router.post('/login', inicioSesion);
router.get('/perfil', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    correo: req.user.correo,
    tipo_usuario: req.user.id_tipo_usuario
  });
});

router.post('/confirmarCorreo', confirmarCorreo);
router.post('/login/confirmarCodigo', confirmarCodigo);
router.post('/sendEmail', sendEmail);
router.post('/verificarCodigo', verificarCodigo);
router.post('/cambiarContrasena', cambiarContrasena);
router.get('/codigoProy', codigoProy);
router.get('/getModalidades', getModalidades);
router.get('/getDirectores', getDirectores);
router.get('/getEstados', getEstados);
router.get('/getEtapas', getEtapas);
router.post('/inscribirPropuesta', inscribirPropuesta);
router.get('/getIdUltProy', getIdUltProy);
router.post('/login/agregarEstudiante', agregarEstudiante);
router.get('/getIdUltEst', getIdUltEst);
router.post('/agregarEstudianteProyecto', agregarEstudianteProyecto);
router.post('/agregarUsuarioRol', agregarUsuarioRol);

module.exports = router;
