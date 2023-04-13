const helpers = require('../lib/helpers')
const pool = require('../database')

const register = async (req, res) => {
    const { nombre, correo, contrasena, estado,id_tipo_usuario } = req.body;
    const hashedPassword = await helpers.encryptPassword(contrasena);
    try {
        await pool.query(
            'INSERT INTO usuario (nombre, correo, contrasena, estado,id_tipo_usuario) VALUES ($1, $2, $3, $4,$5)',
            [nombre, correo, hashedPassword, estado,id_tipo_usuario]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
};


module.exports = { register }