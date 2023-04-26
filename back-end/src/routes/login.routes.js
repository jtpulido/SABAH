const express = require('express');
const passport = require('passport');
const router = express.Router();

const { inicioSesion, confirmarCorreo, sendEmail, verificarCodigo, cambiarContrasena } = require('../controllers/login.controller');

router.post('/login', inicioSesion);

router.get('/perfil', passport.authenticate('jwt', { session: false }), (req, res) => {  res.json({
    id: req.user.id,
    correo: req.user.correo,
    tipo_usuario: req.user.id_tipo_usuario
  });
});

router.post('/confirmarCorreo', confirmarCorreo);

router.post('/sendEmail', sendEmail);

router.post('/verificarCodigo', verificarCodigo);

router.post('/cambiarContrasena', cambiarContrasena);

module.exports = router;
