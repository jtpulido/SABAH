const helpers = require('../lib/helpers')
const pool = require('../database')

const register = async (req, res) => {
    const { nombre, correo, contrasena, estado } = req.body;
    const hashedPassword = await helpers.encryptPassword(contrasena);
    try {
        await pool.query(
            'INSERT INTO usuario (nombre, correo, contrasena, estado) VALUES ($1, $2, $3, $4)',
            [nombre, correo, hashedPassword, estado]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
};


module.exports = { register }