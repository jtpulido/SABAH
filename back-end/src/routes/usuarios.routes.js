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

const { obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas, cancelarReunion, obtenerProyecto, rolDirector, rolLector, ultIdReunion, editarReunion, obtenerAsistencia, rolJurado, verUsuario, obtenerSolicitudesPendientesResponderDirector, obtenerSolicitudesPendientesResponderComite, obtenerSolicitudesCerradasAprobadas, obtenerSolicitudesCerradasRechazadas, guardarSolicitud, agregarAprobacion, obtenerListaProyectos, guardarCalificacion, crearReunionInvitados, verificarCalificacionesPendientes, verificarAproboEntregasCalificadas, cambiarEstadoEntregasFinales } = require('../controllers/usuarios.controller');

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
    res.status(500).json({ message: 'Error al subir el archivo y guardar el documento y la entrega' });
  }
});
router.get('/usuario/documento/:id', authenticateJWT, verInfoDocRetroalimentacion);

router.get('/usuario/obtenerProyectosDesarrolloRol/:idUsuario/:idRol', authenticateJWT, obtenerProyectosDesarrolloRol);
router.get('/usuario/obtenerProyectosCerradosRol/:idUsuario/:idRol', authenticateJWT, obtenerProyectosCerradosRol);
router.get('/usuario/obtenerProyecto/:proyecto_id', authenticateJWT, obtenerProyecto);

router.get('/usuario/rolDirector/:idUsuario', authenticateJWT, rolDirector);
router.get('/usuario/rolLector/:idUsuario', authenticateJWT, rolLector);
router.get('/usuario/rolJurado/:idUsuario', authenticateJWT, rolJurado);

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

router.get('/usuario/verUsuario/:id', authenticateJWT, verUsuario);

router.get('/usuario/obtenerReunionesPendientes/:idUsuario/:idRol', passport.authenticate('jwt', { session: false }), obtenerReunionesPendientes);
router.get('/usuario/obtenerReunionesCompletas/:idUsuario/:idRol', passport.authenticate('jwt', { session: false }), obtenerReunionesCompletas);
router.get('/usuario/obtenerReunionesCanceladas/:idUsuario/:idRol', passport.authenticate('jwt', { session: false }), obtenerReunionesCanceladas);

router.post('/usuario/crearReunionInvitados', passport.authenticate('jwt', { session: false }), crearReunionInvitados);
router.post('/usuario/cancelarReunion', passport.authenticate('jwt', { session: false }), cancelarReunion);
router.post('/usuario/editarReunion', passport.authenticate('jwt', { session: false }), editarReunion);
router.get('/usuario/obtenerAsistencia', passport.authenticate('jwt', { session: false }), obtenerAsistencia);
router.get('/usuario/ultIdReunion', passport.authenticate('jwt', { session: false }), ultIdReunion);

// Ruta para verificar calificaciones pendientes
router.get('/verificar-calificaciones-pendientes/:proyectoId/:etapaId/:anio/:periodo/:modalidadId', verificarCalificacionesPendientes);
router.get('/verificar-calificaciones/:proyectoId/:etapaId/:anio/:periodo/:modalidadId', verificarAproboEntregasCalificadas);
router.put('/verificar-calificaciones/cambiar-estado', cambiarEstadoEntregasFinales)

module.exports = router;