const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database')
const { JWT_SECRET } = require('../config')

const { nuevaPropuestaVarios, nuevaPropuesta } = require('../controllers/mail.controller');

const crypto = require('crypto');

const inicioSesion = async (req, res) => {
  const { username, password } = req.body;
  await pool.query('SELECT u.*, tu.tipo AS id_tipo_usuario FROM usuario u JOIN tipo_usuario tu ON u.id_tipo_usuario= tu.id WHERE LOWER(u.correo)=LOWER($1)', [username], (error, result) => {

    if (error) {
      return res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
    if (result.rowCount === 1) {

      const usuario = result.rows[0];
      bcrypt.compare(password, usuario.contrasena, (error, match) => {
        if (error) {

          return res.status(401).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
        }
        if (match) {
          const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '1h' });
          return res.status(200).json({ success: true, token, tipo_usuario: usuario.id_tipo_usuario, id_usuario: usuario.id });
        } else {
          return res.status(401).json({ success: false, message: 'Autenticación fallida: Contraseña inválida.' });
        }
      });
    } else {
      // Verificar si existe el proyecto
      pool.query("SELECT pr.id, i.contrasena FROM inicio_sesion i, proyecto pr WHERE i.id_proyecto = pr.id AND pr.codigo = $1", [username], (error, result) => {
        if (error) {
          return res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
        }
        if (result.rowCount === 1) {
          const usuario = result.rows[0];
          bcrypt.compare(password, usuario.contrasena, (error, match) => {
            if (error) {
              return res.status(401).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
            }
            if (match) {
              const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '1h' });
              return res.status(200).json({ success: true, token, tipo_usuario: 'proyecto', id_usuario: usuario.id });
            } else {
              return res.status(401).json({ success: false, message: 'Autenticación fallida: Contraseña inválida.' });
            }
          });
        } else {
          return res.status(401).json({ success: false, message: 'Autenticación fallida: Usuario no encontrado.' });
        }
      });
    }
  });
};

const confirmarCorreo = async (req, res) => {
  const { correo } = req.body;
  try {
    const result = await pool.query('SELECT u.* FROM usuario u WHERE LOWER(u.correo)=LOWER($1) AND u.estado = true', [correo]);
    if (result.rowCount === 1) {
      const usuario = result.rows[0];
      return res.status(200).json({ success: true, correo: usuario.correo });
    } else {
      return res.status(401).json({ success: false, message: 'Autenticación fallida: Usuario no encontrado.' });
    }

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const confirmarCodigo = async (req, res) => {
  const { codigo } = req.body;
  try {
    const result = await pool.query('SELECT e.correo FROM estudiante e JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante JOIN proyecto pr ON ep.id_proyecto = pr.id WHERE LOWER(pr.codigo) = LOWER($1)', [codigo]);
    const correos = result.rows
    if (result.rowCount > 0) {
      req.app.locals.codigoProyecto = codigo;
      return res.status(200).json({ success: true, correos });
    } else {
      return res.status(401).json({ success: false, message: 'Autenticación fallida: Usuario no encontrado.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const verificarCodigo = async (req, res) => {
  const { codigo } = req.body;
  const codigoCreado = req.app.locals.codigoCreado;
  if (codigo === codigoCreado) {
    return res.status(200).json({ success: true, message: 'Código de verificación válido.' });
  } else {
    return res.status(401).json({ success: false, message: 'Código de verificación inválido.' });
  }
};

const cambiarContrasena = async (req, res) => {
  const { contrasena } = req.body;
  const correo = req.app.locals.correo;
  const hashedPassword = await bcrypt.hash(contrasena, 10);
  try {
    await pool.query("UPDATE usuario SET contrasena=$1 WHERE correo=$2", [hashedPassword, correo]);
    return res.json({ success: true, message: "Contraseña cambiada con éxito." });
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const cambiarContrasenaProyecto = async (req, res) => {
  const { contrasena } = req.body;
  const codigoProyecto = req.app.locals.codigoProyecto;
  const hashedPassword = await bcrypt.hash(contrasena, 10);
  try {
    const result = await pool.query("SELECT i.id FROM inicio_sesion i, proyecto pr WHERE i.id_proyecto = pr.id AND pr.codigo = $1", [codigoProyecto]);
    if (result.rowCount > 0) {
      await pool.query("UPDATE inicio_sesion AS i SET contrasena=$1 FROM proyecto pr WHERE i.id_proyecto=pr.id AND pr.codigo=$2", [hashedPassword, codigoProyecto]);
      return res.json({ success: true, message: "Contraseña cambiada con éxito." });
    } else {
      await pool.query("INSERT INTO inicio_sesion(id_proyecto, contrasena) SELECT pr.id, $1 FROM proyecto AS pr WHERE pr.codigo=$2", [hashedPassword, codigoProyecto]);
      return res.json({ success: true, message: "Contraseña cambiada con éxito." });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const getIdUltProy = async (req, res) => {
  try {
    const result = await pool.query("SELECT MAX(id) FROM proyecto");
    const num = result.rows[0].max || 0;
    if (num !== null) {
      return res.json({ success: true, num });
    } else {
      return res.status(404).json({ success: true, num: 0 });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }

  const id = result.rows[0].max || 0;

};

const getIdUltEst = async (req, res) => {
  try {
    const result = await pool.query("SELECT MAX(id) FROM estudiante");
    const num = result.rows[0].max || 0;
    if (num !== null) {
      return res.json({ success: true, num });
    } else {
      return res.status(404).json({ success: true, num: 0 });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const codigoProy = async (req, res) => {
  try {
    const result = await pool.query("SELECT MAX(codigo) FROM proyecto WHERE codigo LIKE 'TEM%'");
    const codigo = result.rows[0].max || 0;
    if (codigo !== null) {
      return res.json({ success: true, codigo });
    } else {
      return res.status(404).json({ success: true, codigo: 0 });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const getModalidades = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM modalidad ORDER BY nombre ASC");
    const modalidades = result.rows

    if (result.rowCount > 0) {
      return res.json({ success: true, modalidades });
    } else {
      return res.status(401).json({ success: true, message: 'No hay modalidades actualmente.' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const getDirectores = async (req, res) => {
  try {
    const result = await pool.query("SELECT u.id, u.nombre FROM usuario u WHERE id_tipo_usuario=2 AND u.estado=true ORDER BY nombre ASC");
    const directores = result.rows

    if (result.rowCount > 0) {
      return res.json({ success: true, directores });
    } else {
      return res.status(401).json({ success: true, message: 'No hay directores actualmente.' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const getEstados = async (req, res) => {
  try {
    const result = await pool.query("SELECT e.id, e.nombre FROM estado e");
    const estados = result.rows

    if (result.rowCount > 0) {
      return res.json({ success: true, estados });
    } else {
      return res.status(401).json({ success: true, message: 'No hay directores actualmente.' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const getEtapas = async (req, res) => {
  try {
    const result = await pool.query("SELECT e.id, e.nombre FROM etapa e");
    const etapas = result.rows

    if (result.rowCount > 0) {
      return res.json({ success: true, etapas });
    } else {
      return res.status(401).json({ success: true, message: 'No hay directores actualmente.' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const generarContrasenaAleatoria = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let contrasena = '';

  for (let i = 0; i < 8; i++) {
    const indice = Math.floor(Math.random() * caracteres.length);
    contrasena += caracteres.charAt(indice);
  }
  return contrasena;
};

const inscribirPropuesta = async (req, res) => {
  const { id, codigo, nombre, anio, periodo, id_modalidad, id_etapa, id_estado, fecha_asignacion, id_usuario, nombreEstudiante, num_identificacion, correo } = req.body;
  const password = generarContrasenaAleatoria();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Inicio transaccion
    await pool.query('BEGIN');

      // Agregar proyecto
    const proyecto = await pool.query('INSERT INTO proyecto(id, codigo, nombre, id_modalidad,  id_estado) VALUES ($1, $2, $3, $4, $5) RETURNING id', [id, codigo, nombre, id_modalidad, id_estado]);
    const id_proyecto = proyecto.rows[0].id;
    
    // Insertar el registro en historial_etapas con la etapa de propuesta
    await pool.query('INSERT INTO historial_etapa(id_proyecto, id_etapa, anio, periodo) VALUES ($1, $2, $3, $4)', [id, id_etapa, anio, periodo]);

    // Agregar Usuario-Rol (director)
    await pool.query('INSERT INTO usuario_rol(estado, fecha_asignacion, id_usuario, id_rol, id_proyecto) VALUES (true, $1, $2, 1, $3)', [fecha_asignacion, id_usuario, id]);

    // Verificar si ya existe el estudiante
    const result = await pool.query('SELECT e.id FROM estudiante e WHERE LOWER(e.num_identificacion) = LOWER($1) OR LOWER(e.correo) = LOWER($2)', [num_identificacion, correo]);
    if (result.rowCount > 0) {
      const estudianteId = result.rows[0].id;
      const resultProyecto = await pool.query('SELECT 1 FROM estudiante_proyecto pr WHERE pr.id_estudiante = $1 AND pr.estado = true', [estudianteId]);
      if (resultProyecto.rowCount > 0) {
        return res.status(203).json({ success: false, message: 'El estudiante con número de identificación ' + num_identificacion + ' o correo ' + correo + ' ya tiene un proyecto activo. No es posible asignarlo a otro proyecto.' });
      } else {
        await pool.query('INSERT INTO estudiante_proyecto(id_proyecto, id_estudiante) VALUES ( $1, $2)', [id_proyecto, estudianteId]);
        await pool.query('COMMIT');
      }
    } else {
      const insertEstudianteResult = await pool.query('INSERT INTO estudiante(nombre, num_identificacion, correo) VALUES ($1, $2, $3) RETURNING id', [nombre, num_identificacion, correo]);
      const nuevoEstudianteId = insertEstudianteResult.rows[0].id;
      await pool.query('INSERT INTO estudiante_proyecto(id_proyecto, id_estudiante) VALUES ($1, $2)', [id_proyecto, nuevoEstudianteId]);
    }
    // Agregar Inicio Sesion
    await pool.query("INSERT INTO inicio_sesion(id_proyecto, contrasena) VALUES ($1, $2)", [id, hashedPassword]);

    // Enviar correo de bienvenida
    await nuevaPropuesta(nombre, codigo, correo);

    // Confirmar transaccion
    await pool.query('COMMIT');

    res.status(201).json({ success: true, message: 'El proyecto fue registrado exitosamente.' });

  } catch (error) {
    // Deshacer transaccion
    console.log(error)
    await pool.query('ROLLBACK');
    if (error.code === "23505" && (error.constraint === "estudiante_correo_key" || error.constraint === "estudiante_num_identificacion_key")) {
      return res.status(400).json({ success: false, message: "La información del estudiante ya existe en otro proyecto." });
    }
    res.status(500).json({ success: false, message: 'Ha ocurrido un error al registrar el proyecto. Por favor inténtelo más tarde.' });
  }

};

const inscribirPropuestaVarios = async (req, res) => {
  const { id, codigo, nombre, anio, periodo, id_modalidad, id_etapa, id_estado, fecha_asignacion, id_usuario, infoEstudiantes } = req.body;
  const password = generarContrasenaAleatoria();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Inicio transaccion
    await pool.query('BEGIN');

    // Agregar proyecto
    await pool.query('INSERT INTO proyecto(id, codigo, nombre, id_modalidad, id_etapa, id_estado) VALUES ($1, $2, $3, $4, $5, $6)', [id, codigo, nombre, id_modalidad, id_etapa, id_estado]);
   
    // Insertar el registro en historial_etapas con la etapa de propuesta
    await pool.query('INSERT INTO historial_etapas(id_proyecto, id_etapa_nueva, anio_nuevo, periodo_nuevo) VALUES ($1, $2, $3, $4)', [id, id_etapa, anio, periodo]);

    // Agregar Usuario-Rol (director)
    await pool.query('INSERT INTO usuario_rol(estado, fecha_asignacion, id_usuario, id_rol, id_proyecto) VALUES (true, $1, $2, 1, $3)', [fecha_asignacion, id_usuario, id]);

    // Agregar Inicio Sesion
    await pool.query("INSERT INTO inicio_sesion(id_proyecto, contrasena) VALUES ($1, $2)", [id, hashedPassword]);

    for (let i = 0; i < infoEstudiantes.length; i++) {

      // Verificar si ya existe el estudiante
      const result = await pool.query('SELECT * FROM estudiante WHERE num_identificacion=$1 AND LOWER(correo)=LOWER($2)', [infoEstudiantes[i].num_identificacion, infoEstudiantes[i].correo]);
      if (result.rowCount > 0) {

        // Verificar si el estudiante ya tiene un proyecto activo
        const resultProyecto = await pool.query('SELECT pr.* FROM estudiante_proyecto pr, estudiante e WHERE pr.id_estudiante = e.id AND e.num_identificacion=$1 AND LOWER(e.correo)=LOWER($2) AND pr.estado=true', [infoEstudiantes[i].num_identificacion, infoEstudiantes[i].correo]);
        if (resultProyecto.rowCount > 0) {
          await pool.query('ROLLBACK');
          return res.status(409).json({ success: false, message: 'El estudiante con número de identificación ' + infoEstudiantes[i].num_identificacion + ' ya tiene un proyecto activo. No es posible asignarlo a otro proyecto.' });

        } else {
          // Agregar estudiante
          await pool.query('INSERT INTO estudiante(nombre, num_identificacion, correo) VALUES ($1, $2, $3)', [infoEstudiantes[i].nombre, infoEstudiantes[i].num_identificacion, infoEstudiantes[i].correo]);
          // Agregar estudiante-proyecto
          await pool.query('INSERT INTO estudiante_proyecto(estado, id_proyecto, id_estudiante) SELECT true, $1, e.id FROM estudiante AS e WHERE e.nombre = $2', [id, infoEstudiantes[i].nombre]);
        }

      } else {
        // Agregar estudiante
        await pool.query('INSERT INTO estudiante(nombre, num_identificacion, correo) VALUES ($1, $2, $3)', [infoEstudiantes[i].nombre, infoEstudiantes[i].num_identificacion, infoEstudiantes[i].correo]);
        // Agregar estudiante-proyecto
        await pool.query('INSERT INTO estudiante_proyecto(estado, id_proyecto, id_estudiante) SELECT true, $1, e.id FROM estudiante AS e WHERE e.nombre = $2', [id, infoEstudiantes[i].nombre]);
      }

    }

    // Enviar correos de bienvenida
    await nuevaPropuestaVarios(nombre, codigo, infoEstudiantes);

    // Confirmar transaccion
    await pool.query('COMMIT');
    res.status(201).json({ success: true, message: 'El proyecto fue registrado exitosamente.' });

  } catch (error) {
    // Deshacer transaccion
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Ha ocurrido un error al registrar el proyecto. Por favor inténtelo más tarde.' });
  }

};

module.exports = { inicioSesion, inscribirPropuestaVarios, generarContrasenaAleatoria, confirmarCorreo, cambiarContrasenaProyecto, confirmarCodigo, getEstados, getEtapas, verificarCodigo, cambiarContrasena, codigoProy, getModalidades, getDirectores, inscribirPropuesta, getIdUltProy, getIdUltEst }
