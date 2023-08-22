const express = require('express');
const passport = require('passport');
const router = express.Router();

const { obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerProyecto, rolDirector, rolLector, rolJurado, verUsuario, obtenerSolicitudesPendientesResponderDirector, obtenerSolicitudesPendientesResponderComite, obtenerSolicitudesCerradasAprobadas, obtenerSolicitudesCerradasRechazadas, guardarSolicitud, agregarAprobacion, obtenerListaProyectos, guardarCalificacion } = require('../controllers/usuarios.controller');
const { verEntregasPendientesUsuarioRol, verEntregasRealizadasCalificadasUsuarioRol, verEntregasRealizadasSinCalificarUsuarioRol } = require('../controllers/entregas.controller');
const { guardarCalificacionDoc, verInfoDocRetroalimentacion } = require('../controllers/documento.controller');

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(401).json({ message: 'La sesión ha expirado. Por favor, inicie sesión nuevamente.' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const multer = require('multer');

const upload = multer({ dest: 'uploads/retro/' });

//calificación
router.post('/usuario/guardarCalificacion', authenticateJWT, guardarCalificacion);

router.post('/usuario/documento/guardarCalificacion', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    await guardarCalificacionDoc(req, res, file);

  } catch (error) {
    res.status(500).json({ message: 'Error al subir el archivo y guardar el documento y la entrega' });
  }
});

router.get('/usuario/documento/:id', authenticateJWT, verInfoDocRetroalimentacion);

router.post('/usuario/obtenerProyectosDesarrolloRol', authenticateJWT, obtenerProyectosDesarrolloRol);
router.post('/usuario/obtenerProyectosCerradosRol', authenticateJWT, obtenerProyectosCerradosRol);
router.get('/usuario/obtenerProyecto/:proyecto_id', authenticateJWT, obtenerProyecto);

router.post('/usuario/rolDirector', authenticateJWT, rolDirector);
router.post('/usuario/rolLector', authenticateJWT, rolLector);
router.post('/usuario/rolJurado', authenticateJWT, rolJurado);

router.get('/usuario/obtenerSolicitudesPendientes/:id', authenticateJWT, obtenerSolicitudesPendientesResponderDirector);
router.get('/usuario/obtenerSolicitudesPendientesComite/:id', authenticateJWT, obtenerSolicitudesPendientesResponderComite);
router.get('/usuario/obtenerSolicitudesCerradasAprobadas/:id', authenticateJWT, obtenerSolicitudesCerradasAprobadas);
router.get('/usuario/obtenerSolicitudesCerradasRechazadas/:id', authenticateJWT, obtenerSolicitudesCerradasRechazadas);
router.post('/usuario/guardarSolicitud', authenticateJWT, guardarSolicitud);
router.post('/usuario/solicitudes/agregarAprobacion', authenticateJWT, agregarAprobacion);
router.get('/usuario/obtenerProyectos/:id', authenticateJWT, obtenerListaProyectos);

router.get('/usuario/entregas/pendientes/:id_usuario/:id_rol', authenticateJWT, verEntregasPendientesUsuarioRol);
router.get('/usuario/entregas/realizadas/calificadas/:id_usuario/:id_rol', authenticateJWT, verEntregasRealizadasCalificadasUsuarioRol);
router.get('/usuario/entregas/realizadas/porCalificar/:id_usuario/:id_rol', authenticateJWT, verEntregasRealizadasSinCalificarUsuarioRol);

router.post('/usuario/verUsuario', authenticateJWT, verUsuario);

module.exports = router;