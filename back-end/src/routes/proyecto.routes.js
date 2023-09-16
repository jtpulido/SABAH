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

const { obtenerProyecto, obtenerInfoDirector, obtenerInfoJurado, obtenerInfoLector, obtenerEntregasPendientes, obtenerEntregasRealizadasCalificadas, obtenerEntregasRealizadasSinCalificar,
  obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas,
  obtenerSolicitudesPendientes, obtenerSolicitudesAprobadas, obtenerSolicitudesRechazadas, obtenerInfoCliente, ultIdReunion, crearReunionInvitados, obtenerInvitados,
  cancelarReunion, editarReunion, guardarSolicitud, guardarInfoActa, obtenerInfoActa, guardarLink, obtenerTipoSolicitud, obtenerLinkProyecto } = require('../controllers/proyecto.controller')
const { generarPDF } = require('../controllers/pdf.controller')
const router = Router()
const multer = require('multer');

const { guardarDocumentoYEntrega, } = require('../controllers/documento.controller');
const storage = multer.memoryStorage();
const upload = multer({  storage: storage});

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

router.post('/proyecto/cancelarReunion', authenticateJWT, cancelarReunion);
router.post('/proyecto/editarReunion', authenticateJWT, editarReunion);
router.post('/proyecto/guardarSolicitud', authenticateJWT, guardarSolicitud);
router.get('/proyecto/tipoSolicitud', authenticateJWT, obtenerTipoSolicitud);

router.post('/proyecto/guardarInfoActa', authenticateJWT, guardarInfoActa);


router.get('/proyecto/obtenerInfoActa/:idReunion', authenticateJWT, obtenerInfoActa);
router.post('/proyecto/guardarLink', authenticateJWT, guardarLink);
router.get('/proyecto/obtenerLink/:id', authenticateJWT, obtenerLinkProyecto);

router.get('/proyecto/obtenerInfoDirector/:id', passport.authenticate('jwt', { session: false }), obtenerInfoDirector);
router.get('/proyecto/obtenerInfoLector/:id', passport.authenticate('jwt', { session: false }), obtenerInfoLector);
router.get('/proyecto/obtenerInfoJurado/:id', passport.authenticate('jwt', { session: false }), obtenerInfoJurado);
router.get('/proyecto/obtenerInfoCliente/:id', passport.authenticate('jwt', { session: false }), obtenerInfoCliente);

router.get('/proyecto/ultIdReunion', passport.authenticate('jwt', { session: false }), ultIdReunion);
router.post('/proyecto/crearReunionInvitados', passport.authenticate('jwt', { session: false }), crearReunionInvitados);

router.get('/proyecto/obtenerInvitados/:id', passport.authenticate('jwt', { session: false }), obtenerInvitados);

module.exports = router;