const express = require('express');
const passport = require('passport');
const router = express.Router();
const { inicioSesion, confirmarCorreo, confirmarCodigo, cambiarContrasenaProyecto, getEstados, getEtapas, verificarCodigo, cambiarContrasena, codigoProy, getModalidades, getDirectores, inscribirPropuesta } = require('../controllers/login.controller');
const { codigoVerificacion, codigoVerificacionEstudiantes } = require('../controllers/mail.controller');

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(401).json({ message: 'La sesión ha expirado. Por favor, inicie sesión nuevamente.' });
    }
    req.user = user;
    next();
  })(req, res, next);
};
router.post('/login', inicioSesion);
router.get('/perfil', authenticateJWT, (req, res) => {
  res.json({
    id: req.user.id,
    correo: req.user.correo,
    tipo_usuario: req.user.id_tipo_usuario
  });
});

router.post('/confirmarCorreo', confirmarCorreo);
router.post('/login/confirmarCodigo', confirmarCodigo);

router.post('/verificarCodigo', verificarCodigo);
router.post('/cambiarContrasena', cambiarContrasena);
router.post('/cambiarContrasenaProyecto', cambiarContrasenaProyecto);
router.get('/codigoProy', codigoProy);
router.get('/getModalidades', getModalidades);
router.get('/getDirectores', getDirectores);
router.get('/getEstados', getEstados);
router.get('/getEtapas', getEtapas);
router.post('/inscribirPropuesta', inscribirPropuesta);

router.post('/sendEmail', codigoVerificacion);
router.post('/sendEmails', codigoVerificacionEstudiantes);

module.exports = router;
