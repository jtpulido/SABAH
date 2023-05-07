const { Router } = require('express');
const passport = require('passport');
const { obtenerProyecto, obtenerTodosProyectos, obtenerProyectosTerminados, obtenerProyectosDesarrollo, asignarCodigoProyecto, obtenerDirectoresProyectosActivos, obtenerDirectoresProyectosInactivos, obtenerJuradosProyectosActivos, obtenerJuradosProyectosInactivos, obtenerLectoresProyectosActivos, obtenerLectoresProyectosInactivos, obtenerSolicitudesPendientesComite, obtenerSolicitudesAprobadasComite, obtenerReportesRechazadosComite, obtenerReportesPendientesComite, obtenerReportesAprobadosComite, obtenerSolicitudesRechazadasComite } = require('../controllers/comite.controller')
const router = Router()


router.get('/comite/obtenerTodos', passport.authenticate('jwt', { session: false }), obtenerTodosProyectos);
router.get('/comite/obtenerTerminados', passport.authenticate('jwt', { session: false }), obtenerProyectosTerminados);
router.get('/comite/obtenerEnCurso', passport.authenticate('jwt', { session: false }), obtenerProyectosDesarrollo);
router.post('/comite/verProyecto', passport.authenticate('jwt', { session: false }), obtenerProyecto);
router.post('/comite/asignarCodigo', passport.authenticate('jwt', { session: false }), asignarCodigoProyecto);
router.post('/comite/directoresproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerDirectoresProyectosActivos);
router.post('/comite/directoresproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerDirectoresProyectosInactivos);
router.post('/comite/juradosproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerJuradosProyectosActivos);
router.post('/comite/juradosproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerJuradosProyectosInactivos);
router.post('/comite/lectoresproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerLectoresProyectosActivos);
router.post('/comite/lectoresproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerLectoresProyectosInactivos);
router.post('/comite/solicitudes/pendienteaprobacion', passport.authenticate('jwt', { session: false }), obtenerSolicitudesPendientesComite);
router.post('/comite/solicitudes/aprobadas', passport.authenticate('jwt', { session: false }), obtenerSolicitudesAprobadasComite);
router.post('/comite/solicitudes/rechazadas', passport.authenticate('jwt', { session: false }), obtenerSolicitudesRechazadasComite);
router.post('/comite/reportes/pendienteaprobacion', passport.authenticate('jwt', { session: false }), obtenerReportesPendientesComite);
router.post('/comite/reportes/aprobados', passport.authenticate('jwt', { session: false }), obtenerReportesAprobadosComite);
router.post('/comite/reportes/rechazados', passport.authenticate('jwt', { session: false }), obtenerReportesRechazadosComite);

module.exports = router;