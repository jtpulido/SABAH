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
const asignarNuevoCodigo = async (proyectoId, nuevoCodigo) => {
    try {
        const result = await pool.query(
            "UPDATE proyecto SET codigo = $1, id_etapa = 2 WHERE id = $2 RETURNING (SELECT nombre FROM etapa WHERE id = 2)",
            [nuevoCodigo, proyectoId]
        );
        return result.rows[0].nombre;
    } catch (error) {
        console.log(error)
        return false;

    }
};
const asignarCodigoProyecto = async (req, res) => {
    try {
        const { id, acronimo, anio, periodo } = req.body;
        await pool.query(
            "SELECT MAX(CAST(SUBSTRING(p.codigo, LENGTH(m.acronimo)+2+4+2+2) AS INTEGER))  FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id WHERE p.codigo LIKE CONCAT($1::text, '_', $2::text, '-', $3::text, '-%')",
            [acronimo, anio, periodo], async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                } else if (result.rowCount === 1) {
                    const codigo = result.rows[0].max > 0 ? `${acronimo}_${anio}-${periodo}-${result.rows[0].max + 1}` : `${acronimo}_${anio}-${periodo}-01`
                    const r = await asignarNuevoCodigo(id, codigo)
                    return r === false ? res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' }) : res.json({ success: true, codigo, etapa: r })
                } else {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                }
            })
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerDirectoresProyectosActivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_director, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 1 AND ur.estado')
        const directores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, directores });
        } else {
            return res.status(401).json({ success: false, message: 'No hay directores activos asignados en proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerDirectoresProyectosInactivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_director, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 1 AND NOT ur.estado')
        const directores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, directores });
        } else {
            return res.status(401).json({ success: false, message: 'No hay directores inactivos asignados en proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerJuradosProyectosActivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_jurado, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 3 AND  ur.estado')
        const jurados = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, jurados });
        } else {
            return res.status(401).json({ success: false, message: 'No hay jurados activos en proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerJuradosProyectosInactivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_jurado, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 3 AND NOT ur.estado')
        const jurados = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, jurados });
        } else {
            return res.status(401).json({ success: false, message: 'No hay jurados inactivos asignado en proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerLectoresProyectosActivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_lector, p.codigo, u.nombre AS nombre_lector, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 2 AND  ur.estado')
        const lectores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, lectores });
        } else {
            return res.status(401).json({ success: false, message: 'No hay lectores activos asignados en proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerLectoresProyectosInactivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_lector, p.codigo, u.nombre AS nombre_lector, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 2 AND NOT ur.estado')
        const lectores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, lectores });
        } else {
            return res.status(401).json({ success: false, message: 'No hay lectores inactivos asignado en proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerSolicitudesPendientesComite = async (req, res) => {
    try {
        const result = await pool.query('SELECT s.id, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, ad.fecha AS fecha_aprobado_director FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  WHERE ad.aprobado = true AND ac.id IS NULL')
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: false, message: 'No hay solicitudes pendientes por aprobación del comité' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerSolicitudesAprobadasComite = async (req, res) => {
    try {
        const result = await pool.query('SELECT s.id, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, ac.fecha AS fecha_aprobado_comite,ad.fecha AS fecha_aprobado_director FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  WHERE ad.aprobado = true AND ac.aprobado = true')
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: false, message: 'No hay solicitudes aprobadas por el comité' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerSolicitudesRechazadasComite = async (req, res) => {
    try {
        const result = await pool.query('SELECT s.id, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, ac.fecha AS fecha_aprobado_comite,ad.fecha AS fecha_aprobado_director FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  WHERE ad.aprobado = true AND ac.aprobado = false')
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: false, message: 'No hay solicitudes rechazadas por el comité' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerReportesPendientesComite = async (req, res) => {
    try {
        const result = await pool.query('SELECT r.id, tr.nombre AS tipo_reporte, r.fecha AS fecha_reporte, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto FROM reporte r JOIN tipo_reporte tr ON r.id_tipo_reporte = tr.id JOIN proyecto p ON r.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE r.cerrado=false')
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: false, message: 'No hay solicitudes pendientes por aprobación del comité' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerReportesAprobadosComite = async (req, res) => {
    try {
        const result = await pool.query('SELECT r.id, tr.nombre AS tipo_reporte, r.fecha AS fecha_reporte, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, ar.fecha AS fecha_aprobado_comite FROM reporte r JOIN tipo_reporte tr ON r.id_tipo_reporte = tr.id JOIN proyecto p ON r.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN aprobado_reporte ar ON r.id = ar.id_reporte WHERE ar.aprobado=true')
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: false, message: 'No hay solicitudes aprobadas por el comité' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerReportesRechazadosComite = async (req, res) => {
    try {
        const result = await pool.query('SELECT r.id, tr.nombre AS tipo_reporte, r.fecha AS fecha_reporte, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, ar.fecha AS fecha_aprobado_comite FROM reporte r JOIN tipo_reporte tr ON r.id_tipo_reporte = tr.id JOIN proyecto p ON r.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN aprobado_reporte ar ON r.id = ar.id_reporte WHERE ar.aprobado=false')
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: false, message: 'No hay solicitudes rechazadas por el comité' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
module.exports = {
    obtenerProyecto,
    obtenerTodosProyectos,
    obtenerProyectosTerminados,
    obtenerProyectosDesarrollo,
    asignarCodigoProyecto,
    obtenerDirectoresProyectosActivos,
    obtenerDirectoresProyectosInactivos,
    obtenerJuradosProyectosActivos,
    obtenerJuradosProyectosInactivos,
    obtenerLectoresProyectosActivos,
    obtenerLectoresProyectosInactivos,
    obtenerSolicitudesPendientesComite,
    obtenerSolicitudesAprobadasComite,
    obtenerSolicitudesRechazadasComite,
    obtenerReportesRechazadosComite,
    obtenerReportesPendientesComite,
    obtenerReportesAprobadosComite
}