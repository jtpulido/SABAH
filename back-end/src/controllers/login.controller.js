const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database')
const { JWT_SECRET } = require('../config')

const nodemailer = require('nodemailer');
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
          return res.status(200).json({ success: true, token, tipo_usuario: usuario.id_tipo_usuario });
        } else {
          return res.status(401).json({ success: false, message: 'Autenticación fallida: Contraseña inválida.' });
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Autenticación fallida: Usuario no encontrado.' });
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
      return res.status(200).json({ success: true, correos });
    } else {
      return res.status(401).json({ success: false, message: 'Autenticación fallida: Usuario no encontrado.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

// Enviar el correo con el codigo de verificacion
const sendEmail = async (req, res) => {
  const { correo } = req.body;
  const codigoCreado = crypto.randomBytes(4).toString('hex').toUpperCase();

  // Almacenar el código generado en req.app.locals
  req.app.locals.codigoCreado = codigoCreado;
  req.app.locals.correo = correo;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: correo,
    subject: 'Código de verificación para restablecer tu contraseña',
    text: `Tu código de verificación es: ${codigoCreado}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ success: false, message: 'Hubo un error al enviar el correo electrónico.' });
    } else {
      return res.status(200).json({ success: true, message: 'Se ha enviado un correo electrónico con el código de verificación.' });
    }
  });
};

// Enviar el correo con el codigo de verificacion
const sendEmails = async (req, res) => {
  const { correos } = req.body;
  const codigoCreado = crypto.randomBytes(4).toString('hex').toUpperCase();

  console.log(correos)
  console.log(correos[0].correo)

  // Almacenar el código generado en req.app.locals
  req.app.locals.codigoCreado = codigoCreado;
  req.app.locals.correos = correos;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: correos.join(', '),
    subject: 'Código de verificación para restablecer tu contraseña',
    text: `Tu código de verificación es: ${codigoCreado}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ success: false, message: 'Hubo un error al enviar el correo electrónico.' });
    } else {
      return res.status(200).json({ success: true, message: 'Se ha enviado un correo electrónico con el código de verificación.' });
    }
  });
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
    return res.json({ success: true, message: "Contraseña cambiado con éxito." });
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const getIdUltProy = async (req, res) => {
  try {
    const result = await pool.query("SELECT max(id) FROM proyecto");
    if (result.rowCount > 0) {
      const num = result.rows[0].max;
      return res.json({ success: true, num });
    } else {
      return res.status(401).json({ success: true, message: 'No hay proyectos actualmente.' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const getIdUltEst = async (req, res) => {

  try {
    const result = await pool.query("SELECT max(id) FROM estudiante");

    if (result.rowCount > 0) {
      const num = result.rows[0].max;
      return res.json({ success: true, num });
    } else {
      return res.status(401).json({ success: true, message: 'No hay estudiantes actualmente.' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }

};

const codigoProy = async (req, res) => {
  try {
    const result = await pool.query("SELECT max(codigo) FROM proyecto WHERE codigo LIKE 'TEM%'");
    if (result.rowCount > 0) {
      const codigo = result.rows[0].max;
      return res.json({ success: true, codigo });
    } else {
      return res.status(401).json({ success: true, message: 'No hay proyectos actualmente.' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const getModalidades = async (req, res) => {

  try {
    const result = await pool.query("SELECT * FROM modalidad");
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
    const result = await pool.query("SELECT u.id, u.nombre FROM usuario u WHERE id_tipo_usuario=2 AND u.estado=true");
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

const inscribirPropuesta = async (req, res) => {

  const { id, codigo, nombre, anio, periodo, id_modalidad, id_etapa, id_estado } = req.body;

  try {

    await pool.query('INSERT INTO proyecto(id, codigo, nombre, anio, periodo, id_modalidad, id_etapa, id_estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [id, codigo, nombre, anio, periodo, id_modalidad, id_etapa, id_estado]);

    res.status(201).json({ success: true, message: 'El proyecto fue registrado exitosamente.' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Ha ocurrido un error al registrar el proyecto. Por favor inténtelo más tarde.' });
  }

};

const agregarEstudiante = async (req, res) => {

  const { nombre, num_identificacion, correo } = req.body;
  try {
    await pool.query('INSERT INTO estudiante(nombre, num_identificacion, correo) VALUES ($1, $2, $3)', [nombre, num_identificacion, correo]);
    res.status(201).json({ success: true, message: 'El estudiante fue registrado exitosamente.' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Ha ocurrido un error al registrar el estudiante. Por favor inténtelo más tarde.' });
  }
};

const agregarEstudianteProyecto = async (req, res) => {
  const { estado, id_proyecto, nombre_estudiante } = req.body;
  try {

    await pool.query('INSERT INTO estudiante_proyecto(estado, id_proyecto, id_estudiante) SELECT $1, $2, e.id FROM estudiante AS e WHERE e.nombre=$3', [estado, id_proyecto, nombre_estudiante]);
    res.status(201).json({ success: true, message: 'Fue registrado exitosamente.' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Ha ocurrido un error en el registro. Por favor inténtelo más tarde.' });
  }
};

const agregarUsuarioRol = async (req, res) => {

  const { estado, fecha_asignacion, id_usuario, id_rol, id_proyecto } = req.body;

  try {

    await pool.query('INSERT INTO usuario_rol(estado, fecha_asignacion, id_usuario, id_rol, id_proyecto) VALUES ($1, $2, $3, $4, $5)', [estado, fecha_asignacion, id_usuario, id_rol, id_proyecto]);

    res.status(201).json({ success: true, message: 'Fue registrado exitosamente.' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Ha ocurrido un error en el registro. Por favor inténtelo más tarde.' });
  }

};

module.exports = { inicioSesion, confirmarCorreo, confirmarCodigo, sendEmails, getEstados, getEtapas, sendEmail, verificarCodigo, cambiarContrasena, codigoProy, getModalidades, getDirectores, inscribirPropuesta, getIdUltProy, agregarEstudiante, getIdUltEst, agregarEstudianteProyecto, agregarUsuarioRol }
