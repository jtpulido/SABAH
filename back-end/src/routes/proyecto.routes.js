const { Router } = require('express');
const passport = require('passport');
const { subirArchivo } = require('../controllers/entregas.controller')
const { obtenerProyecto, obtenerEntregasPendientes , obtenerEntregasCompletadas, 
  obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas,
   obtenerSolicitudesPendientes, obtenerSolicitudesCompletas, guardarReunion, obtenerReunion, 
   cancelarReunion, editarReunion} = require('../controllers/proyecto.controller')

const router = Router()
const multer = require('multer');

const upload = multer({
    dest: './back-end/Documentos/',
    limits: {
      fileSize: 1024 * 1024 * 1024, // 1 GB (tamaño en bytes)
    },
  });
router.get('/proyecto/obtenerProyecto/:id', passport.authenticate('jwt', { session: false }), obtenerProyecto);
//router.post('/proyecto/subirArchivo', passport.authenticate('jwt', { session: false }), upload.single('file'),subirArchivo);
router.get('/proyecto/obtenerEntregasPendientes/:id', passport.authenticate('jwt', { session: false }), obtenerEntregasPendientes);
router.get('/proyecto/obtenerEntregasCompletadas/:id', passport.authenticate('jwt', { session: false }), obtenerEntregasCompletadas);
router.get('/proyecto/obtenerReunionesPendientes/:id', passport.authenticate('jwt', { session: false }), obtenerReunionesPendientes);
router.get('/proyecto/obtenerReunionesCompletas/:id', passport.authenticate('jwt', { session: false }), obtenerReunionesCompletas);
router.get('/proyecto/obtenerReunionesCanceladas/:id', passport.authenticate('jwt', { session: false }), obtenerReunionesCanceladas);
router.get('/proyecto/obtenerSolicitudesPendientes/:id', passport.authenticate('jwt', { session: false }), obtenerSolicitudesPendientes);
router.get('/proyecto/obtenerSolicitudesCompletas/:id', passport.authenticate('jwt', { session: false }), obtenerSolicitudesCompletas);
router.post('/proyecto/guardarReunion',  passport.authenticate('jwt', {session: false}), guardarReunion);
router.get('/proyecto/obtenerReunion/:id',  passport.authenticate('jwt', {session: false}), obtenerReunion);
router.post('/proyecto/cancelarReunion', passport.authenticate('jwt', {session: false}), cancelarReunion);
router.post('/proyecto/editarReunion', passport.authenticate('jwt', {session: false}), editarReunion);

module.exports = router;