const bcrypt = require('bcrypt');
const pool = require('../database')

exports.registro = (req, res) => {
  const { nombre, contrasena, correo, estado, id_tipo_usuario } = req.body;
  bcrypt.hash(contrasena, 10, (error, hash) => {
    if (error) {
      return res.status(500).json({ error });
    }
    pool.query('INSERT INTO usuario (nombre, correo, contrasena, estado, id_tipo_usuario) VALUES ($1, $2, $3, $4,$5)',
      [nombre, correo, hash, estado, id_tipo_usuario], (error, result) => {
        if (error) {
          return res.status(500).json({ error });
        }
        return res.status(201).json({ message: 'Usuario registrado correctamente.' });
      });
  });
};