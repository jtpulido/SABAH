const pool = require('../database')


const obtenerProyectosDesarrolloRol = async (req, res) => {
    const { id_usuario, id_rol } = req.body;
    try {
        const result = await pool.query(`SELECT 
        p.id, p.codigo, 
        p.nombre, 
        he.anio, 
        he.periodo, 
        m.acronimo as modalidad, 
        e.nombre as etapa, 
        es.nombre as estado 
        FROM proyecto p 
        JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN usuario_rol ur ON p.id = ur.id_proyecto 
        WHERE ur.id_usuario=$1 AND ur.id_rol=$2 AND ur.estado=true AND es.nombre NOT IN ('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado')AND
        he.fecha_cambio = (
          SELECT MAX(fecha_cambio)
          FROM historial_etapa
          WHERE id_proyecto = p.id
      ) 
        ORDER BY nombre ASC`
            , [id_usuario, id_rol]);
        const proyectos = result.rows;
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(404).json({ success: true, message: 'No hay proyectos actualmente' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosCerradosRol = async (req, res) => {
    const { id_usuario, id_rol } = req.body;
    try {
        const result = await pool.query(`SELECT p.id, p.codigo, p.nombre, he.anio, he.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario_rol ur ON p.id = ur.id_proyecto WHERE ur.id_usuario = $1 AND ur.id_rol = $2 AND ur.estado = true AND es.nombre IN('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado') AND
            he.fecha_cambio = (
              SELECT MAX(fecha_cambio)
              FROM historial_etapa
              WHERE id_proyecto = p.id
          ) ORDER BY nombre ASC`, [id_usuario, id_rol]);
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
        const result = await pool.query(`SELECT p.id, p.codigo, p.nombre, he.anio, he.periodo, m.nombre as modalidad, m.acronimo as acronimo, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE p.id = $1 AND
            he.fecha_cambio = (
              SELECT MAX(fecha_cambio)
              FROM historial_etapa
              WHERE id_proyecto = p.id
          )`, [id])
        const proyecto = result.rows
        if (result.rowCount === 1) {
            const result_director = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('director') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const usuario_director = result_director.rows[0]
            const result_lector = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('lector') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const info_lector = result_lector.rowCount > 0 ? { "existe_lector": true, "nombre": result_lector.rows[0].nombre } : { "existe_lector": false };
            const result_jurado = await pool.query("SELECT u.nombre, u.id FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('jurado')AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const info_jurado = result_jurado.rowCount > 0 ? { "existe_jurado": true, "jurados": result_jurado.rows } : { "existe_jurado": false };
            const result_estudiantes = await pool.query('SELECT e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = true', [id])
            const result_cliente = await pool.query("SELECT c.nombre_empresa, c.nombre_repr, c.correo_repr FROM cliente c, proyecto p WHERE p.id = c.id_proyecto AND p.id = $1;", [id])
            const info_cliente = result_cliente.rowCount > 0 ? { "existe_cliente": true, "empresa": result_cliente.rows[0].nombre_empresa, "representante":result_cliente.rows[0].nombre_repr, "correo":result_cliente.rows[0].correo_repr  } : { "existe_cliente": false };
            return res.json({ success: true, proyecto: proyecto[0], director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows, cliente: info_cliente});

        } else {
            return res.status(203).json({ success: true, message: error })
        }
    } catch (error) {
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
            return res.status(200).json({ success: false, message: 'El usuario no tiene el rol de director.' });
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
            return res.status(200).json({ success: false, message: 'El usuario no tiene el rol de lector.' });
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
            return res.status(200).json({ success: false, message: 'El usuario no tiene el rol de jurado.' });
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

const obtenerReunion = async (req, res) => {
    const { id } = req.params;
    const id_reunion = req.headers['id_reunion'];
    try {

        const result = await pool.query('SELECT r.id, r.nombre, r.fecha, r.invitados, r.enlace FROM reunion r JOIN estado_reunion e ON r.id_estado = e.id WHERE r.id_proyecto = $1 AND r.id = $2;', [id, id_reunion])
        const reunion = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, reunion })
        } else {
            return res.status(200).json({ success: false, message: 'No hay reuniones' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

    }
};

const obtenerReunionesPendientes = async (req, res) => {
    const { id, idRol } = req.body;

    let rol = '';
    if (idRol === '1') {
        rol = 'Director';
    } else if (idRol === '2') {
        rol = 'Lector';
    } else if (idRol === '3') {
        rol = 'Jurado'
    }

    try {
        const updateQuery = `UPDATE reunion SET id_estado=(SELECT id FROM estado_reunion WHERE nombre = 'Completa') WHERE id_proyecto=$1 AND fecha<CURRENT_TIMESTAMP AND id_estado!=(SELECT id FROM estado_reunion WHERE nombre = 'Cancelada')`;
        const updateValues = [id];
        await pool.query(updateQuery, updateValues);

        // Obtener reunion actualizadas
        const selectQuery = `SELECT * FROM (
            SELECT r.id, r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, r.enlace, r.justificacion, r.id_estado, pr.id AS id_proyecto, pr.nombre AS nombre_proyecto,
                COALESCE(
                    STRING_AGG(DISTINCT
                        CASE
                            WHEN ur.id_rol = 1 THEN 'Director'
                            WHEN ur.id_rol = 2 THEN 'Lector'
                            WHEN ur.id_rol = 3 THEN 'Jurado'
                        END
                        , ', ') || 
                    CASE 
                        WHEN MAX(CASE WHEN inv.id_cliente IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN ', Cliente' 
                        ELSE '' 
                    END,
                    ''
                ) AS roles_invitados
            FROM reunion r 
            JOIN estado_reunion e ON r.id_estado = e.id 
            JOIN invitados inv ON inv.id_reunion = r.id 
            JOIN usuario_rol ur ON inv.id_usuario_rol = ur.id
            JOIN proyecto pr ON ur.id_proyecto = pr.id
            WHERE e.nombre = 'Pendiente' AND ur.id_usuario = $1
            GROUP BY r.id, r.nombre, r.fecha, r.enlace, pr.id, pr.nombre
          ) AS subconsulta
          WHERE subconsulta.roles_invitados ILIKE $2
          ORDER BY subconsulta.fecha ASC;`;
        const selectValues = [id, `%${rol}%`];
        const result = await pool.query(selectQuery, selectValues);
        const pendientes = result.rows;

        if (pendientes.length > 0) {
            return res.json({ success: true, pendientes });
        } else {
            return res.status(203).json({ success: true, message: 'No tienes reuniones pendientes en este momento.' });
        }
    } catch (error) {
        console.log(error)
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerReunionesCompletas = async (req, res) => {
    const { id, idRol } = req.body;

    let rol = '';
    if (idRol === '1') {
        rol = 'Director';
    } else if (idRol === '2') {
        rol = 'Lector';
    } else if (idRol === '3') {
        rol = 'Jurado'
    }

    try {
        const result = await pool.query(`SELECT * FROM (
            SELECT r.id, r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, r.enlace, r.justificacion, r.id_estado, pr.id AS id_proyecto, pr.nombre AS nombre_proyecto, asi.id AS asistencia_id, asi.nombre AS nombre_asistencia,
                COALESCE(
                    STRING_AGG(DISTINCT
                        CASE
                            WHEN ur.id_rol = 1 THEN 'Director'
                            WHEN ur.id_rol = 2 THEN 'Lector'
                            WHEN ur.id_rol = 3 THEN 'Jurado'
                        END
                        , ', ') || 
                    CASE 
                        WHEN MAX(CASE WHEN inv.id_cliente IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN ', Cliente' 
                        ELSE '' 
                    END,
                    ''
                ) AS roles_invitados
            FROM reunion r 
            JOIN estado_reunion e ON r.id_estado = e.id 
            JOIN invitados inv ON inv.id_reunion = r.id 
            LEFT JOIN asistencia asi ON asi.id = inv.id_asistencia
            JOIN usuario_rol ur ON inv.id_usuario_rol = ur.id
            JOIN proyecto pr ON ur.id_proyecto = pr.id
            WHERE e.nombre = 'Completa' AND ur.id_usuario = $1
            GROUP BY r.id, r.nombre, r.fecha, r.enlace, pr.id, pr.nombre, asi.id, asi.nombre
          ) AS subconsulta
          WHERE subconsulta.roles_invitados ILIKE $2
          ORDER BY subconsulta.fecha ASC;`, [id, `%${rol}%`]);
        const completas = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, completas });
        } else {
            return res.status(203).json({ success: true, message: 'No tienes reuniones completas en este momento.' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerReunionesCanceladas = async (req, res) => {
    const { id, idRol } = req.body;

    let rol = '';
    if (idRol === '1') {
        rol = 'Director';
    } else if (idRol === '2') {
        rol = 'Lector';
    } else if (idRol === '3') {
        rol = 'Jurado'
    }

    try {
        const result = await pool.query(`SELECT * FROM (
            SELECT r.id, r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, r.enlace, r.justificacion, pr.id AS id_proyecto, pr.nombre AS nombre_proyecto,
                COALESCE(
                    STRING_AGG(DISTINCT
                        CASE
                            WHEN ur.id_rol = 1 THEN 'Director'
                            WHEN ur.id_rol = 2 THEN 'Lector'
                            WHEN ur.id_rol = 3 THEN 'Jurado'
                        END
                        , ', ') || 
                    CASE 
                        WHEN MAX(CASE WHEN inv.id_cliente IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN ', Cliente' 
                        ELSE '' 
                    END,
                    ''
                ) AS roles_invitados
            FROM reunion r 
            JOIN estado_reunion e ON r.id_estado = e.id 
            JOIN invitados inv ON inv.id_reunion = r.id 
            JOIN usuario_rol ur ON inv.id_usuario_rol = ur.id
            JOIN proyecto pr ON ur.id_proyecto = pr.id
            WHERE e.nombre = 'Cancelada' AND ur.id_usuario = $1
            GROUP BY r.id, r.nombre, r.fecha, r.enlace, pr.id, pr.nombre
          ) AS subconsulta
          WHERE subconsulta.roles_invitados ILIKE $2
          ORDER BY subconsulta.fecha ASC;`, [id, `%${rol}%`]);
        const canceladas = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, canceladas });
        } else {
            return res.status(203).json({ success: true, message: 'No tienes reuniones canceladas en este momento.' })
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
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto 
        WHERE s.creado_proyecto = true AND 
        ad.id IS NULL AND s.creado_proyecto = true AND
        ur.id_rol = 1 AND ur.id_usuario = $1 AND
        he.fecha_cambio = (
          SELECT MAX(fecha_cambio)
          FROM historial_etapa
          WHERE id_proyecto = p.id
      )`, [id]);
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
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN usuario_rol ur ON p.id = ur.id_proyecto 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE ad.aprobado = true AND ac.id IS NULL AND
        ur.id_rol = 1 AND ur.id_usuario = $1 AND
        he.fecha_cambio = (
          SELECT MAX(fecha_cambio)
          FROM historial_etapa
          WHERE id_proyecto = p.id
      )        
        UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id
        JOIN usuario_rol ur ON p.id = ur.id_proyecto  
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE s.creado_proyecto = false AND ac.id IS NULL AND
        ur.id_rol = 1 AND ur.id_usuario = $1 AND
        he.fecha_cambio = (
          SELECT MAX(fecha_cambio)
          FROM historial_etapa
          WHERE id_proyecto = p.id
      )
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
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto  
        WHERE ad.aprobado = true AND ac.aprobado = true AND 
        ur.id_rol = 1 AND ur.id_usuario = $1 AND
        he.fecha_cambio = (
          SELECT MAX(fecha_cambio)
          FROM historial_etapa
          WHERE id_proyecto = p.id
      )    
        UNION 
    
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto  
        WHERE s.creado_proyecto = false AND ac.aprobado = true AND 
        ur.id_rol = 1 AND ur.id_usuario = $1 AND
        he.fecha_cambio = (
          SELECT MAX(fecha_cambio)
          FROM historial_etapa
          WHERE id_proyecto = p.id
      )`, [id]);
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
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto  
        WHERE ad.aprobado = true AND ac.aprobado = false AND
        ur.id_rol = 1 AND ur.id_usuario = $1 AND
        he.fecha_cambio = (
          SELECT MAX(fecha_cambio)
          FROM historial_etapa
          WHERE id_proyecto = p.id
      )
        UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto 
        WHERE s.creado_proyecto = false AND ac.aprobado = false AND
        ur.id_rol = 1 AND ur.id_usuario = $1 AND
        he.fecha_cambio = (
          SELECT MAX(fecha_cambio)
          FROM historial_etapa
          WHERE id_proyecto = p.id
      )
        UNION 
        SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_director, NULL AS fecha_rechazado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud
        JOIN usuario_rol ur ON p.id = ur.id_proyecto
        WHERE ad.aprobado = false AND
        ur.id_rol = 1 AND ur.id_usuario = $1 AND
        he.fecha_cambio = (
          SELECT MAX(fecha_cambio)
          FROM historial_etapa
          WHERE id_proyecto = p.id
      )`, [id]);
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

const crearReunionInvitados = async (req, res) => {
    const { id_reunion, id_usuario, id_rol, nombre, fecha, enlace, id_proyecto, id_estado } = req.body;

    try {
        await pool.query('BEGIN');

        // Crear la nueva reunion
        await pool.query(`INSERT INTO reunion(id, nombre, fecha, enlace, id_proyecto, id_estado) VALUES ($1, $2, TO_TIMESTAMP($3, 'DD-MM-YYYY HH24:MI'), $4, $5, $6)`, [id_reunion, nombre, fecha, enlace, id_proyecto, id_estado]);

        // Agregar invitado
        await pool.query(`INSERT INTO invitados(id_reunion, id_usuario_rol) VALUES ($1, (SELECT id FROM usuario_rol WHERE id_usuario=$2 AND id_rol=$3 AND id_proyecto=$4 AND estado=true))`, [id_reunion, id_usuario, id_rol, id_proyecto]);

        await pool.query('COMMIT');
        res.status(201).json({ success: true, message: 'La reunión fue creada exitosamente y los estudiantes han sido notificados.' });

    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }

};

const cancelarReunion = async (req, res) => {
    const { id_reunion, justificacion } = req.body;
    try {
        const query = `UPDATE reunion SET id_estado=(SELECT id FROM estado_reunion WHERE nombre = 'Cancelada'), justificacion=$2 WHERE id=$1`;
        const values = [id_reunion, justificacion];
        await pool.query(query, values);
        res.status(200).json({ success: true, message: 'La reunión ha sido cancelada con éxito.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'No se pudo completar la cancelación de la reunión.' });
    }
};

const obtenerAsistencia = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM asistencia ORDER BY id ASC`);
        const asistencia = result.rows;
        if (result.rowCount > 0) {
            return res.status(200).json({ success: true, asistencia });
        } else {
            return res.status(203).json({ success: true, message: 'No hay valores de asistencia actualmente.' })
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const editarReunion = async (req, res) => {
    const { id, nombre, fecha, enlace, idAsistencia, idUsuario, idProyecto, idRol } = req.body;
    try {
        await pool.query('BEGIN');

        if (idAsistencia === undefined) {
            await pool.query(`UPDATE reunion SET nombre=$2, fecha=TO_TIMESTAMP($3, 'DD-MM-YYYY HH24:MI'), enlace=$4 WHERE id=$1`, [id, nombre, fecha, enlace]);
        } else {
            await pool.query(`UPDATE invitados SET id_asistencia = $2 WHERE id_reunion = $1 AND id_usuario_rol = (SELECT id FROM usuario_rol WHERE id_usuario=$3 AND id_proyecto=$4 AND id_rol=$5 AND estado=true)`, [id, idAsistencia, idUsuario, idProyecto, idRol]);
        }

        await pool.query('COMMIT');
        res.status(200).json({ success: true, message: 'Reunión editada exitosamente' });

    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const ultIdReunion = async (req, res) => {
    try {
        const result = await pool.query('SELECT MAX(id) from reunion');
        const id = result.rows[0].max || 0;
        if (id !== null) {
            return res.json({ success: true, id });
        } else {
            return res.status(404).json({ success: true, id: 0 });
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};


const guardarCalificacion = async (req, res) => {
    try {
        const { id_doc_entrega, id_usuario_rol, calificacion_aspecto } = req.body;
        await pool.query('BEGIN');
        const insertCal = 'INSERT INTO calificacion (id_doc_entrega, id_usuario_rol) VALUES ($1, $2) RETURNING id';
        const calResult = await pool.query(insertCal, [id_doc_entrega, id_usuario_rol]);
        const id_calificacion = calResult.rows[0].id;

        let puntaje = 0;
        const calAspRubricaQuery = 'INSERT INTO calificacion_aspecto (id_calificacion, id_rubrica_aspecto, puntaje, comentario) VALUES ($1, $2, $3, $4)';
        for (let i = 0; i < calificacion_aspecto.length; i++) {
            const calificacion = calificacion_aspecto[i];
            puntaje = puntaje + Number(calificacion.puntaje)
            const valuesCalificacion = [id_calificacion, calificacion.id_rubrica_aspecto, calificacion.puntaje, calificacion.comentario];
            await pool.query(calAspRubricaQuery, valuesCalificacion);
        }
        const nota_final = (puntaje * 5) / 100
        const query = 'UPDATE calificacion SET nota_final = $1 WHERE id = $2';
        await pool.query(query, [nota_final, id_calificacion]);

        await pool.query('COMMIT');
        return res.status(200).json({ success: true, message: 'Calificación guardada correctamente' });
    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(502).json({ success: false, message: 'Error guardar la calificación' });
    }
};
module.exports = {
    obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerProyecto, rolDirector, rolJurado, rolLector, verUsuario,
    obtenerSolicitudesPendientesResponderDirector, obtenerSolicitudesPendientesResponderComite, obtenerSolicitudesCerradasAprobadas, obtenerSolicitudesCerradasRechazadas, guardarSolicitud,
    agregarAprobacion, obtenerListaProyectos, guardarCalificacion, crearReunionInvitados, ultIdReunion, editarReunion, obtenerAsistencia, cancelarReunion,
    obtenerReunion, obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas
}
