const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database');

const { nuevaPropuesta, nuevaPropuestaDirector } = require('../controllers/mail.controller');

const { JWT_SECRET } = require('../config');
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
      pool.query(`SELECT pr.id, i.contrasena FROM inicio_sesion i
      JOIN proyecto pr ON pr.id = i.id_proyecto
      WHERE pr.codigo = $1`, [username], (error, resultProyecto) => {
        if (error) {
          return res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
        }
        if (resultProyecto.rowCount === 1) {
          const usuario = resultProyecto.rows[0];
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

const codigoProy = async (req, res) => {
  try {
    const result = await pool.query("SELECT MAX(codigo) FROM proyecto WHERE codigo LIKE 'TEM%'");
    let codigo = result.rows[0].max;
    if (codigo !== null) {
      return res.json({ success: true, codigo });
    } else {
      codigo = 'TEM_0000-00-00';
      return res.status(404).json({ success: true, codigo });
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
  const { codigo, nombre, anio, periodo, id_modalidad, id_etapa, id_estado, id_usuario, estudiantes, nombre_empresa, correo_repr, nombre_repr } = req.body;
  const password = generarContrasenaAleatoria();
  const hashedPassword = await bcrypt.hash(password, 10);
  const filteredEstudiantes = estudiantes.filter(estudiante => { return estudiante.nombre !== "" && estudiante.num_identificacion !== "" && estudiante.correo !== ""; });

  try {
    await pool.query('BEGIN');

    // Agregar proyecto
    const proyecto = await pool.query('INSERT INTO proyecto(codigo, nombre, id_modalidad, id_estado) VALUES ($1, $2, $3, $4) RETURNING id', [codigo, nombre, id_modalidad, id_estado]);
    const id_proyecto = proyecto.rows[0].id;

    if (id_modalidad === 1) {
      await pool.query('INSERT INTO cliente(nombre_empresa, correo_repr, nombre_repr, id_proyecto) VALUES ($1, $2, $3, $4)', [nombre_empresa, correo_repr, nombre_repr, id_proyecto]);
    }

    // Insertar el registro en historial_etapas con la etapa de propuesta
    await pool.query('INSERT INTO historial_etapa(id_proyecto, id_etapa, anio, periodo) VALUES ($1, $2, $3, $4)', [id_proyecto, id_etapa, anio, periodo]);

    // Agregar Usuario-Rol (director)
    const director = await pool.query(`WITH inserted_row AS (
  INSERT INTO usuario_rol(estado, id_usuario, id_rol, id_proyecto) VALUES (true, $1, 1, $2) RETURNING id_usuario)
  SELECT u.correo FROM usuario u
    INNER JOIN inserted_row ir ON u.id = ir.id_usuario;`, [id_usuario, id_proyecto]);
    const correo_director = director.rows[0].correo;

    // Agregar Inicio Sesion
    await pool.query("INSERT INTO inicio_sesion(id_proyecto, contrasena) VALUES ($1, $2)", [id_proyecto, hashedPassword]);

    for (let index = 0; index < filteredEstudiantes.length; index++) {

      // Verificar si ya existe el estudiante
      const result = await pool.query('SELECT e.id FROM estudiante e WHERE LOWER(e.num_identificacion) = LOWER($1) OR LOWER(e.correo) = LOWER($2)', [filteredEstudiantes[index].num_identificacion, filteredEstudiantes[index].correo]);
      if (result.rowCount > 0) {

        const estudianteId = result.rows[0].id;
        const resultProyecto = await pool.query('SELECT 1 FROM estudiante_proyecto pr WHERE pr.id_estudiante = $1 AND pr.estado = true', [estudianteId]);
        if (resultProyecto.rowCount > 0) {
          await pool.query('ROLLBACK');
          responseStatus = {
            success: false,
            message: 'El estudiante con número de identificación ' + filteredEstudiantes[index].num_identificacion + ' ya tiene un proyecto activo. No es posible asignarlo a otro proyecto.',
          };
          break;

        } else {
          await pool.query('INSERT INTO estudiante_proyecto(id_proyecto, id_estudiante) VALUES ( $1, $2)', [id_proyecto, estudianteId]);
          const emailResult = await nuevaPropuesta(nombre, filteredEstudiantes[index].nombre, codigo, filteredEstudiantes[index].correo);
          if (emailResult.success) {
            responseStatus = { success: true, message: 'El proyecto fue registrado exitosamente.' };
          } else {
            await pool.query('ROLLBACK');
            responseStatus = {
              success: false,
              message: 'Ha ocurrido un error al registrar el proyecto. Por favor inténtelo más tarde.',
            };
            break;
          }
        }

      } else {
        const insertEstudianteResult = await pool.query('INSERT INTO estudiante(nombre, num_identificacion, correo) VALUES ($1, $2, $3) RETURNING id', [filteredEstudiantes[index].nombre, filteredEstudiantes[index].num_identificacion, filteredEstudiantes[index].correo]);
        const nuevoEstudianteId = insertEstudianteResult.rows[0].id;
        await pool.query('INSERT INTO estudiante_proyecto(id_proyecto, id_estudiante) VALUES ($1, $2)', [id_proyecto, nuevoEstudianteId]);
        const emailResult = await nuevaPropuesta(nombre, filteredEstudiantes[index].nombre, codigo, filteredEstudiantes[index].correo);
        if (emailResult.success) {
          responseStatus = { success: true, message: 'El proyecto fue registrado exitosamente.' };
        } else {
          await pool.query('ROLLBACK');
          responseStatus = {
            success: false,
            message: 'Ha ocurrido un error al registrar el proyecto. Por favor inténtelo más tarde.',
          };
          break;
        }
      }
    }

    const emailDirector = await nuevaPropuestaDirector(nombre, codigo, correo_director);
    if (emailDirector) {
      responseStatus = { success: true, message: 'El proyecto fue registrado exitosamente.' };
    } else {
      await pool.query('ROLLBACK');
      responseStatus = {
        success: false,
        message: 'Ha ocurrido un error al registrar el proyecto. Por favor inténtelo más tarde.',
      };
    }

    if (responseStatus.success) {
      await pool.query('COMMIT');
    }
    res.status(responseStatus.success ? 201 : 500).json(responseStatus);

  } catch (error) {
    await pool.query('ROLLBACK');
    if (error.code === "23505" && (error.constraint === "estudiante_correo_key" || error.constraint === "estudiante_num_identificacion_key")) {
      return res.status(400).json({ success: false, message: "La información del estudiante ya existe en otro proyecto." });
    }
    res.status(500).json({ success: false, message: 'Ha ocurrido un error al registrar el proyecto. Por favor inténtelo más tarde.' });
  }
};

module.exports = { inicioSesion, generarContrasenaAleatoria, confirmarCorreo, cambiarContrasenaProyecto, confirmarCodigo, getEstados, getEtapas, verificarCodigo, cambiarContrasena, codigoProy, getModalidades, getDirectores, inscribirPropuesta }
