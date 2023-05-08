const pool = require('../database')

const obtenerProyecto = async (req, res) => {

    const { id } = req.params; 

    try {
        const error = "No se puedo encontrar toda la información relacionada al proyecto. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda."
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, m.acronimo as acronimo, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE p.id = $1', [id])
        const proyecto = result.rows
        if (result.rowCount === 1) {

            const result_director = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('director') AND ur.id_proyecto = $1", [id])
            const usuario_director = result_director.rows[0]
            const result_lector = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('lector') AND ur.id_proyecto = $1", [id])
            const info_lector = result_lector.rowCount > 0 ? { "existe_lector": true, "nombre": result_lector.rows[0].nombre } : { "existe_lector": false };
            const result_jurado = await pool.query("SELECT u.nombre, u.id FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('jurado')AND ur.id_proyecto = $1", [id])
            const info_jurado = result_jurado.rowCount > 0 ? { "existe_jurado": true, "jurados": result_jurado.rows } : { "existe_jurado": false };
            const result_estudiantes = await pool.query('SELECT e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1', [id])

            if (result_estudiantes.rowCount > 0 && result_director.rowCount > 0) {
                return res.json({ success: true, proyecto: proyecto[0], director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows });
            } else {
                return res.status(401).json({ success: false, message: error })
            }

        } else {
            return res.status(401).json({ success: false, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerEntregasPendientes = async (req, res) => {

    const { id } = req.params; 

    try {

        const result = await pool.query('SELECT e.id AS entrega_id, e.nombre AS nombre_entrega, e.fecha_limite AS fecha_limite, ed.fecha_entrega AS fecha_entrega, es.nombre AS estado_entrega FROM entregas e INNER JOIN entregadocumento ed ON e.id = ed.id_entrega INNER JOIN estadoEntrega es ON es.nombre = $1 WHERE ed.id_proyecto = $2 AND es.id = ed.id_estado', ['Pendiente', id])
        const pendientes = result.rowCount > 0 ? { "existe_pendientes": true,  "pendientes": result.rows} : { "existe": false };
        if (result.rowCount > 0) {
            return res.json({ success: true, pendientes });
        } else {
            return res.status(203).json({ success: false, message: 'No hay solicitudes rechazadas por el comité' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerEntregasCompletadas = async (req, res) => {

    const { id } = req.params; 
    
    try {
        const result = await pool.query('SELECT e.id AS entrega_id, e.nombre AS nombre_entrega, e.fecha_limite AS fecha_limite, ed.fecha_entrega AS fecha_entrega, es.nombre AS estado_entrega FROM entregas e INNER JOIN entregadocumento ed ON e.id = ed.id_entrega INNER JOIN estadoEntrega es ON es.nombre = $1 WHERE ed.id_proyecto = $2 AND es.id = ed.id_estado', ['Completa', id])
        const completas = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, completas });
        } else {
            return res.status(203).json({ success: false, message: 'No hay entregas completas' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerReunionesPendientes = async (req, res) => {

    const { id } = req.params; 
    
    try {
        const result = await pool.query('SELECT r.id, r.nombre, r.fecha, r.invitados, r.enlace FROM reuniones r JOIN estadoReunion e ON r.id_estado = e.id WHERE r.id_proyecto = $2 AND e.nombre = $1;', ['Pendiente', id])
        const pendientes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, pendientes });
        } else {
            return res.status(203).json({ success: false, message: 'No hay reuniones pendientes' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerReunionesCompletas = async (req, res) => {

    const { id } = req.params; 
    
    try {
        const result = await pool.query('SELECT r.id, r.nombre, r.fecha, r.invitados, r.enlace FROM reuniones r JOIN estadoReunion e ON r.id_estado = e.id WHERE r.id_proyecto = $2 AND e.nombre = $1;', ['Completa', id])
        const completas = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, completas });
        } else {
            return res.status(203).json({ success: false, message: 'No hay reuniones completas' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerReunionesCanceladas = async (req, res) => {

    const { id } = req.params; 
    
    try {
        const result = await pool.query('SELECT r.id, r.nombre, r.fecha, r.invitados, r.enlace FROM reuniones r JOIN estadoReunion e ON r.id_estado = e.id WHERE r.id_proyecto = $2 AND e.nombre = $1;', ['Cancelada', id])
        const canceladas = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, canceladas });
        } else {
            return res.status(203).json({ success: false, message: 'No hay reuniones canceladas' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerSolicitudesPendientes = async (req, res) => {

    const { id } = req.params; 
    
    try {
        const result = await pool.query('SELECT s.*, ts.nombre AS nombre_tipo_solicitud FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id WHERE s.finalizado = false AND s.id_proyecto = $1; ',[id])
        const pendientes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, pendientes });
        } else {
            return res.status(203).json({ success: false, message: 'No hay solicitudes pendientes' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerSolicitudesCompletas = async (req, res) => {

    const { id } = req.params; 
    
    try {
        const result = await pool.query('SELECT s.*, ts.nombre AS nombre_tipo_solicitud FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id WHERE s.finalizado = true AND s.id_proyecto = $1; ',[id])
        const completas = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, completas });
        } else {
            return res.status(203).json({ success: false, message: 'No hay solicitudes completas' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
module.exports = { obtenerProyecto, obtenerEntregasCompletadas , obtenerEntregasPendientes, obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas, obtenerSolicitudesPendientes,obtenerSolicitudesCompletas}
