const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database')
const { JWT_SECRET } = require('../config')

const nodemailer = require('nodemailer');
const crypto = require('crypto');

//5 * 60 * 1000);

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
    const result = await pool.query('SELECT u.* FROM usuario u WHERE LOWER(u.correo)=LOWER($1)', [correo]);
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

// Enviar el correo con el codigo de verificacion
const sendEmail = async (req, res) => {

  const { correo } = req.body;
  const codigoCreado = crypto.randomBytes(4).toString('hex').toUpperCase();

  // Almacenar el código generado en req.app.locals
  req.app.locals.codigoCreado = codigoCreado;
  req.app.locals.correo = correo;

  // Eliminar el código después de 5 minutos
  //setTimeout(() => {
    //delete req.app.locals.codigoCreado;
  //}, 5 * 60 * 1000);

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

  const { correo } = req.body;
  try {
    const result = await pool.query('SELECT u.* FROM usuario u WHERE LOWER(u.correo)=LOWER($1)', [correo]);
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

module.exports = { inicioSesion, confirmarCorreo, sendEmail, verificarCodigo, cambiarContrasena }
