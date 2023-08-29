const express = require('express');
const passport = require('passport');
const router = express.Router();

const { registro, estudiantesNuevo, estudiantesEliminados, obtenerProyectosActivos, obtenerProyectosInactivos, verEstudiante, cambioUsuarioRol, obtenerEstudiantes, obtenerTodosProyectos, obtenerProyectosDirector, obtenerProyectosJurado, obtenerProyectosLector, obtenerProyectosTerminados, modificarProyecto, cambiarEstado, obtenerProyectosDesarrollo, obtenerProyecto, obtenerUsuarios, verUsuario, rolDirector, rolLector, rolJurado, agregarUsuario, sendEmail, modificarUsuario } = require('../controllers/admin.controller');
const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(401).json({ message: 'La sesión ha expirado. Por favor, inicie sesión nuevamente.' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const { nuevoUsuario } = require('../controllers/mail.controller');

router.post('/registro', registro);
router.get('/admin/obtenerTodos', authenticateJWT, obtenerTodosProyectos);
router.get('/admin/obtenerTerminados', authenticateJWT, obtenerProyectosTerminados);
router.get('/admin/obtenerEnCurso', authenticateJWT, obtenerProyectosDesarrollo);
router.get('/admin/obtenerEstudiantes', authenticateJWT, obtenerEstudiantes);
router.get('/admin/verProyecto/:proyecto_id', authenticateJWT, obtenerProyecto);

router.get('/admin/obtenerProyectosActivos/:id', authenticateJWT, obtenerProyectosActivos);
router.get('/admin/obtenerProyectosInactivos/:id', authenticateJWT, obtenerProyectosInactivos);

router.get('/admin/obtenerProyectosDirector/:id', authenticateJWT, obtenerProyectosDirector);
router.get('/admin/obtenerProyectosLector/:id', authenticateJWT, obtenerProyectosLector);
router.get('/admin/obtenerProyectosJurado/:id', authenticateJWT, obtenerProyectosJurado);

router.get('/admin/obtenerUsuarios', authenticateJWT, obtenerUsuarios);
router.get('/admin/verUsuario/:id', authenticateJWT, verUsuario);
router.get('/admin/verEstudiante/:id', authenticateJWT, verEstudiante);

router.post('/admin/agregarUsuario', authenticateJWT, agregarUsuario);

router.get('/admin/rolDirector/:id', authenticateJWT, rolDirector);
router.get('/admin/rolLector/:id', authenticateJWT, rolLector);
router.get('/admin/rolJurado/:id', authenticateJWT, rolJurado);

router.post('/admin/modificarUsuario', authenticateJWT, modificarUsuario);

router.put('/admin/cambiarEstado', authenticateJWT, cambiarEstado);
router.put('/admin/modificarProyecto', authenticateJWT, modificarProyecto);
router.post('/admin/cambioUsuarioRol', authenticateJWT, cambioUsuarioRol);

router.post('/admin/estudiantesNuevo', authenticateJWT, estudiantesNuevo);
router.post('/admin/estudiantesEliminados', authenticateJWT, estudiantesEliminados);

router.post('/admin/mailNuevoUsuario', authenticateJWT, nuevoUsuario);

module.exports = router;