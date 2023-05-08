const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database')
const { JWT_SECRET } = require('../config')

exports.inicioSesion = async (req, res) => {
  const { username, password } = req.body;
  await pool.query('SELECT u.*, tu.tipo AS id_tipo_usuario FROM usuario u JOIN tipo_usuario tu ON u.id_tipo_usuario= tu.id WHERE LOWER(u.correo)=LOWER($1)', [username], (error, result) => {
    
    if (error) {

      return res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
    console.log(JSON.stringify(result))
    if (result.rowCount === 1) {

      const usuario = result.rows[0];
      bcrypt.compare(password, usuario.contrasena, (error, match) => {
        if (error) {
          
          return res.status(401).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
        }
        if (match) {
          const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '1h' });
          return res.status(200).json({ success: true, token, tipo_usuario: usuario.id_tipo_usuario , id: usuario.id});
        } else {
          return res.status(401).json({ success: false, message: 'Autenticación fallida: Contraseña inválida' });
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Autenticación fallida: Usuario no encontrado' });
    }
  });
};
