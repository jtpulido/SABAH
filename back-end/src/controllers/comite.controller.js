const pool = require('../database')

const obtenerProyectosDesarrollo = async (req, res) => {
    try {
        await pool.query(
            'SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE es.id=1', async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                }
                if (result.rowCount > 0) {
                    return res.json({ success: true, proyectos: result.rows });
                } else if (result.rowCount <= 0) {
                    return res.status(203).json({ success: true, message: 'No hay proyectos en desarrollo actualmente.' })
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerProyectosTerminados = async (req, res) => {
    try {
       await pool.query(
            'SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE es.id <> 1', async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                }
                if (result.rowCount > 0) {
                    return res.json({ success: true, proyectos: result.rows });
                } else if (result.rowCount <= 0) {
                    return res.status(203).json({ success: true, message: 'No hay proyectos terminados actualmente.' })
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
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
                return res.status(203).json({ success: true, message: error })
            }

        } else {
            return res.status(203).json({ success: true, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const asignarNuevoCodigo = async (req, res) => {
    try {
        const { id, codigo } = req.body;
        await pool.query(
            "UPDATE proyecto SET codigo = $1, id_etapa = 2 WHERE id = $2 RETURNING (SELECT nombre FROM etapa WHERE id = 2)",
            [codigo, id], async (error, result) => {
                if (error) {
                    if (error.code === "23505" && error.constraint === "proyecto_codigo_key") {
                        return res.status(400).json({ success: false, message: "El código ya está en uso." });
                    } else {
                        return res.status(500).json({ success: false, message: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                    }
                }
                if (result) {
                    etapa = result.rows[0].nombre;
                    return res.json({ success: true, codigo, etapa })
                }

            })
    } catch (error) {
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
                    const codigo = result.rows[0].max > 0 ? `${acronimo}_${anio}-${periodo}-${(result.rows[0].max + 1).toString().padStart(2, '0')}` : `${acronimo}_${anio}-${periodo}-01`;
                    try {
                        const result = await pool.query(
                            "UPDATE proyecto SET codigo = $1, id_etapa = 2 WHERE id = $2 RETURNING (SELECT nombre FROM etapa WHERE id = 2)",
                            [codigo, id]
                        );
                        r = result.rows[0].nombre;
                    } catch (error) {
                        r = false;
                    }
                    return r === false ? res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' }) : res.json({ success: true, codigo, etapa: r })
                } else {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerDirectoresProyectosActivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_director,p.id AS id_proyecto, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 1 AND ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE es.id=1')
        const directores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, directores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay directores activos asignados en proyectos actualmente' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerDirectoresProyectosCerrados = async (req, res) => {
    try {
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_director,p.id AS id_proyecto, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 1 AND ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE es.id<>1')
        const directores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, directores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyecto cerrados.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerDirectoresProyectosInactivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_director, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 1 AND NOT ur.estado')
        const directores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, directores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay directores inactivos asignados en proyectos.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerJuradosProyectosActivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_jurado, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, e.nombre AS etapa, es.nombre AS estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 3 AND ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE p.id_modalidad <> 3 AND es.id=1')
        const jurados = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, jurados });
        } else {
            return res.status(203).json({ success: true, message: 'No hay jurados activos en proyectos en desarrollo actualmente' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerJuradosProyectosCerrados = async (req, res) => {
    try {
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_jurado, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, e.nombre AS etapa, es.nombre AS estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 3 AND ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE p.id_modalidad <> 3 AND es.id<>1')
        const jurados = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, jurados });
        } else {
            return res.status(203).json({ success: true, message: 'No hay jurados activos en proyectos cerrados actualmente' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerJuradosProyectosInactivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_jurado, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 3 AND NOT ur.estado')
        const jurados = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, jurados });
        } else {
            return res.status(203).json({ success: true, message: 'No hay jurados inactivos asignado en proyectos actualmente' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerLectoresProyectosActivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_lector, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_lector, ur.fecha_asignacion, e.nombre AS etapa, es.nombre AS estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 2 AND  ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE p.id_modalidad <> 3 AND es.id=1')
        const lectores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, lectores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyectos en desarrollo.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerLectoresProyectosCerrados = async (req, res) => {
    try {
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_lector, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_lector, ur.fecha_asignacion, e.nombre AS etapa, es.nombre AS estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 2 AND  ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE p.id_modalidad <> 3 AND es.id<>1')
        const lectores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, lectores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyectos cerrados, finalizados o rechazados.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerLectoresProyectosInactivos = async (req, res) => {
    try {
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_lector, p.codigo, u.nombre AS nombre_lector, ur.fecha_asignacion, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 2 AND NOT ur.estado')
        const lectores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, lectores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay lectores inactivos en proyectos actualmente' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerSolicitudesPendientesComite = async (req, res) => {
    try {
        const result = await pool.query("SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_aprobado_director FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  WHERE ad.aprobado = true AND ac.id IS NULL UNION SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud WHERE s.creado_proyecto = false AND ac.id IS NULL")
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: true, message: 'No hay solicitudes pendientes por aprobación del comité' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerSolicitudesAprobadasComite = async (req, res) => {
    try {
        const result = await pool.query("SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  WHERE ad.aprobado = true AND ac.aprobado = true UNION SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud WHERE s.creado_proyecto = false AND ac.aprobado = true")
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: true, message: 'No hay solicitudes aprobadas por el comité' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerSolicitudesRechazadasComite = async (req, res) => {
    try {
        const result = await pool.query("SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  WHERE ad.aprobado = true AND ac.aprobado = false UNION SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud WHERE s.creado_proyecto = false AND ac.aprobado = false")
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: true, message: 'No hay solicitudes rechazadas por el comité' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const verSolicitud = async (req, res) => {
    try {
        const { id } = req.body;
        await pool.query(
            "SELECT s.id, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, s.creado_proyecto AS creado_por_proyecto, s.justificacion, s.finalizado, ts.nombre AS tipo_solicitud, TO_CHAR(s.fecha, 'DD/MM/YYYY') AS fecha_solicitud, p.id AS id_proyecto, u.nombre AS nombre_director FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN usuario_rol ur ON s.id_director = ur.id JOIN usuario u ON ur.id_usuario = u.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id  WHERE s.id = $1",
            [id], async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
                } else if (result.rowCount === 1) {
                    return res.json({ success: true, solicitud: result.rows[0] });
                } else {
                    return res.status(203).json({ success: true, message: 'No fue posible encontrar la solicitud' });
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const verAprobacionesSolicitud = async (req, res) => {
    try {
        const { id } = req.body;
        await pool.query(
            "SELECT ROW_NUMBER() OVER (ORDER BY id_solicitud) AS id, id_solicitud, aprobador, aprobado,fecha, comentario_aprobacion FROM (SELECT s.id AS id_solicitud, 'Director' AS aprobador, CASE WHEN ad.aprobado = true THEN 'Sí' WHEN ad.aprobado = false THEN 'No' ELSE '' END AS aprobado,TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha, ad.comentario AS comentario_aprobacion FROM solicitud s LEFT JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud WHERE s.id = $1 AND EXISTS (SELECT 1 FROM aprobado_solicitud_director WHERE id_solicitud = s.id) UNION SELECT s.id AS id_solicitud, 'Comite' AS aprobador, CASE WHEN ac.aprobado = true THEN 'Sí' WHEN ac.aprobado = false THEN 'No' ELSE '' END AS aprobado, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha, ac.comentario AS comentario_aprobacion FROM solicitud s LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud WHERE s.id = $1 AND EXISTS ( SELECT 1 FROM aprobado_solicitud_comite WHERE id_solicitud = s.id )) AS subquery",
            [id], async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
                } else if (result.rowCount > 0) {
                    return res.json({ success: true, aprobaciones: result.rows });
                } else {
                    return res.status(203).json({ success: true, message: 'No se encontraron aprobaciones para la solicitud' });
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const agregarAprobacion = async (req, res) => {
    try {
        const { aprobado, comentario, id_solicitud } = req.body;

        await pool.query(
            "INSERT INTO public.aprobado_solicitud_comite (aprobado, comentario, id_solicitud) VALUES ($1, $2, $3)",
            [aprobado, comentario, id_solicitud],
            (error, result) => {
                if (error) {
                    if (error.code === "23505") {
                        return res.status(400).json({ success: false, message: "Ya fue aprobada esta solicitud." });
                    }
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error al guardar la aprobación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
                }

                if (result.rowCount > 0) {
                    pool.query(
                        "UPDATE public.solicitud SET finalizado = $1 WHERE id = $2",
                        [true, id_solicitud],
                        (error1, result1) => {
                            if (error1) {
                                return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error al guardar la aprobación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
                            }
                            if (result1.rowCount > 0) {
                                return res.json({ success: true, message: 'Aprobación guardada correctamente.' });
                            }
                        }
                    );
                }
            }
        );

        return res.status(203).json({ success: true, message: 'No se pudo aprobar la solicitud' });
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

module.exports = {
    obtenerProyecto,
    obtenerProyectosTerminados,
    obtenerProyectosDesarrollo,
    asignarCodigoProyecto,
    obtenerDirectoresProyectosActivos,
    obtenerDirectoresProyectosCerrados,
    obtenerDirectoresProyectosInactivos,
    obtenerJuradosProyectosActivos,
    obtenerJuradosProyectosCerrados,
    obtenerJuradosProyectosInactivos,
    obtenerLectoresProyectosActivos,
    obtenerLectoresProyectosCerrados,
    obtenerLectoresProyectosInactivos,
    obtenerSolicitudesPendientesComite,
    obtenerSolicitudesAprobadasComite,
    obtenerSolicitudesRechazadasComite,
    obtenerJuradosProyectosCerrados,
    asignarNuevoCodigo,
    verAprobacionesSolicitud,
    verSolicitud,
    agregarAprobacion
}