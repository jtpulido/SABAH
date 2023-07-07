const { Router } = require('express');
const passport = require('passport');

const multer = require('multer');
const router = Router()

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
    agregarAprobacion
} = require('../controllers/comite.controller')

const { crearAspecto, eliminarAspecto, modificarAspecto, obtenerAspectos, obtenerAspectoPorId,
    crearRubrica, obtenerRubricasConAspectos,
    crearEspacio, eliminarEspacio, modificarEspacio, obtenerEspacio, obtenerEspacioPorId,
    obtenerEtapas, obtenerModalidades, obtenerRoles, obtenerRubricas,
    verEntregasPendientes,
    verEntregasRealizadas
} = require('../controllers/entregas.controller')

const { guardarDocumentoYEntrega } = require('../controllers/documento.controller');

const upload = multer({ dest: 'uploads/' });

router.post('/comite/guardar', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        await guardarDocumentoYEntrega(req, res, file);

    } catch (error) {
        console.error('Error al subir el archivo y guardar el documento y la entrega:', error);
        res.status(500).json({ message: 'Error al subir el archivo y guardar el documento y la entrega' });
    }
});

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



// Rutas para aspectos
router.post('/comite/aspecto', passport.authenticate('jwt', { session: false }), crearAspecto);
router.delete('/comite/aspecto/:aspectoId', passport.authenticate('jwt', { session: false }), eliminarAspecto);
router.put('/comite/aspecto/:aspectoId', passport.authenticate('jwt', { session: false }), modificarAspecto);
router.get('/comite/aspecto', passport.authenticate('jwt', { session: false }), obtenerAspectos);
router.get('/comite/aspecto/:aspectoId', passport.authenticate('jwt', { session: false }), obtenerAspectoPorId);
router.post('/comite/crearRubrica', passport.authenticate('jwt', { session: false }), crearRubrica);
router.get('/comite/obtenerRubricasConAspectos', passport.authenticate('jwt', { session: false }), obtenerRubricasConAspectos);

// Rutas para espacios
router.post('/comite/espacio', passport.authenticate('jwt', { session: false }), crearEspacio);
router.delete('/comite/espacio/:espacio_id', passport.authenticate('jwt', { session: false }), eliminarEspacio);
router.put('/comite/espacio/:espacio_id', passport.authenticate('jwt', { session: false }), modificarEspacio);
router.get('/comite/espacio', passport.authenticate('jwt', { session: false }), obtenerEspacio);
router.get('/comite/espacio/:espacio_id', passport.authenticate('jwt', { session: false }), obtenerEspacioPorId);

router.get('/comite/etapas', passport.authenticate('jwt', { session: false }), obtenerEtapas);
router.get('/comite/modalidades', passport.authenticate('jwt', { session: false }), obtenerModalidades);
router.get('/comite/roles', passport.authenticate('jwt', { session: false }), obtenerRoles);
router.get('/comite/rubricas', passport.authenticate('jwt', { session: false }), obtenerRubricas);

//Entregas
router.get('/comite/entrega/pendientes/:proyecto_id', passport.authenticate('jwt', { session: false }), verEntregasPendientes);
router.get('/comite/entrega/realizadas/:proyecto_id', passport.authenticate('jwt', { session: false }), verEntregasRealizadas);

module.exports = router;