const { Router } = require('express');
const passport = require('passport');

const {
    obtenerProyecto,
    obtenerTodosProyectos,
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
    agregarAprobacion
} = require('../controllers/comite.controller')

const {crearItem, eliminarItem, modificarItem, obtenerItems, obtenerItemPorId, crearRubrica,obtenerRubricasConItems
} = require('../controllers/entregas.controller')

const router = Router()


router.get('/comite/obtenerTodos', passport.authenticate('jwt', { session: false }), obtenerTodosProyectos);
router.get('/comite/obtenerTerminados', passport.authenticate('jwt', { session: false }), obtenerProyectosTerminados);
router.get('/comite/obtenerEnCurso', passport.authenticate('jwt', { session: false }), obtenerProyectosDesarrollo);
router.post('/comite/verProyecto', passport.authenticate('jwt', { session: false }), obtenerProyecto);
router.post('/comite/asignarCodigo', passport.authenticate('jwt', { session: false }), asignarCodigoProyecto);
router.post('/comite/cambiarCodigo', passport.authenticate('jwt', { session: false }), asignarNuevoCodigo);
router.post('/comite/directoresproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerDirectoresProyectosActivos);
router.post('/comite/directoresproyectos/cerrados', passport.authenticate('jwt', { session: false }), obtenerDirectoresProyectosCerrados);
router.post('/comite/directoresproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerDirectoresProyectosInactivos);
router.post('/comite/juradosproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerJuradosProyectosActivos);
router.post('/comite/juradosproyectos/cerrados', passport.authenticate('jwt', { session: false }), obtenerJuradosProyectosCerrados);
router.post('/comite/juradosproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerJuradosProyectosInactivos);
router.post('/comite/lectoresproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerLectoresProyectosActivos);
router.post('/comite/lectoresproyectos/cerrados', passport.authenticate('jwt', { session: false }), obtenerLectoresProyectosCerrados);
router.post('/comite/lectoresproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerLectoresProyectosInactivos);
router.post('/comite/solicitudes/pendienteaprobacion', passport.authenticate('jwt', { session: false }), obtenerSolicitudesPendientesComite);
router.post('/comite/solicitudes/aprobadas', passport.authenticate('jwt', { session: false }), obtenerSolicitudesAprobadasComite);
router.post('/comite/solicitudes/rechazadas', passport.authenticate('jwt', { session: false }), obtenerSolicitudesRechazadasComite);
router.post('/comite/solicitudes/verSolicitud', passport.authenticate('jwt', { session: false }), verSolicitud);
router.post('/comite/solicitudes/verAprobaciones', passport.authenticate('jwt', { session: false }), verAprobacionesSolicitud);
router.post('/comite/solicitudes/agregarAprobacion', passport.authenticate('jwt', { session: false }), agregarAprobacion);



// Rutas para items
router.post('/comite/item', passport.authenticate('jwt', { session: false }),crearItem);
router.delete('/comite/item/:itemId', passport.authenticate('jwt', { session: false }),eliminarItem);
router.put('/comite/item/:itemId',passport.authenticate('jwt', { session: false }), modificarItem);
router.get('/comite/item', passport.authenticate('jwt', { session: false }),obtenerItems);
router.get('/comite/item/:itemId', passport.authenticate('jwt', { session: false }),obtenerItemPorId);
router.post('/comite/rubrica', passport.authenticate('jwt', { session: false }),crearRubrica);
router.get('/comite/obtenerRubricasConItems', passport.authenticate('jwt', { session: false }),obtenerRubricasConItems);


module.exports = router;