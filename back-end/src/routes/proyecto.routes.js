const { Router } = require('express');
const passport = require('passport');
const { subirArchivo } = require('../controllers/entregas.controller')
const { obtenerProyecto } = require('../controllers/proyecto.controller')
const router = Router()
const multer = require('multer');

const upload = multer({
    dest: './back-end/Documentos/',
    limits: {
      fileSize: 1024 * 1024 * 1024, // 1 GB (tamaño en bytes)
    },
  });
router.get('/obtenerProyecto', passport.authenticate('jwt', { session: false }), obtenerProyecto);
router.post('/subirArchivo', passport.authenticate('jwt', { session: false }), upload.single('file'),subirArchivo);



module.exports = router;