const pool = require('../database')

const obtenerProyectosDesarrollo = async (req, res) => {
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE es.id=1')
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosTerminados = async (req, res) => {
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE es.id <> 1')
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerTodosProyectos = async (req, res) => {
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id')
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyecto = async (req, res) => {

    const { id } = req.body;
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE p.id = $1', [id])
        const proyecto = result.rows
        if (result.rowCount === 1) {
            return res.json({ success: true, proyecto: proyecto[0] });
        } else {
            return res.status(401).json({ success: true, message: 'No se encontro el proyecto' })
        }
    } catch (error) {
        console.log(error)
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};


module.exports = { obtenerProyecto, obtenerTodosProyectos, obtenerProyectosTerminados, obtenerProyectosDesarrollo }