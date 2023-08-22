const express = require('express');
const passport = require('passport');
const router = express.Router();

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(401).json({ message: 'La sesión ha expirado. Por favor, inicie sesión nuevamente.' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const { obtenerProyectosDesarrolloRol, ultIdReunion, editarReunion, obtenerAsistencia, cancelarReunion, obtenerProyectosCerradosRol, obtenerProyecto, rolDirector, rolLector, rolJurado, verUsuario, obtenerSolicitudesPendientesResponderDirector, obtenerSolicitudesPendientesResponderComite, obtenerSolicitudesCerradasAprobadas, obtenerSolicitudesCerradasRechazadas, guardarSolicitud, agregarAprobacion, obtenerListaProyectos, obtenerReunionesPendientes, obtenerReunionesCanceladas, obtenerReunionesCompletas, crearReunionInvitados ,
  obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerProyecto, rolDirector, rolLector,ultIdReunion, editarReunion, obtenerAsistencia, rolJurado, verUsuario, obtenerSolicitudesPendientesResponderDirector, obtenerSolicitudesPendientesResponderComite, obtenerSolicitudesCerradasAprobadas, obtenerSolicitudesCerradasRechazadas, guardarSolicitud, agregarAprobacion, obtenerListaProyectos, guardarCalificacion, crearReunionInvitados  } = require('../controllers/usuarios.controller');
const { verEntregasPendientesUsuarioRol, verEntregasRealizadasCalificadasUsuarioRol, verEntregasRealizadasSinCalificarUsuarioRol } = require('../controllers/entregas.controller');
const { guardarCalificacionDoc, verInfoDocRetroalimentacion } = require('../controllers/documento.controller');



const multer = require('multer');

const upload = multer({ dest: 'uploads/retro/' });
//calificación
router.post('/usuario/guardarCalificacion', authenticateJWT, guardarCalificacion);

router.post('/usuario/documento/guardarCalificacion', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    await guardarCalificacionDoc(req, res, file);

  } catch (error) {
    console.log(error);
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

router.post('/usuario/obtenerReunionesPendientes', passport.authenticate('jwt', { session: false }), obtenerReunionesPendientes);
router.post('/usuario/obtenerReunionesCompletas', passport.authenticate('jwt', { session: false }), obtenerReunionesCompletas);
router.post('/usuario/obtenerReunionesCanceladas', passport.authenticate('jwt', { session: false }), obtenerReunionesCanceladas);

router.post('/usuario/crearReunionInvitados', passport.authenticate('jwt', { session: false }), crearReunionInvitados);
router.post('/usuario/cancelarReunion', passport.authenticate('jwt', { session: false }), cancelarReunion);
router.post('/usuario/editarReunion', passport.authenticate('jwt', { session: false }), editarReunion);
router.get('/usuario/obtenerAsistencia', passport.authenticate('jwt', { session: false }), obtenerAsistencia);
router.get('/usuario/ultIdReunion', passport.authenticate('jwt', { session: false }), ultIdReunion);

module.exports = router;