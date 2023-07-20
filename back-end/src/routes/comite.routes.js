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
    crearRubrica, obtenerRubricasConAspectos, eliminarRubrica,modificarRubrica,
    crearEspacio, eliminarEspacio, modificarEspacio, obtenerEspacio, obtenerEspacioPorId,
    obtenerEtapas, obtenerModalidades, obtenerRoles, obtenerRubricas,
    verEntregasPendientesProyecto,
    verEntregasRealizadasProyecto,
    verEntregasPendientes,
    verEntregasRealizadasCalificadas,
    verEntregasRealizadasSinCalificar,
    verInfoDocEntregado,
    verAspectosEspacio,
    guardarCalificacion,validarModificarRubrica, validarModificarEspacio
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
router.get('/comite/verProyecto/:proyecto_id', passport.authenticate('jwt', { session: false }), obtenerProyecto);
router.post('/comite/asignarCodigo', passport.authenticate('jwt', { session: false }), asignarCodigoProyecto);
router.post('/comite/cambiarCodigo', passport.authenticate('jwt', { session: false }), asignarNuevoCodigo);
router.get('/comite/directoresproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerDirectoresProyectosActivos);
router.get('/comite/directoresproyectos/cerrados', passport.authenticate('jwt', { session: false }), obtenerDirectoresProyectosCerrados);
router.get('/comite/directoresproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerDirectoresProyectosInactivos);
router.get('/comite/juradosproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerJuradosProyectosActivos);
router.get('/comite/juradosproyectos/cerrados', passport.authenticate('jwt', { session: false }), obtenerJuradosProyectosCerrados);
router.get('/comite/juradosproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerJuradosProyectosInactivos);
router.get('/comite/lectoresproyectos/activos', passport.authenticate('jwt', { session: false }), obtenerLectoresProyectosActivos);
router.get('/comite/lectoresproyectos/cerrados', passport.authenticate('jwt', { session: false }), obtenerLectoresProyectosCerrados);
router.get('/comite/lectoresproyectos/inactivos', passport.authenticate('jwt', { session: false }), obtenerLectoresProyectosInactivos);

router.get('/comite/solicitudes/pendienteaprobacion', passport.authenticate('jwt', { session: false }), obtenerSolicitudesPendientesComite);
router.get('/comite/solicitudes/aprobadas', passport.authenticate('jwt', { session: false }), obtenerSolicitudesAprobadasComite);
router.get('/comite/solicitudes/rechazadas', passport.authenticate('jwt', { session: false }), obtenerSolicitudesRechazadasComite);
router.get('/comite/solicitudes/verSolicitud/:solicitud_id', passport.authenticate('jwt', { session: false }), verSolicitud);
router.get('/comite/solicitudes/verAprobaciones/:solicitud_id', passport.authenticate('jwt', { session: false }), verAprobacionesSolicitud);
router.post('/comite/solicitudes/agregarAprobacion', passport.authenticate('jwt', { session: false }), agregarAprobacion);



// Rutas para aspectos
router.post('/comite/aspecto', passport.authenticate('jwt', { session: false }), crearAspecto);
router.delete('/comite/aspecto/:aspectoId', passport.authenticate('jwt', { session: false }), eliminarAspecto);
router.put('/comite/aspecto/:aspectoId', passport.authenticate('jwt', { session: false }), modificarAspecto);
router.get('/comite/aspecto', passport.authenticate('jwt', { session: false }), obtenerAspectos);
router.get('/comite/aspecto/:aspectoId', passport.authenticate('jwt', { session: false }), obtenerAspectoPorId);

// Rutas para espacios
router.post('/comite/espacio', passport.authenticate('jwt', { session: false }), crearEspacio);
router.delete('/comite/espacio/:espacio_id', passport.authenticate('jwt', { session: false }), eliminarEspacio);
router.get('/comite/usoEspacio/:espacio_id', passport.authenticate('jwt', { session: false }), validarModificarEspacio);
router.put('/comite/espacio/:espacio_id', passport.authenticate('jwt', { session: false }), modificarEspacio);
router.get('/comite/espacio', passport.authenticate('jwt', { session: false }), obtenerEspacio);
router.get('/comite/espacio/:espacio_id', passport.authenticate('jwt', { session: false }), obtenerEspacioPorId);

router.get('/comite/etapas', passport.authenticate('jwt', { session: false }), obtenerEtapas);
router.get('/comite/modalidades', passport.authenticate('jwt', { session: false }), obtenerModalidades);
router.get('/comite/roles', passport.authenticate('jwt', { session: false }), obtenerRoles);

router.get('/comite/rubricas', passport.authenticate('jwt', { session: false }), obtenerRubricas);
router.post('/comite/crearRubrica', passport.authenticate('jwt', { session: false }), crearRubrica);
router.delete('/comite/rubrica/:rubrica_id', passport.authenticate('jwt', { session: false }), eliminarRubrica);
router.get('/comite/usoRubrica/:rubrica_id', passport.authenticate('jwt', { session: false }), validarModificarRubrica);
router.put('/comite/rubrica/:rubrica_id', passport.authenticate('jwt', { session: false }), modificarRubrica);

router.get('/comite/obtenerRubricasAspectos', passport.authenticate('jwt', { session: false }), obtenerRubricasConAspectos);


//Entregas proyecto
router.get('/comite/entrega/pendientes/:proyecto_id', passport.authenticate('jwt', { session: false }), verEntregasPendientesProyecto);
router.get('/comite/entrega/realizadas/:proyecto_id', passport.authenticate('jwt', { session: false }), verEntregasRealizadasProyecto);

//Entregas general
router.get('/comite/entregas/pendientes', passport.authenticate('jwt', { session: false }), verEntregasPendientes);
router.get('/comite/entregas/realizadas/calificadas', passport.authenticate('jwt', { session: false }), verEntregasRealizadasCalificadas);
router.get('/comite/entregas/realizadas/porCalificar', passport.authenticate('jwt', { session: false }), verEntregasRealizadasSinCalificar);
router.get('/comite/documento/:id_doc_entrega', passport.authenticate('jwt', { session: false }), verInfoDocEntregado);
router.get('/comite/documento/aspectos/:id_esp_entrega', passport.authenticate('jwt', { session: false }), verAspectosEspacio);

//calificación
router.post('/comite/documento/guardarCalificacion', passport.authenticate('jwt', { session: false }), guardarCalificacion);


module.exports = router;