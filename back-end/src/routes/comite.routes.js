const { Router } = require('express');
const passport = require('passport');
const router = Router()

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(401).json({ message: 'La sesión ha expirado. Por favor, inicie sesión nuevamente.' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const {
  obtenerProyecto,
  obtenerProyectosTerminados,
  obtenerProyectosDesarrollo,
  asignarCodigoProyecto,
  obtenerDirectoresProyectosActivos,
  obtenerDirectoresProyectosInactivos,
  obtenerJuradosProyectosActivos,
  obtenerJuradosProyectosInactivos,
  obtenerLectoresProyectosActivos,
  obtenerLectoresProyectosInactivos,
  obtenerSolicitudesPendientesComite,
  obtenerSolicitudesAprobadasComite,
  obtenerSolicitudesRechazadasComite,
  obtenerJuradosProyectosCerrados,
  obtenerDirectoresProyectosCerrados,
  obtenerLectoresProyectosCerrados,
  asignarNuevoCodigo,
  verAprobacionesSolicitud,
  verSolicitud,
  agregarAprobacion,
  obtenerUsuarios,
  cambioUsuarioRol,
  removerEstudiante,
  agregarEstudiante,
  asignarNuevoNombre,
  asignarFechaGrado,
  cambiarEtapa,
  cambiarEstado,
  obtenerItemsCumplimiento,
  obtenerReunionesPendientes,
  obtenerReunionesCanceladas,
  obtenerReunionesCompletas,
  obtenerInvitados,
  obtenerProyectosMeritorios,
  obtenerProyectosPostulados,
  obtenerSustentacionProyectos,
  elegirProyectoMeritorio,
  postularProyectoMeritorio,
  programarSustentacion,
  modificarSustentacion,
  obtenerProyectosSustentacion,
  cambiarEstadoTerminado,
  obtenerInfoActa, obtenerLinkProyecto,
  obtenerInfoDirector, obtenerInfoLector, obtenerInfoJurado, obtenerInfoCliente
} = require('../controllers/comite.controller')

const { crearAspecto, eliminarAspecto, modificarAspecto, obtenerAspectos, obtenerAspectoPorId,
  crearRubrica, obtenerRubricasConAspectos, eliminarRubrica, modificarRubrica,
  crearEspacio, eliminarEspacio, modificarEspacio, obtenerEspacio, obtenerEspacioPorId,
  obtenerEtapas, obtenerModalidades, obtenerRoles, obtenerRubricas,
  verEntregasPendientesProyecto, verEntregasRealizadasCalificadasProyecto, verEntregasRealizadasSinCalificarProyecto,
  verEntregasPendientes,
  verEntregasRealizadasCalificadas,
  verEntregasRealizadasSinCalificar,
  verAspectosEspacio, validarModificarRubrica, verCalificacionAspectos, obtenerEstados
} = require('../controllers/entregas.controller')

const { generarPDF } = require('../controllers/pdf.controller');

const { verInfoDocEntregado, descargarDocumento, descargarDocumentoRetroalimentacion, verInfoDocRetroalimentacion } = require('../controllers/documento.controller');
const { obtenerVistasDisponibles, obtenerColumnasDisponibles, generarReporte } = require('../controllers/reportes.controller');
router.get('/comite/usuarios', authenticateJWT, obtenerUsuarios);
router.post('/comite/cambiarUsuarioRol', authenticateJWT, cambioUsuarioRol);

router.get('/comite/obtenerTerminados', authenticateJWT, obtenerProyectosTerminados);
router.get('/comite/obtenerEnCurso', authenticateJWT, obtenerProyectosDesarrollo);
router.get('/comite/verProyecto/:proyecto_id', authenticateJWT, obtenerProyecto);
router.post('/comite/asignarCodigo', authenticateJWT, asignarCodigoProyecto);
router.post('/comite/cambiarCodigo', authenticateJWT, asignarNuevoCodigo);
router.post('/comite/cambiarNombre', authenticateJWT, asignarNuevoNombre);
router.post('/comite/cambiarEtapa', authenticateJWT, cambiarEtapa);
router.post('/comite/cambiarEstado', authenticateJWT, cambiarEstado);
router.post('/comite/terminarproyecto/:id_proyecto', authenticateJWT, cambiarEstadoTerminado);
router.get('/comite/directoresproyectos/activos', authenticateJWT, obtenerDirectoresProyectosActivos);
router.get('/comite/directoresproyectos/cerrados', authenticateJWT, obtenerDirectoresProyectosCerrados);
router.get('/comite/directoresproyectos/inactivos', authenticateJWT, obtenerDirectoresProyectosInactivos);
router.get('/comite/juradosproyectos/activos', authenticateJWT, obtenerJuradosProyectosActivos);
router.get('/comite/juradosproyectos/cerrados', authenticateJWT, obtenerJuradosProyectosCerrados);
router.get('/comite/juradosproyectos/inactivos', authenticateJWT, obtenerJuradosProyectosInactivos);
router.get('/comite/lectoresproyectos/activos', authenticateJWT, obtenerLectoresProyectosActivos);
router.get('/comite/lectoresproyectos/cerrados', authenticateJWT, obtenerLectoresProyectosCerrados);
router.get('/comite/lectoresproyectos/inactivos', authenticateJWT, obtenerLectoresProyectosInactivos);
router.put('/comite/estudiante/:id_estudiante/:id_proyecto', authenticateJWT, removerEstudiante);
router.put('/comite/estudiante/cambiarfecha', authenticateJWT, asignarFechaGrado);
router.post('/comite/estudiante/:id', authenticateJWT, agregarEstudiante);
router.get('/comite/solicitudes/pendienteaprobacion', authenticateJWT, obtenerSolicitudesPendientesComite);
router.get('/comite/solicitudes/aprobadas', authenticateJWT, obtenerSolicitudesAprobadasComite);
router.get('/comite/solicitudes/rechazadas', authenticateJWT, obtenerSolicitudesRechazadasComite);
router.get('/comite/solicitudes/verSolicitud/:solicitud_id', authenticateJWT, verSolicitud);
router.get('/comite/solicitudes/verAprobaciones/:solicitud_id', authenticateJWT, verAprobacionesSolicitud);
router.post('/comite/solicitudes/agregarAprobacion', authenticateJWT, agregarAprobacion);



// Rutas para aspectos
router.post('/comite/aspecto', authenticateJWT, crearAspecto);
router.delete('/comite/aspecto/:aspectoId', authenticateJWT, eliminarAspecto);
router.put('/comite/aspecto/:aspectoId', authenticateJWT, modificarAspecto);
router.get('/comite/aspecto', authenticateJWT, obtenerAspectos);
router.get('/comite/aspecto/:aspectoId', authenticateJWT, obtenerAspectoPorId);

// Rutas para espacios
router.post('/comite/espacio', authenticateJWT, crearEspacio);
router.delete('/comite/espacio/:espacio_id', authenticateJWT, eliminarEspacio);
router.put('/comite/espacio/:espacio_id', authenticateJWT, modificarEspacio);
router.get('/comite/espacio', authenticateJWT, obtenerEspacio);
router.get('/comite/espacio/:espacio_id', authenticateJWT, obtenerEspacioPorId);

router.get('/comite/estados', authenticateJWT, obtenerEstados);
router.get('/comite/etapas', authenticateJWT, obtenerEtapas);
router.get('/comite/modalidades', authenticateJWT, obtenerModalidades);
router.get('/comite/roles', authenticateJWT, obtenerRoles);

router.get('/comite/proyecto/postulado/meritorio', authenticateJWT, obtenerProyectosMeritorios);
router.post('/comite/proyecto/postulado/meritorio', authenticateJWT, elegirProyectoMeritorio);
router.get('/comite/proyecto/postulado', authenticateJWT, obtenerProyectosPostulados);
router.post('/comite/proyecto/postulado', authenticateJWT, postularProyectoMeritorio);

router.get('/comite/rubricas', authenticateJWT, obtenerRubricas);
router.post('/comite/crearRubrica', authenticateJWT, crearRubrica);
router.delete('/comite/rubrica/:rubrica_id', authenticateJWT, eliminarRubrica);
router.get('/comite/usoRubrica/:rubrica_id', authenticateJWT, validarModificarRubrica);
router.put('/comite/rubrica/:rubrica_id', authenticateJWT, modificarRubrica);

router.get('/comite/obtenerRubricasAspectos', authenticateJWT, obtenerRubricasConAspectos);

router.get('/comite/cumplimiento/:acro', authenticateJWT, obtenerItemsCumplimiento);
//Entregas proyecto
router.get('/comite/entregasProyecto/pendientes/:proyecto_id', authenticateJWT, verEntregasPendientesProyecto);
router.get('/comite/entregasProyecto/realizadas/calificadas/:proyecto_id', authenticateJWT, verEntregasRealizadasCalificadasProyecto);
router.get('/comite/entregasProyecto/realizadas/porCalificar/:proyecto_id', authenticateJWT, verEntregasRealizadasSinCalificarProyecto);

//Entregas general
router.get('/comite/entregas/pendientes', authenticateJWT, verEntregasPendientes);
router.get('/comite/entregas/realizadas/calificadas', authenticateJWT, verEntregasRealizadasCalificadas);
router.get('/comite/entregas/realizadas/porCalificar', authenticateJWT, verEntregasRealizadasSinCalificar);
router.get('/comite/documento/:id_doc_entrega', authenticateJWT, verInfoDocEntregado);
router.get('/comite/retroalimentacion/documento/:id', authenticateJWT, verInfoDocRetroalimentacion);
router.get('/descargar/:uuid', descargarDocumento);
router.get('/descargar/retroalimentacion/:uuid', descargarDocumentoRetroalimentacion);
router.get('/comite/documento/aspectos/:id_esp_entrega', authenticateJWT, verAspectosEspacio);

router.get('/comite/calificacion/aspectos/:id_calificacion', authenticateJWT, verCalificacionAspectos);

//reportes
router.get('/comite/vistas-disponibles', authenticateJWT, obtenerVistasDisponibles);
router.get('/comite/columnas-disponibles/:vista', authenticateJWT, obtenerColumnasDisponibles);
router.post('/comite/generarReporte', authenticateJWT, generarReporte);

// Reuniones
router.get('/comite/obtenerReunionesPendientes', authenticateJWT, obtenerReunionesPendientes);
router.get('/comite/obtenerReunionesCompletas', authenticateJWT, obtenerReunionesCompletas);
router.get('/comite/obtenerReunionesCanceladas', authenticateJWT, obtenerReunionesCanceladas);
router.get('/comite/obtenerInvitados/:id', passport.authenticate('jwt', { session: false }), obtenerInvitados);

router.get('/comite/sustentacion/proyectos', authenticateJWT, obtenerProyectosSustentacion);
router.get('/comite/sustentacion', authenticateJWT, obtenerSustentacionProyectos);
router.put('/comite/sustentacion/:id', authenticateJWT, modificarSustentacion);
router.post('/comite/programarSustentacion', passport.authenticate('jwt', { session: false }), programarSustentacion);

router.get('/comite/obtenerInfoActa/:idReunion', passport.authenticate('jwt', { session: false }), obtenerInfoActa);
router.post('/comite/generarPDF', passport.authenticate('jwt', { session: false }), generarPDF);

router.get('/comite/obtenerInfoDirector/:id', passport.authenticate('jwt', { session: false }), obtenerInfoDirector);
router.get('/comite/obtenerInfoLector/:id', passport.authenticate('jwt', { session: false }), obtenerInfoLector);
router.get('/comite/obtenerInfoJurado/:id', passport.authenticate('jwt', { session: false }), obtenerInfoJurado);
router.get('/comite/obtenerInfoCliente/:id', passport.authenticate('jwt', { session: false }), obtenerInfoCliente);

router.get('/comite/obtenerLink/:id', authenticateJWT, obtenerLinkProyecto);

module.exports = router;