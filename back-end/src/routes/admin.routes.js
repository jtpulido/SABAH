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
router.post('/registro', registro);
router.get('/admin/obtenerTodos', authenticateJWT, obtenerTodosProyectos);
router.get('/admin/obtenerTerminados', authenticateJWT, obtenerProyectosTerminados);
router.get('/admin/obtenerEnCurso', authenticateJWT, obtenerProyectosDesarrollo);
router.get('/admin/obtenerEstudiantes', authenticateJWT, obtenerEstudiantes);
router.get('/admin/verProyecto/:proyecto_id', authenticateJWT, obtenerProyecto);

router.post('/admin/obtenerProyectosActivos', authenticateJWT, obtenerProyectosActivos);
router.post('/admin/obtenerProyectosInactivos', authenticateJWT, obtenerProyectosInactivos);

router.post('/admin/obtenerProyectosDirector', authenticateJWT, obtenerProyectosDirector);
router.post('/admin/obtenerProyectosLector', authenticateJWT, obtenerProyectosLector);
router.post('/admin/obtenerProyectosJurado', authenticateJWT, obtenerProyectosJurado);

router.get('/admin/obtenerUsuarios', authenticateJWT, obtenerUsuarios);
router.post('/admin/verUsuario', authenticateJWT, verUsuario);
router.post('/admin/verEstudiante', authenticateJWT, verEstudiante);

router.post('/admin/agregarUsuario', authenticateJWT, agregarUsuario);
router.post('/admin/sendEmail', authenticateJWT, sendEmail);

router.post('/admin/rolDirector', authenticateJWT, rolDirector);
router.post('/admin/rolLector', authenticateJWT, rolLector);
router.post('/admin/rolJurado', authenticateJWT, rolJurado);

router.post('/admin/modificarUsuario', authenticateJWT, modificarUsuario);

router.put('/admin/cambiarEstado', authenticateJWT, cambiarEstado);
router.put('/admin/modificarProyecto', authenticateJWT, modificarProyecto);
router.post('/admin/cambioUsuarioRol', authenticateJWT, cambioUsuarioRol);

router.post('/admin/estudiantesNuevo', authenticateJWT, estudiantesNuevo);
router.post('/admin/estudiantesEliminados', authenticateJWT, estudiantesEliminados);

module.exports = router;