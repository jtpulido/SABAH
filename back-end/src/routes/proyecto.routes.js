const { Router } = require('express');
const passport = require('passport');

const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(401).json({ message: 'La sesión ha expirado. Por favor, inicie sesión nuevamente.' });
    }
      req.user = user;
      next();
    })(req, res, next);
  };

const { obtenerProyecto, obtenerEntregasPendientes , obtenerEntregasRealizadasCalificadas, obtenerEntregasRealizadasSinCalificar,
  obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas,
  obtenerSolicitudesPendientes,    obtenerSolicitudesAprobadas,  obtenerSolicitudesRechazadas,
    guardarReunion, obtenerReunion, 
   cancelarReunion, editarReunion, guardarSolicitud, guardarInfoActa, generarPDF, obtenerInfoActa, guardarLink, obtenerTipoSolicitud, obtenerLinkProyecto} = require('../controllers/proyecto.controller')

const router = Router()
const multer = require('multer');

const { guardarDocumentoYEntrega, } = require('../controllers/documento.controller');

const upload = multer({ dest: 'uploads/' });

router.post('/entrega/guardar', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        await guardarDocumentoYEntrega(req, res, file);

    } catch (error) {
        res.status(500).json({ message: 'Error al subir el archivo y guardar el documento y la entrega' });
    }
});
router.get('/proyecto/obtenerProyecto/:id', authenticateJWT, obtenerProyecto);
router.get('/proyecto/obtenerEntregasPendientes/:id', authenticateJWT, obtenerEntregasPendientes);
router.get('/proyecto/obtenerEntregasCalificadas/:id', authenticateJWT, obtenerEntregasRealizadasCalificadas);
router.get('/proyecto/obtenerEntregasSinCalificar/:id', authenticateJWT, obtenerEntregasRealizadasSinCalificar);
router.get('/proyecto/obtenerReunionesPendientes/:id', authenticateJWT, obtenerReunionesPendientes);
router.get('/proyecto/obtenerReunionesCompletas/:id', authenticateJWT, obtenerReunionesCompletas);
router.get('/proyecto/obtenerReunionesCanceladas/:id', authenticateJWT, obtenerReunionesCanceladas);
router.get('/proyecto/obtenerSolicitudesPendientes/:id', authenticateJWT, obtenerSolicitudesPendientes);
router.get('/proyecto/obtenerSolicitudesRechazadas/:id', authenticateJWT, obtenerSolicitudesRechazadas);
router.get('/proyecto/obtenerSolicitudesAprobadas/:id', authenticateJWT, obtenerSolicitudesAprobadas);
router.post('/proyecto/guardarReunion',  authenticateJWT, guardarReunion);
router.get('/proyecto/obtenerReunion/:id',  authenticateJWT, obtenerReunion);
router.post('/proyecto/cancelarReunion', authenticateJWT, cancelarReunion);
router.post('/proyecto/editarReunion', authenticateJWT, editarReunion);
router.post('/proyecto/guardarSolicitud', authenticateJWT, guardarSolicitud);
router.get('/proyecto/tipoSolicitud',  authenticateJWT, obtenerTipoSolicitud);
router.post('/proyecto/guardarInfoActa', authenticateJWT, guardarInfoActa);
router.post('/proyecto/generarPDF', authenticateJWT, generarPDF);
router.get('/proyecto/obtenerInfoActa/:id', authenticateJWT, obtenerInfoActa);
router.post('/proyecto/guardarLink', authenticateJWT, guardarLink);
router.get('/proyecto/obtenerLink/:id', authenticateJWT, obtenerLinkProyecto);


module.exports = router;