const { Router } = require('express');
const passport = require('passport');
const { obtenerProyecto, obtenerEntregasPendientes , obtenerEntregasCompletadas, 
  obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas,
  obtenerSolicitudesPendientes,    obtenerSolicitudesAprobadas,  obtenerSolicitudesRechazadas,
    guardarReunion, obtenerReunion, 
   cancelarReunion, editarReunion, guardarSolicitud, guardarInfoActa, generarPDF, obtenerInfoActa, guardarLink, obtenerTipoSolicitud} = require('../controllers/proyecto.controller')

const router = Router()
const multer = require('multer');

const { guardarDocumentoYEntrega } = require('../controllers/documento.controller');

const upload = multer({ dest: 'uploads/' });

router.post('/entrega/guardar', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        await guardarDocumentoYEntrega(req, res, file);

    } catch (error) {
        console.error('Error al subir el archivo y guardar el documento y la entrega:', error);
        res.status(500).json({ message: 'Error al subir el archivo y guardar el documento y la entrega' });
    }
});
router.get('/proyecto/obtenerProyecto/:id', passport.authenticate('jwt', { session: false }), obtenerProyecto);
router.get('/proyecto/obtenerEntregasPendientes/:id', passport.authenticate('jwt', { session: false }), obtenerEntregasPendientes);
router.get('/proyecto/obtenerEntregasCompletadas/:id', passport.authenticate('jwt', { session: false }), obtenerEntregasCompletadas);
router.get('/proyecto/obtenerReunionesPendientes/:id', passport.authenticate('jwt', { session: false }), obtenerReunionesPendientes);
router.get('/proyecto/obtenerReunionesCompletas/:id', passport.authenticate('jwt', { session: false }), obtenerReunionesCompletas);
router.get('/proyecto/obtenerReunionesCanceladas/:id', passport.authenticate('jwt', { session: false }), obtenerReunionesCanceladas);
router.get('/proyecto/obtenerSolicitudesPendientes/:id', passport.authenticate('jwt', { session: false }), obtenerSolicitudesPendientes);
router.get('/proyecto/obtenerSolicitudesRechazadas/:id', passport.authenticate('jwt', { session: false }), obtenerSolicitudesRechazadas);
router.get('/proyecto/obtenerSolicitudesAprobadas/:id', passport.authenticate('jwt', { session: false }), obtenerSolicitudesAprobadas);
router.post('/proyecto/guardarReunion',  passport.authenticate('jwt', {session: false}), guardarReunion);
router.get('/proyecto/obtenerReunion/:id',  passport.authenticate('jwt', {session: false}), obtenerReunion);
router.post('/proyecto/cancelarReunion', passport.authenticate('jwt', {session: false}), cancelarReunion);
router.post('/proyecto/editarReunion', passport.authenticate('jwt', {session: false}), editarReunion);
router.post('/proyecto/guardarSolicitud', passport.authenticate('jwt', {session: false}), guardarSolicitud);
router.get('/proyecto/tipoSolicitud',  passport.authenticate('jwt', {session: false}), obtenerTipoSolicitud);
router.post('/proyecto/guardarInfoActa', passport.authenticate('jwt', {session: false}), guardarInfoActa);
router.post('/proyecto/generarPDF', passport.authenticate('jwt', {session: false}), generarPDF);
router.get('/proyecto/obtenerInfoActa/:id', passport.authenticate('jwt', {session: false}), obtenerInfoActa);
router.post('/proyecto/guardarLink', passport.authenticate('jwt', {session: false}), guardarLink);


module.exports = router;