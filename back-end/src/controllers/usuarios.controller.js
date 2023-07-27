const bcrypt = require('bcrypt');
const pool = require('../database')

const nodemailer = require('nodemailer');

const obtenerProyectosDesarrolloRol = async (req, res) => {
    const { id_usuario, id_rol } = req.body;
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario_rol ur ON p.id = ur.id_proyecto WHERE ur.id_usuario=$1 AND ur.id_rol=$2 AND ur.estado=true AND es.id=1 ORDER BY nombre ASC', [id_usuario, id_rol]);
        const proyectos = result.rows;
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosCerradosRol = async (req, res) => {
    const { id_usuario, id_rol } = req.body;
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario_rol ur ON p.id = ur.id_proyecto WHERE ur.id_usuario=$1 AND ur.id_rol=$2 AND ur.estado=true AND es.id <> 1 ORDER BY nombre ASC', [id_usuario, id_rol]);
        const proyectos = result.rows;
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyecto = async (req, res) => {
    const { id } = req.body;
    try {
        const error = "No se puedo encontrar toda la información relacionada al proyecto. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda."
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, m.acronimo as acronimo, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE p.id = $1', [id])
        const proyecto = result.rows
        if (result.rowCount === 1) {

            const result_director = await pool.query("SELECT u.id, u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('director') AND ur.id_proyecto = $1 AND ur.estado = true", [id])
            const usuario_director = result_director.rows[0]
            const result_lector = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('lector') AND ur.id_proyecto = $1 AND ur.estado = true", [id])
            const info_lector = result_lector.rowCount > 0 ? { "existe_lector": true, "nombre": result_lector.rows[0].nombre } : { "existe_lector": false };
            const result_jurado = await pool.query("SELECT u.nombre, u.id FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('jurado')AND ur.id_proyecto = $1 AND ur.estado = true", [id])
            const info_jurado = result_jurado.rowCount > 0 ? { "existe_jurado": true, "jurados": result_jurado.rows } : { "existe_jurado": false };
            const result_estudiantes = await pool.query('SELECT e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = true ORDER BY nombre ASC', [id])

            if (result_estudiantes.rowCount > 0 && result_director.rowCount > 0) {
                return res.json({ success: true, proyecto: proyecto[0], director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows });
            } else {
                return res.status(401).json({ success: true, message: error })
            }

        } else {
            return res.status(401).json({ success: false, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const rolDirector = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuario_rol WHERE id_rol=1 AND id_usuario = $1 AND estado=true', [id]);
        if (result.rowCount > 0) {
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false });
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const rolLector = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuario_rol WHERE id_rol=2 AND id_usuario = $1 AND estado=true', [id]);
        if (result.rowCount > 0) {
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false });
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const rolJurado = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuario_rol WHERE id_rol=3 AND id_usuario = $1 AND estado=true', [id]);
        if (result.rowCount > 0) {
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false });
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const verUsuario = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT u.id, u.nombre, u.correo, u.estado FROM usuario u WHERE u.id = $1', [id]);
        const infoUsuario = result.rows;
        if (result.rowCount === 1) {
            return res.json({ success: true, infoUsuario });
        } else {
            return res.status(401).json({ success: false, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

module.exports = { obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerProyecto, rolDirector, rolJurado, rolLector, verUsuario }
