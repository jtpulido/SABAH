const pool = require('../database')


const obtenerProyectosDesarrolloRol = async (req, res) => {
    const { id_usuario, id_rol } = req.body;
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario_rol ur ON p.id = ur.id_proyecto WHERE ur.id_usuario=$1 AND ur.id_rol=$2 AND ur.estado=true AND es.id=1 ORDER BY nombre ASC', [id_usuario, id_rol]);
        const proyectos = result.rows;
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyectos actualmente' });
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
            return res.status(203).json({ success: true, message: 'No hay proyectos actualmente' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyecto = async (req, res) => {
    const id = req.params.proyecto_id;
    try {
        const error = "No se puedo encontrar toda la información relacionada al proyecto. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda."
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, m.acronimo as acronimo, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE p.id = $1', [id])
        const proyecto = result.rows[0]
        if (result.rowCount === 1) {
            const result_director = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('director') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const usuario_director = result_director.rows[0]
            const result_lector = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('lector') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const info_lector = result_lector.rowCount > 0 ? { "existe_lector": true, "nombre": result_lector.rows[0].nombre } : { "existe_lector": false };
            const result_jurado = await pool.query("SELECT u.nombre, u.id FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('jurado')AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const info_jurado = result_jurado.rowCount > 0 ? { "existe_jurado": true, "jurados": result_jurado.rows } : { "existe_jurado": false };
            const result_estudiantes = await pool.query('SELECT e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = true', [id])

            if (result_estudiantes.rowCount > 0 && result_director.rowCount > 0) {
                return res.json({ success: true, proyecto: proyecto, director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows });
            } else {
                return res.status(203).json({ success: true, message: error })
            }

        } else {
            return res.status(203).json({ success: true, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' })
        }
    } catch (error) {
        console.log(error)
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const rolDirector = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuario_rol WHERE id_rol=1 AND id_usuario = $1 AND estado=true', [id]);
        if (result.rowCount > 0) {
            return res.json({ success: true });
        } else {
            return res.status(203).json({ success: false });
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
            return res.status(203).json({ success: false });
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
            return res.status(203).json({ success: false });
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
            return res.status(203).json({ success: false, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerSolicitudesPendientesResponderDirector = async (req, res) => {

    const { id } = req.params;
    try {
        const result = await pool.query(`
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto 
        WHERE s.creado_proyecto = true AND 
        ad.id IS NULL AND s.creado_proyecto = true AND
        ur.id_rol = 1 AND ur.id_usuario = $1`, [id]);
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
const obtenerSolicitudesPendientesResponderComite = async (req, res) => {

    const { id } = req.params;
    try {
        const result = await pool.query(`
        SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_aprobado_director 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN usuario_rol ur ON p.id = ur.id_proyecto 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE ad.aprobado = true AND ac.id IS NULL AND
        ur.id_rol = 1 AND ur.id_usuario = $1
        UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id
        JOIN usuario_rol ur ON p.id = ur.id_proyecto  
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE s.creado_proyecto = false AND ac.id IS NULL AND
        ur.id_rol = 1 AND ur.id_usuario = $1
        `, [id]);
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

const obtenerSolicitudesCerradasAprobadas = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
        SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto  
        WHERE ad.aprobado = true AND ac.aprobado = true AND 
        ur.id_rol = 1 AND ur.id_usuario = $1
    
        UNION 
    
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto  
        WHERE s.creado_proyecto = false AND ac.aprobado = true AND 
        ur.id_rol = 1 AND ur.id_usuario = $1`, [id]);
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
const obtenerSolicitudesCerradasRechazadas = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
        SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto  
        WHERE ad.aprobado = true AND ac.aprobado = false AND
        ur.id_rol = 1 AND ur.id_usuario = $1
        UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto 
        WHERE s.creado_proyecto = false AND ac.aprobado = false AND
        ur.id_rol = 1 AND ur.id_usuario = $1
        UNION 
        SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_director, NULL AS fecha_rechazado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto
        WHERE ad.aprobado = false AND
        ur.id_rol = 1 AND ur.id_usuario = $1`, [id]);
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

const guardarSolicitud = async (req, res) => {
    try {
        const { id_tipo_solicitud, justificacion, id_proyecto, creado_proyecto } = req.body;

        const query = 'INSERT INTO solicitud (justificacion, id_tipo_solicitud, id_proyecto, creado_proyecto) VALUES ($1, $2, $3, $4) RETURNING id';
        const values = [justificacion, id_tipo_solicitud, id_proyecto, creado_proyecto];
        await pool.query(query, values, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error al obtener la información de los tipos. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
            }
            if (result.rowCount > 0) {
                return res.status(200).json({ success: true, message: 'Solicitud creada correctamente.' });
            } else {
                return res.status(203).json({ success: true, message: 'No pudo crear la solicitud.' })
            }
        });
    } catch (error) {
        console.log(error)
        return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error en la conexión con la base de datos. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
    }
};

const agregarAprobacion = async (req, res) => {
    try {
        const { aprobado, comentario, id_solicitud } = req.body;
        await pool.query(
            "INSERT INTO public.aprobado_solicitud_director (aprobado, comentario, id_solicitud) VALUES ($1, $2, $3)",
            [aprobado, comentario, id_solicitud],
            (error, result) => {
                if (error) {
                    if (error.code === "23505") {
                        return res.status(400).json({ success: false, message: "Ya fue aprobada esta solicitud." });
                    }
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error al guardar la aprobación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
                }

                if (result.rowCount > 0) {
                    return res.json({ success: true, message: 'Aprobación guardada correctamente.' });
                } 
            }
        );

        return res.status(203).json({ success: true, message: 'No se pudo aprobar la solicitud' });
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerListaProyectos = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT p.id, nombre FROM proyecto p JOIN usuario_rol ur ON p.id = ur.id_proyecto WHERE ur.estado=true AND ur.id_usuario=$1';
        await pool.query(query, [id], (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            const proyectos = result.rows;
            if (proyectos.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay proyectos.' });
            }
            return res.status(200).json({ success: true, message: 'Proyectos obtenidos correctamente', proyectos });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
module.exports = {
    obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerProyecto, rolDirector, rolJurado, rolLector, verUsuario,
    obtenerSolicitudesPendientesResponderDirector, obtenerSolicitudesPendientesResponderComite, obtenerSolicitudesCerradasAprobadas, obtenerSolicitudesCerradasRechazadas, guardarSolicitud, agregarAprobacion, obtenerListaProyectos
}
