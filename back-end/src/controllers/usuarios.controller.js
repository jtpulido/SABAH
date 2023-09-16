const pool = require('../database')

const { nuevaReunionUser, solicitudDirector, cancelarReunionUser, cambioAsistencia, editarReunionUser, nuevaSolicitudUser, mailCambioEstadoProyecto } = require('../controllers/mail.controller');

const obtenerProyectosDesarrolloRol = async (req, res) => {
    const { idUsuario, idRol } = req.params;
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
            , [idUsuario, idRol]);
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
    const { idUsuario, idRol } = req.params;
    try {
        const result = await pool.query(`SELECT p.id, p.codigo, p.nombre, he.anio, he.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario_rol ur ON p.id = ur.id_proyecto WHERE ur.id_usuario = $1 AND ur.id_rol = $2 AND ur.estado = true AND es.nombre IN('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado') AND
            he.fecha_cambio = (
              SELECT MAX(fecha_cambio)
              FROM historial_etapa
              WHERE id_proyecto = p.id
          ) ORDER BY nombre ASC`, [idUsuario, idRol]);
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
            const info_cliente = result_cliente.rowCount > 0 ? { "existe_cliente": true, "empresa": result_cliente.rows[0].nombre_empresa, "representante": result_cliente.rows[0].nombre_repr, "correo": result_cliente.rows[0].correo_repr } : { "existe_cliente": false };
            return res.json({ success: true, proyecto: proyecto[0], director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows, cliente: info_cliente });

        } else {
            return res.status(203).json({ success: true, message: error })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const rolDirector = async (req, res) => {
    const { idUsuario } = req.params;
    try {
        const result = await pool.query('SELECT * FROM usuario_rol WHERE id_rol=1 AND id_usuario = $1 AND estado=true', [idUsuario]);
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
    const { idUsuario } = req.params;
    try {
        const result = await pool.query('SELECT * FROM usuario_rol WHERE id_rol=2 AND id_usuario = $1 AND estado=true', [idUsuario]);
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
    const { idUsuario } = req.params;
    try {
        const result = await pool.query('SELECT * FROM usuario_rol WHERE id_rol=3 AND id_usuario = $1 AND estado=true', [idUsuario]);
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
    const { id } = req.params;
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
    const { idUsuario, idRol } = req.params;
    const rol = { 1: 'Director', 2: 'Lector', 3: 'Jurado' }[idRol];

    try {
        await pool.query(`UPDATE reunion SET id_estado=(SELECT id FROM estado_reunion WHERE nombre = 'Completa') WHERE fecha<CURRENT_TIMESTAMP AND id_estado!=(SELECT id FROM estado_reunion WHERE nombre = 'Cancelada')`);

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
        const selectValues = [idUsuario, `%${rol}%`];
        const result = await pool.query(selectQuery, selectValues);
        const pendientes = result.rows;

        if (pendientes.length > 0) {
            return res.json({ success: true, pendientes });
        } else {
            return res.status(203).json({ success: true, message: 'No tienes reuniones pendientes en este momento.' });
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerReunionesCompletas = async (req, res) => {
    const { idUsuario, idRol } = req.params;

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
            SELECT r.id, r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, r.enlace, r.justificacion, r.id_estado, pr.id AS id_proyecto, pr.nombre AS nombre_proyecto, asi.id AS asistencia_id, asi.nombre AS nombre_asistencia, ac.id AS id_acta,
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
            LEFT JOIN acta_reunion ac ON ac.id_reunion = r.id
            WHERE e.nombre = 'Completa' AND ur.id_usuario = $1
            GROUP BY r.id, r.nombre, r.fecha, r.enlace, pr.id, pr.nombre, asi.id, asi.nombre, ac.id
          ) AS subconsulta
          WHERE subconsulta.roles_invitados ILIKE $2
          ORDER BY subconsulta.fecha ASC;`, [idUsuario, `%${rol}%`]);
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
    const { idUsuario, idRol } = req.params;

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
          ORDER BY subconsulta.fecha ASC;`, [idUsuario, `%${rol}%`]);
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
        const { id_tipo_solicitud, justificacion, id_proyecto, creado_proyecto, id_usuario } = req.body;
        await pool.query('BEGIN');

        // Enviar correo
        const resultProyecto = await pool.query(`SELECT nombre FROM proyecto WHERE id=$1`, [id_proyecto]);
        const nombre_proyecto = resultProyecto.rows[0].nombre;

        const resultUsuario = await pool.query(`SELECT nombre, correo FROM usuario WHERE id=$1`, [id_usuario]);
        const infoUsuario = resultUsuario.rows[0];

        const resultCorreos = await pool.query(`SELECT e.correo, e.nombre FROM estudiante e
        JOIN estudiante_proyecto ep ON ep.id_estudiante = e.id
        JOIN proyecto pr ON pr.id = ep.id_proyecto
        WHERE pr.id = $1  AND ep.estado = true`, [id_proyecto]);
        const infoCorreos = resultCorreos.rows;

        const resultTipo = await pool.query(`SELECT nombre FROM tipo_solicitud WHERE id=$1`, [id_tipo_solicitud]);
        const nombre_tipo = resultTipo.rows[0].nombre;

        const query = await pool.query('INSERT INTO solicitud (justificacion, id_tipo_solicitud, id_proyecto, creado_proyecto) VALUES ($1, $2, $3, $4) RETURNING id', [justificacion, id_tipo_solicitud, id_proyecto, creado_proyecto]);

        if (query.rowCount > 0) {
            await nuevaSolicitudUser(nombre_tipo, justificacion, nombre_proyecto, infoUsuario.nombre, infoUsuario.correo, infoCorreos)
            await pool.query('COMMIT');
            return res.status(201).json({ success: true, message: "La solicitud ha sido creado con éxito y los involucrados han sido notificados." });

        } else {
            await pool.query('ROLLBACK');
            return res.status(203).json({ success: true, message: 'No pudo crear la solicitud.' })
        }

    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error en la conexión con la base de datos. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
    }
};

const agregarAprobacion = async (req, res) => {
    try {
        const { aprobado, comentario, id_solicitud } = req.body;
        await pool.query(
            "INSERT INTO public.aprobado_solicitud_director (aprobado, comentario, id_solicitud) VALUES ($1, $2, $3)",
            [aprobado, comentario, id_solicitud],
            async (error, result) => {
                if (error) {
                    if (error.code === "23505") {
                        return res.status(400).json({ success: false, message: "Ya fue aprobada esta solicitud." });
                    }
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error al guardar la aprobación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
                }

                if (result.rowCount > 0) {
                    if (aprobado) {

                        // Enviar correo
                        const resultProyecto = await pool.query(`SELECT pr.nombre FROM proyecto pr JOIN solicitud s ON s.id_proyecto = pr.id WHERE s.id=$1`, [id_solicitud]);
                        const nombre_proyecto = resultProyecto.rows[0].nombre;

                        const resultUsuario = await pool.query(`SELECT u.correo, u.nombre FROM usuario u JOIN usuario_rol ur ON ur.id_usuario = u.id JOIN proyecto pr ON pr.id = ur.id_proyecto JOIN solicitud s ON s.id_proyecto = pr.id WHERE s.id = $1 AND ur.id_rol=1 AND ur.estado = true`, [id_solicitud]);
                        const infoUsuario = resultUsuario.rows[0];

                        const resultTipo = await pool.query(`SELECT t.nombre FROM tipo_solicitud t JOIN solicitud s ON t.id = s.id_tipo_solicitud WHERE s.id=$1`, [id_solicitud]);
                        const nombre_tipo = resultTipo.rows[0].nombre;

                        await solicitudDirector(nombre_tipo, aprobado, comentario, nombre_proyecto, infoUsuario.nombre, infoUsuario.correo);

                        return res.json({ success: true, message: 'La aprobación ha sido guardada correctamente. Se le ha notificado al Comité, y se le ha enviado una copia.' });
                    } else {
                        return res.json({ success: true, message: 'La aprobación ha sido guardada correctamente.' });
                    }
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
    const rol = { 1: 'Director', 2: 'Lector', 3: 'Jurado' }[id_rol];

    try {
        await pool.query('BEGIN');

        // Crear la nueva reunion
        await pool.query(`INSERT INTO reunion(id, nombre, fecha, enlace, id_proyecto, id_estado) VALUES ($1, $2, TO_TIMESTAMP($3, 'DD-MM-YYYY HH24:MI'), $4, $5, $6)`, [id_reunion, nombre, fecha, enlace, id_proyecto, id_estado]);

        // Agregar invitado
        await pool.query(`INSERT INTO invitados(id_reunion, id_usuario_rol) VALUES ($1, (SELECT id FROM usuario_rol WHERE id_usuario=$2 AND id_rol=$3 AND id_proyecto=$4 AND estado=true))`, [id_reunion, id_usuario, id_rol, id_proyecto]);

        // Enviar correo
        const resultProyecto = await pool.query(`SELECT nombre FROM proyecto WHERE id=$1`, [id_proyecto]);
        const nombre_proyecto = resultProyecto.rows[0].nombre;

        const resultUsuario = await pool.query(`SELECT nombre, correo FROM usuario WHERE id=$1`, [id_usuario]);
        const infoUsuario = resultUsuario.rows[0];

        const resultCorreos = await pool.query(`SELECT correo, nombre FROM estudiante e
        JOIN estudiante_proyecto ep ON ep.id_estudiante = e.id
        WHERE ep.estado = true AND ep.id_proyecto = $1`, [id_proyecto]);
        const infoCorreos = resultCorreos.rows;

        const emailResult = await nuevaReunionUser(nombre, fecha, enlace, nombre_proyecto, rol, infoUsuario.nombre, infoUsuario.correo, infoCorreos);
        if (emailResult.success) {
            responseStatus = { success: true, message: 'La reunión fue creada exitosamente y los involucrados han sido notificados.' };
        } else {
            await pool.query('ROLLBACK');
            responseStatus = {
                success: false,
                message: 'Ha ocurrido un error al crear la reunión. Por favor inténtelo más tarde.',
            };
        }

        if (responseStatus.success) {
            await pool.query('COMMIT');
        }
        res.status(responseStatus.success ? 201 : 500).json(responseStatus);

    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }

};

const cancelarReunion = async (req, res) => {
    const { id_reunion, justificacion, id_usuario, id_rol } = req.body;
    const rol = { 1: 'Director', 2: 'Lector', 3: 'Jurado' }[id_rol];

    try {

        await pool.query('BEGIN');

        // Enviar correo
        const resultProyecto = await pool.query(`SELECT pr.nombre FROM proyecto pr
        JOIN reunion r ON r.id_proyecto = pr.id
        WHERE r.id = $1`, [id_reunion]);
        const nombre_proyecto = resultProyecto.rows[0].nombre;

        const resultUsuario = await pool.query(`SELECT nombre, correo FROM usuario WHERE id=$1`, [id_usuario]);
        const infoUsuario = resultUsuario.rows[0];

        const resultCorreos = await pool.query(`SELECT e.correo, e.nombre FROM estudiante e
        JOIN estudiante_proyecto ep ON ep.id_estudiante = e.id
        JOIN proyecto pr ON pr.id = ep.id_proyecto
        JOIN reunion r ON r.id_proyecto = pr.id
        WHERE r.id = $1 AND ep.estado = true`, [id_reunion]);
        const infoCorreos = resultCorreos.rows;

        const resultReunion = await pool.query(`SELECT nombre, TO_CHAR(fecha, 'DD-MM-YYYY HH24:MI') AS fecha, enlace FROM reunion where id = $1`, [id_reunion]);
        const infoReunion = resultReunion.rows[0];

        const emailResult = await cancelarReunionUser(infoReunion.nombre, infoReunion.fecha, infoReunion.enlace, nombre_proyecto, rol, infoUsuario.nombre, infoUsuario.correo, infoCorreos, justificacion);
        if (emailResult.success) {
            responseStatus = { success: true, message: 'La reunión ha sido cancelada con éxito y los involucrados han sido notificados.' };
        } else {
            await pool.query('ROLLBACK');
            responseStatus = {
                success: false,
                message: 'Ha ocurrido un error al cancelar la reunión. Por favor inténtelo más tarde.',
            };
        }

        // Cancelar reunion
        const result = await pool.query(`UPDATE reunion SET id_estado=(SELECT id FROM estado_reunion WHERE nombre = 'Cancelada'), justificacion=$2 WHERE id=$1`, [id_reunion, justificacion]);

        if (!result || result.rowCount === 0) {
            await pool.query('ROLLBACK');
            responseStatus = {
                success: false,
                message: 'Ha ocurrido un error al cancelar la reunión. Por favor inténtelo más tarde.',
            };
        } else {
            responseStatus = { success: true, message: 'La reunión ha sido cancelada con éxito y los involucrados han sido notificados.' };
        }

        if (responseStatus.success) {
            await pool.query('COMMIT');
        }
        res.status(responseStatus.success ? 201 : 500).json(responseStatus);

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
    const rol = { 1: 'Director', 2: 'Lector', 3: 'Jurado' }[idRol];
    const asistencia = { 1: 'Presente', 2: 'Ausente', 3: 'Excusado' }[idAsistencia];

    try {
        await pool.query('BEGIN');

        if (idAsistencia === undefined) {
            await pool.query(`UPDATE reunion SET nombre=$2, fecha=TO_TIMESTAMP($3, 'DD-MM-YYYY HH24:MI'), enlace=$4 WHERE id=$1`, [id, nombre, fecha, enlace]);

            // Enviar correo
            const resultProyecto = await pool.query(`SELECT pr.nombre FROM proyecto pr
            JOIN reunion r ON r.id_proyecto = pr.id
            WHERE r.id = $1`, [id]);
            const nombre_proyecto = resultProyecto.rows[0].nombre;

            const resultUsuario = await pool.query(`SELECT nombre, correo FROM usuario WHERE id=$1`, [idUsuario]);
            const infoUsuario = resultUsuario.rows[0];

            const resultCorreos = await pool.query(`SELECT e.correo, e.nombre FROM estudiante e
            JOIN estudiante_proyecto ep ON ep.id_estudiante = e.id
            JOIN proyecto pr ON pr.id = ep.id_proyecto
            JOIN reunion r ON r.id_proyecto = pr.id
            WHERE r.id = $1 AND ep.estado = true`, [id]);
            const infoCorreos = resultCorreos.rows;

            const emailResult = await editarReunionUser(nombre, fecha, enlace, nombre_proyecto, rol, infoUsuario.nombre, infoUsuario.correo, infoCorreos);
            if (emailResult.success) {
                responseStatus = { success: true, message: 'La reunión ha sido editada con éxito y los involucrados han sido notificados.' };
            } else {
                await pool.query('ROLLBACK');
                responseStatus = {
                    success: false,
                    message: 'Ha ocurrido un error al editar la reunión. Por favor inténtelo más tarde.',
                };
            }

        } else {
            await pool.query(`UPDATE invitados SET id_asistencia = $2 WHERE id_reunion = $1 AND id_usuario_rol = (SELECT id FROM usuario_rol WHERE id_usuario=$3 AND id_proyecto=$4 AND id_rol=$5 AND estado=true)`, [id, idAsistencia, idUsuario, idProyecto, idRol]);

            // Enviar correo
            const resultProyecto = await pool.query(`SELECT nombre FROM proyecto WHERE id=$1`, [idProyecto]);
            const nombre_proyecto = resultProyecto.rows[0].nombre;

            const resultUsuario = await pool.query(`SELECT nombre, correo FROM usuario WHERE id=$1`, [idUsuario]);
            const infoUsuario = resultUsuario.rows[0];

            const resultReunion = await pool.query(`SELECT r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha FROM reunion r
            JOIN invitados i ON i.id_reunion = r.id
            JOIN usuario_rol ur ON ur.id = i.id_usuario_rol
            where ur.id_usuario = $1 AND ur.id_proyecto=$2 AND ur.estado=true AND ur.id_rol=$3`, [idUsuario, idProyecto, idRol]);
            const infoReunion = resultReunion.rows[0];

            const emailResult = await cambioAsistencia(infoReunion.nombre, infoReunion.fecha, nombre_proyecto, rol, infoUsuario.nombre, infoUsuario.correo, asistencia);
            if (emailResult.success) {
                responseStatus = { success: true, message: 'La reunión ha sido editada con éxito.' };
            } else {
                await pool.query('ROLLBACK');
                responseStatus = {
                    success: false,
                    message: 'Ha ocurrido un error al editar la reunión. Por favor inténtelo más tarde.',
                };
            }

        }

        if (responseStatus.success) {
            await pool.query('COMMIT');
        }
        res.status(responseStatus.success ? 201 : 500).json(responseStatus);

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
const verificarCalificacionesPendientes = async (req, res) => {
    const { proyectoId, etapaId, anio, periodo, modalidadId } = req.params;

    try {
        const query = `
        SELECT COUNT(*) AS cantidad_registros
        FROM proyecto p
        INNER JOIN espacio_entrega ee ON p.id_modalidad = ee.id_modalidad
        INNER JOIN historial_etapa he ON p.id = he.id_proyecto AND he.anio = ee.anio AND he.periodo = ee.periodo 
        INNER JOIN etapa ep ON he.id_etapa = ep.id AND he.id_etapa = ee.id_etapa
        INNER JOIN estado es ON p.id_estado = es.id AND LOWER(es.nombre) = 'en desarrollo'
        LEFT JOIN documento_entrega de ON de.id_proyecto = p.id AND de.id_espacio_entrega = ee.id
        LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ee.id_rol = ur.id_rol AND ur.estado = TRUE
        WHERE
            (
                (
                    (de.id IS NULL AND NOW() > ee.fecha_cierre_entrega) OR
                    (de.id IS NULL AND NOW() <= ee.fecha_cierre_entrega)
                )
                OR
                (
                    (de.id IS NOT NULL AND de.id NOT IN (
                        SELECT id_doc_entrega
                        FROM calificacion
                        WHERE id_usuario_rol = ur.id
                    ))
                )
            )
        AND p.id = $1
        AND he.anio = $2
        AND he.periodo = $3
        AND he.id_etapa = $4
        AND p.id_modalidad = $5
        AND ee.final = true
        AND (he.anio, he.periodo) = (
            SELECT anio, periodo
            FROM historial_etapa
            WHERE id_proyecto = p.id
            ORDER BY fecha_cambio DESC
            LIMIT 1
        )`;
        const values = [proyectoId, anio, periodo, etapaId, modalidadId];
        await pool.query(query, values, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al validar las entregas.' });
            }
            if (result) {
                const pendientes = result.rows[0].cantidad_registros;

                if (pendientes === '0') {
                    return res.status(200).json({ success: true, pendientes: false });
                } else {
                    return res.status(203).json({ success: true, pendientes: true });
                }
            }
        });
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Error al verificar si tiene calificaciones pendientes' });
    }
};
const verificarAproboEntregasCalificadas = async (req, res) => {
    const { proyectoId, etapaId, anio, periodo, modalidadId } = req.params;
    try {
        const query =
            `SELECT
                p.id AS id_proyecto,
                CASE
                    WHEN COUNT(*) = SUM(CASE WHEN c.nota_final >= 3.0 THEN 1 ELSE 0 END) THEN true
                    ELSE false
                END AS aprobo
            FROM 
                proyecto p
                INNER JOIN documento_entrega de ON p.id = de.id_proyecto
                INNER JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id
                INNER JOIN calificacion c ON de.id = c.id_doc_entrega
                INNER JOIN historial_etapa he ON p.id = he.id_proyecto AND he.anio = ee.anio AND he.periodo = ee.periodo 
                INNER JOIN etapa ep ON he.id_etapa = ep.id AND  he.id_etapa = ee.id_etapa
            WHERE
                p.id = $1
                AND he.anio = $2
                AND he.periodo = $3
                AND he.id_etapa = $4
                AND p.id_modalidad = $5
                AND ee.final = true
                AND (he.anio, he.periodo) = (
                    SELECT anio, periodo
                    FROM historial_etapa
                    WHERE id_proyecto = p.id
                    ORDER BY fecha_cambio DESC
                    LIMIT 1
                )
            GROUP BY p.id`;

        const values = [proyectoId, anio, periodo, etapaId, modalidadId];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(203).json({ success: false, message: 'No se encontró el proyecto.' });
        }
        const aprobo = result.rows[0].aprobo;
        return res.status(200).json({ success: true, aprobo });
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Error interno del servidor.' });
    }
};
const cambiarEstadoEntregasFinales = async (req, res) => {
    try {
        const { proyecto } = req.body;
        const { id, id_etapa, id_modalidad, nombre } = proyecto;
        let id_nuevo_estado = "";

        // Consultar la modalidad actual del proyecto
        const resultModalidad = await pool.query('SELECT id, nombre FROM modalidad WHERE id = $1', [id_modalidad]);
        const modalidad = resultModalidad.rows[0];

        // Consultar la etapa actual del proyecto
        const resultEtapa = await pool.query('SELECT id, nombre FROM etapa WHERE id = $1', [id_etapa]);
        const etapa = resultEtapa.rows[0];

        // Consultar el estado actual del proyecto
        const resultEstado = await pool.query('SELECT id, nombre FROM estado');
        const estados = resultEstado.rows;

        // Determinar el nuevo estado basado en la modalidad y la etapa
        let nuevoEstadoFiltrado = [];

        if (modalidad.nombre === 'Coterminal') {
            // Filtrar el estado "Aprobado proyecto de grado 1"
            nuevoEstadoFiltrado = estados.filter(estado => estado.nombre === "Aprobado propuesta");
        } else {
            switch (etapa.nombre) {
                case 'Propuesta':
                    // Filtrar el estado "Aprobado propuesta"
                    nuevoEstadoFiltrado = estados.filter(estado => estado.nombre === "Aprobado propuesta");
                    break;
                case 'Proyecto de grado 1':
                    // Filtrar el estado "Aprobado proyecto de grado 1"
                    nuevoEstadoFiltrado = estados.filter(estado => estado.nombre === "Aprobado proyecto de grado 1");
                    break;
                case 'Proyecto de grado 2':
                    // Filtrar el estado "Aprobado"
                    nuevoEstadoFiltrado = estados.filter(estado => estado.nombre === "Aprobado");
                    break;
                default:
                    // Manejar otro caso si es necesario
                    break;
            }
        }

        if (nuevoEstadoFiltrado.length > 0) {
            id_nuevo_estado = nuevoEstadoFiltrado[0].id;
        }
        await pool.query('BEGIN');
        await pool.query(
            `
            UPDATE proyecto
            SET id_estado = $1
            WHERE id = $2
        `,
            [id_nuevo_estado, id], async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error al realizar el cambio de estado." });
                }
                if (result) {
                    const resultCorreos = await pool.query('SELECT e.correo FROM estudiante_proyecto ep JOIN estudiante e ON ep.id_estudiante = e.id WHERE id_proyecto=$1 and estado=true', [id]);
                    const correos = resultCorreos.rows

                    await mailCambioEstadoProyecto(correos, nuevoEstadoFiltrado[0].nombre, `Entregas finales - ${etapa.nombre}`);
                    await pool.query('COMMIT')
                    return res.json({ success: true, message: `El proyecto ${nombre} aprobo la etapa ${etapa.nombre}`, etapa: etapa.nombre, estado: nuevoEstadoFiltrado[0].nombre })
                }
            })
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerInfoActa = async (req, res) => {
    const { idReunion } = req.params;
    try {
        const result = await pool.query(`SELECT TO_CHAR(t1.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, t1.nombre, t2.compromisos, t2.descrip_obj, t2.tareas_ant, t2.resultados_reu FROM acta_reunion t2 LEFT JOIN reunion t1 ON t1.id = t2.id_reunion WHERE t2.id_reunion = $1`, [idReunion]);
        const acta = result.rows[0];
        if (result.rowCount > 0) {
            return res.json({ success: true, acta });
        } else {
            return res.status(203).json({ success: false, message: 'No existe una acta para esta reunión.' });
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Ha ocurrido un error al recuperar el acta. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerInvitados = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
      SELECT i.id as id_tabla_invitados, i.id_reunion, i.id_usuario_rol, i.id_asistencia, i.id_cliente, 
      c.id AS id_tabla_cliente, c.nombre_empresa, c.nombre_repr, c.correo_repr,
      u.id AS id_tabla_usuario, u.nombre AS nombre_usuario, u.correo,
      r.id AS id_tabla_rol, r.nombre AS nombre_rol
      FROM invitados i
      LEFT JOIN cliente c ON i.id_cliente = c.id
      LEFT JOIN usuario_rol ur ON i.id_usuario_rol = ur.id
      LEFT JOIN usuario u ON ur.id_usuario = u.id
      LEFT JOIN rol r ON ur.id_rol = r.id
      WHERE i.id_reunion=$1`, [id]);
        const invitados = result.rows;
        if (result.rowCount > 0) {
            return res.json({ success: true, invitados });
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

module.exports = {
    obtenerInfoActa, obtenerInvitados, obtenerProyectosDesarrolloRol, obtenerProyectosCerradosRol, obtenerProyecto, rolDirector, rolJurado, rolLector, verUsuario,
    obtenerSolicitudesPendientesResponderDirector, obtenerSolicitudesPendientesResponderComite, obtenerSolicitudesCerradasAprobadas, obtenerSolicitudesCerradasRechazadas, guardarSolicitud,
    agregarAprobacion, obtenerListaProyectos, guardarCalificacion, crearReunionInvitados, ultIdReunion, editarReunion, obtenerAsistencia, cancelarReunion,
    obtenerReunion, obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas,
    verificarCalificacionesPendientes, verificarAproboEntregasCalificadas, cambiarEstadoEntregasFinales
}
