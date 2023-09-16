const pool = require('../database')

const { agregarLink, cancelarReunionProyecto, nuevaSolicitudProyecto, nuevaReunionEstudiantes, editarReunionProyecto } = require('../controllers/mail.controller');


const obtenerProyecto = async (req, res) => {
  const id = req.params.id;
  try {
    const error = "No se puedo encontrar toda la información relacionada al proyecto. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda."
    const result = await pool.query(`
            SELECT 
                p.id, 
                p.codigo, 
                p.nombre, 
                he.anio as anio,
                he.periodo as periodo,
                m.nombre as modalidad, 
                m.acronimo as acronimo, 
                e.nombre as etapa, 
                es.nombre as estado 
            FROM proyecto p 
            JOIN modalidad m ON p.id_modalidad = m.id 
            JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id
            JOIN estado es ON p.id_estado = es.id 
            WHERE p.id = $1 AND
            he.fecha_cambio = (
              SELECT MAX(fecha_cambio)
              FROM historial_etapa
              WHERE id_proyecto = p.id
          )
        `, [id]); const proyecto = result.rows

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

const obtenerEntregasPendientes = async (req, res) => {
  const { id } = req.params;
  try {

    const query =
      `SELECT 
      ROW_NUMBER() OVER (ORDER BY ee.id) AS id,
      ee.id AS id_espacio_entrega,
      ee.nombre AS nombre_espacio_entrega,
      p.id AS id_proyecto,
      p.nombre AS nombre_proyecto,
      r.nombre AS nombre_rol,
      ee.descripcion,
      ee.fecha_apertura_entrega,
      ee.fecha_cierre_entrega,
      ee.fecha_apertura_calificacion,
      ee.fecha_cierre_calificacion,
      ee.anio,
      ee.periodo,
      ep.nombre AS etapa,
      CASE
        WHEN NOW() < ee.fecha_apertura_entrega THEN 'cerrado'
        WHEN NOW() BETWEEN ee.fecha_apertura_entrega AND ee.fecha_cierre_entrega THEN 
          CASE 
            WHEN EXISTS (
              SELECT 1
              FROM documento_entrega de
              WHERE de.id_proyecto = p.id AND de.id_espacio_entrega = ee.id
            ) THEN 'en_proceso'
            ELSE 'pendiente'
          END
        WHEN NOT EXISTS (
          SELECT 1
          FROM documento_entrega de
          WHERE de.id_proyecto = p.id AND de.id_espacio_entrega = ee.id
        ) AND NOW() > ee.fecha_cierre_entrega THEN 'vencido'
      END AS estado_entrega
    FROM 
      proyecto p
      INNER JOIN espacio_entrega ee ON p.id_modalidad = ee.id_modalidad
      INNER JOIN estado es ON p.id_estado = es.id AND LOWER(es.nombre) = 'en desarrollo'
      INNER JOIN rol r ON ee.id_rol = r.id
      INNER JOIN historial_etapa he ON p.id = he.id_proyecto AND he.anio = ee.anio AND he.periodo = ee.periodo
      INNER JOIN etapa ep ON he.id_etapa = ep.id AND he.id_etapa = ee.id_etapa
    WHERE 
      p.id = $1 AND
      (NOT EXISTS (
        SELECT 1
        FROM documento_entrega de
        WHERE de.id_proyecto = p.id AND de.id_espacio_entrega = ee.id
      )
      OR
        NOW() <= ee.fecha_cierre_entrega)
    ORDER BY ee.fecha_cierre_entrega;`;

    await pool.query(query, [id], (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de las entregas pendientes.' });
      }
      if (result.rows.length === 0) {
        return res.status(203).json({ success: true, message: 'No hay entregas pendientes' });
      }
      return res.status(200).json({ success: true, espacios: result.rows });
    });
  } catch (error) {
    return res.status(502).json({ success: false, message });
  }
};

const obtenerLinkProyecto = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT id, artefactos, documentos FROM link WHERE id = $1`;
    await pool.query(query, [id], (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los links de acceso a los repositorio. Por favor, intente de nuevo más tarde.' });
      }

      if (result.rows.length === 0) {
        return res.status(203).json({ success: true, message: 'No se encontraron los links de Google Drive. Por favor, proporcione los enlaces necesarios.' });
      }
      return res.status(200).json({ success: true, link_artefacto: result.rows[0].artefactos, link_documento: result.rows[0].documentos });
    });
  } catch (error) {
    return res.status(502).json({ success: false, message });
  }
};

const obtenerEntregasRealizadasSinCalificar = async (req, res) => {
  try {
    const proyecto_id = req.params.id;
    const query = `SELECT 
    ROW_NUMBER() OVER (ORDER BY ee.id) AS id,
    de.id AS id_doc_entrega,
    ee.id AS id_espacio_entrega,
    ee.nombre AS nombre_espacio_entrega,
    r.nombre AS nombre_rol,
    ee.fecha_apertura_entrega,
    ee.fecha_cierre_entrega,
    ee.fecha_apertura_calificacion,
    ee.fecha_cierre_calificacion,        
    p.nombre AS nombre_proyecto,
    ee.descripcion,
    ee.anio,
    ee.periodo,
    ep.nombre AS etapa,
    ur.id AS id_usuario_rol,
    u.nombre AS evaluador,
    de.fecha_entrega,
    de.id AS id_doc_entrega
FROM 
    documento_entrega de
INNER JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id
INNER JOIN proyecto p ON de.id_proyecto = p.id
INNER JOIN historial_etapa he ON p.id = he.id_proyecto AND he.anio = ee.anio AND he.periodo = ee.periodo
INNER JOIN etapa ep ON he.id_etapa = ep.id AND  he.id_etapa = ee.id_etapa
INNER JOIN rol r ON ee.id_rol = r.id 
LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ee.id_rol = ur.id_rol AND ur.estado = TRUE
LEFT JOIN usuario u ON ur.id_usuario = u.id
WHERE 
    de.id NOT IN (
        SELECT id_doc_entrega 
        FROM calificacion 
        WHERE id_usuario_rol = ur.id
    )
    AND p.id = $1 
ORDER BY 
    de.fecha_entrega     
    `;
    await pool.query(query, [proyecto_id], (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de las entregas pendientes por calificación.' });
      }
      if (result.rows.length === 0) {
        return res.status(203).json({ success: true, message: 'No hay entregas pendientes por calificar.' });
      }
      return res.status(200).json({ success: true, espacios: result.rows });
    });
  } catch (error) {
    return res.status(502).json({ success: false, message });
  }
};

const obtenerEntregasRealizadasCalificadas = async (req, res) => {
  try {
    const proyecto_id = req.params.id;

    const query = `SELECT 
    c.id,
    ee.nombre AS nombre_espacio_entrega,
    ee.fecha_apertura_entrega,
    ee.fecha_cierre_entrega,
    ee.fecha_apertura_calificacion,
    ee.fecha_cierre_calificacion,
    r.nombre AS nombre_rol,
    p.nombre AS nombre_proyecto,
    ee.descripcion,
    ee.anio,
    ee.periodo,
    ep.nombre AS etapa,
    u.nombre AS evaluador,
    de.fecha_entrega,
    de.id AS id_doc_entrega,
    c.fecha_evaluacion,
    c.nota_final
FROM 
    documento_entrega de
    INNER JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id
    INNER JOIN proyecto p ON de.id_proyecto = p.id
    INNER JOIN historial_etapa he ON p.id = he.id_proyecto AND he.anio = ee.anio AND he.periodo = ee.periodo
    INNER JOIN etapa ep ON he.id_etapa = ep.id AND  he.id_etapa = ee.id_etapa
    INNER JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ee.id_rol = ur.id_rol
    INNER JOIN usuario u ON ur.id_usuario = u.id
    INNER JOIN rol r ON ur.id_rol = r.id 
    INNER JOIN calificacion c ON de.id = c.id_doc_entrega AND ur.id = c.id_usuario_rol
WHERE p.id = $1   
ORDER BY 
    de.fecha_entrega
     `;

    await pool.query(query, [proyecto_id], (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de las entregas calificadas.' });
      }
      if (result.rows.length === 0) {
        return res.status(203).json({ success: true, message: 'No se han calificado entregas.' });
      }
      return res.status(200).json({ success: true, espacios: result.rows });
    });
  } catch (error) {
    return res.status(502).json({ success: false, message });
  }
};

const obtenerReunionesPendientes = async (req, res) => {
  const { id } = req.params;
  try {
    const updateQuery = `UPDATE reunion SET id_estado=(SELECT id FROM estado_reunion WHERE nombre = 'Completa') WHERE id_proyecto=$1 AND fecha<CURRENT_TIMESTAMP AND id_estado!=(SELECT id FROM estado_reunion WHERE nombre = 'Cancelada')`;
    const updateValues = [id];
    await pool.query(updateQuery, updateValues);

    // Obtener reunion actualizadas
    const selectQuery = `SELECT r.id, r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, r.enlace, r.justificacion,
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
FROM reunion r JOIN estado_reunion e ON r.id_estado = e.id LEFT JOIN invitados inv ON inv.id_reunion = r.id LEFT JOIN usuario_rol ur ON inv.id_usuario_rol = ur.id
WHERE r.id_proyecto = $1 AND e.nombre = 'Pendiente' GROUP BY r.id, r.nombre, r.fecha, r.enlace ORDER BY fecha ASC;`;
    const selectValues = [id];
    const result = await pool.query(selectQuery, selectValues);
    const pendientes = result.rows;

    if (pendientes.length > 0) {
      return res.json({ success: true, pendientes });
    } else {
      return res.status(203).json({ success: true, message: 'No hay reuniones pendientes' });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerReunionesCompletas = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT r.id, r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, r.enlace, r.justificacion, ac.id AS id_acta,
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
FROM reunion r JOIN estado_reunion e ON r.id_estado = e.id LEFT JOIN invitados inv ON inv.id_reunion = r.id LEFT JOIN usuario_rol ur ON inv.id_usuario_rol = ur.id LEFT JOIN acta_reunion ac ON ac.id_reunion = r.id
WHERE r.id_proyecto = $2 AND e.nombre = $1 GROUP BY r.id, r.nombre, r.fecha, r.enlace, ac.id ORDER BY fecha ASC;`, ['Completa', id])
    const completas = result.rows
    if (result.rowCount > 0) {
      return res.json({ success: true, completas });
    } else {
      return res.status(203).json({ success: true, message: 'No hay reuniones completas' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerReunionesCanceladas = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT r.id, r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, r.enlace, r.justificacion,
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
FROM reunion r JOIN estado_reunion e ON r.id_estado = e.id LEFT JOIN invitados inv ON inv.id_reunion = r.id LEFT JOIN usuario_rol ur ON inv.id_usuario_rol = ur.id
WHERE r.id_proyecto = $2 AND e.nombre = $1 GROUP BY r.id, r.nombre, r.fecha, r.enlace ORDER BY fecha ASC;`, ['Cancelada', id])
    const canceladas = result.rows
    if (result.rowCount > 0) {
      return res.json({ success: true, canceladas });
    } else {
      return res.status(203).json({ success: true, message: 'No hay reuniones canceladas' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerSolicitudesPendientes = async (req, res) => {

  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.id AS id_proyecto, TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_aprobado_director 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN historial_etapa he ON p.id = he.id_proyecto
      JOIN etapa e ON he.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  
      WHERE ad.aprobado = true AND ac.id IS NULL AND p.id = $1 
      AND he.fecha_cambio = (
        SELECT MAX(fecha_cambio)
        FROM historial_etapa
        WHERE id_proyecto = p.id
      )  
      UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.id AS id_proyecto, NULL AS fecha_aprobado_director 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN historial_etapa he ON p.id = he.id_proyecto
      JOIN etapa e ON he.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
      WHERE s.creado_proyecto = false AND ac.id IS NULL AND p.id = $1
      AND he.fecha_cambio = (
        SELECT MAX(fecha_cambio)
        FROM historial_etapa
        WHERE id_proyecto = p.id
      )
      UNION 
      SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud,  p.id AS id_proyecto, NULL AS fecha_aprobado_director 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN historial_etapa he ON p.id = he.id_proyecto
      JOIN etapa e ON he.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      LEFT JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
      WHERE s.creado_proyecto = true AND ad.id IS NULL AND p.id = $1
      AND he.fecha_cambio = (
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

const obtenerSolicitudesAprobadas = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud,  p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  
      WHERE ad.aprobado = true AND ac.aprobado = true AND p.id = $1
      AND he.fecha_cambio = (
        SELECT MAX(fecha_cambio)
        FROM historial_etapa
        WHERE id_proyecto = p.id
      )
  
      UNION 
  
      SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud,  p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
      WHERE s.creado_proyecto = false AND ac.aprobado = true AND p.id = $1
      AND he.fecha_cambio = (
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

const obtenerSolicitudesRechazadas = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud,  p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  
      WHERE ad.aprobado = true AND ac.aprobado = false AND p.id = $1
      AND he.fecha_cambio = (
        SELECT MAX(fecha_cambio)
        FROM historial_etapa
        WHERE id_proyecto = p.id
      )
      UNION 
      SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud,  p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
      WHERE s.creado_proyecto = false AND ac.aprobado = false AND p.id = $1
      AND he.fecha_cambio = (
        SELECT MAX(fecha_cambio)
        FROM historial_etapa
        WHERE id_proyecto = p.id
      )
      UNION 
      SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud,  p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_director, NULL AS fecha_rechazado_comite 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
      WHERE ad.aprobado = false AND p.id = $1
      AND he.fecha_cambio = (
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

const obtenerTipoSolicitud = async (req, res) => {
  try {
    const query = 'SELECT * FROM tipo_solicitud';
    await pool.query(query, (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message });
      }
      const tipos = result.rows;
      if (tipos.length === 0) {
        return res.status(203).json({ success: true, message: 'No hay tipos de solicitudes.' });
      }
      return res.status(200).json({ success: true, message: 'Tipos obtenidos correctamente', tipos });
    });
  } catch (error) {
    return res.status(502).json({ success: false, message });
  }
};

const guardarSolicitud = async (req, res) => {
  try {
    const { id_tipo_solicitud, justificacion, id_proyecto, creado_proyecto } = req.body;

    const query = 'INSERT INTO solicitud (justificacion, id_tipo_solicitud, id_proyecto, creado_proyecto) VALUES ($1, $2, $3, $4) RETURNING id';
    const values = [justificacion, id_tipo_solicitud, id_proyecto, creado_proyecto];
    await pool.query(query, values, async (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error al obtener la información de los tipos. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
      }
      if (result.rowCount > 0) {

        // Enviar correo
        const resultProyecto = await pool.query(`SELECT nombre FROM proyecto WHERE id=$1`, [id_proyecto]);
        const nombre_proyecto = resultProyecto.rows[0].nombre;

        const resultUsuario = await pool.query(`SELECT u.correo FROM usuario u
        JOIN usuario_rol ur ON ur.id_usuario = u.id
        WHERE ur.id_rol = 1 AND ur.estado = true AND ur.id_proyecto = $1`, [id_proyecto]);
        const infoUsuario = resultUsuario.rows[0];

        const resultCorreos = await pool.query(`SELECT e.correo, e.nombre FROM estudiante e
        JOIN estudiante_proyecto ep ON ep.id_estudiante = e.id
        JOIN proyecto pr ON pr.id = ep.id_proyecto
        WHERE pr.id = $1 AND ep.estado = true`, [id_proyecto]);
        const infoCorreos = resultCorreos.rows;

        const resultTipo = await pool.query(`SELECT nombre FROM tipo_solicitud WHERE id=$1`, [id_tipo_solicitud]);
        const nombre_tipo = resultTipo.rows[0].nombre;

        await nuevaSolicitudProyecto(nombre_tipo, justificacion, nombre_proyecto, infoUsuario.correo, infoCorreos)

        return res.status(200).json({ success: true, message: 'La solicitud ha sido creada correctamente y los involucrados han sido notificados.' });
      } else {
        return res.status(203).json({ success: true, message: 'La solicitud no se pudo crear exitosamente.' })
      }
    });
  } catch (error) {
    return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error en la conexión con la base de datos. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
  }
};

const guardarInfoActa = async (req, res) => {
  const { id_reunion, objetivos, resultados, tareas, compromisos } = req.body;
  try {
    const query = `
        INSERT INTO public.acta_reunion(descrip_obj, resultados_reu, tareas_ant, compromisos, id_reunion)
        VALUES ($2, $3, $4, $5, $1)
      `;
    const values = [id_reunion, objetivos, resultados, tareas, compromisos];
    await pool.query(query, values);
    res.status(200).json({ success: true, message: 'Se ha guardado la información del acta de reunión exitosamente.' });

  } catch (error) {
    res.status(502).json({ success: false, message: 'Ha ocurrido un error al guardar el acta. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
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

const guardarLink = async (req, res) => {
  const { id, tipol, link } = req.body;
  try {
    const result = await pool.query('SELECT id, artefactos, documentos FROM public.link WHERE id = $1;', [id]);
    if (result.rowCount === 0) {
      const columnToSet = tipol === 'A' ? 'artefactos' : 'documentos';
      const query = `
        INSERT INTO public.link (id, ${columnToSet})
        VALUES ($1, $2);
      `;
      const values = [id, link];
      await pool.query(query, values);

      const resultCorreos = await pool.query(`SELECT e.correo, e.nombre FROM estudiante e
      JOIN estudiante_proyecto ep ON ep.id_estudiante = e.id
      JOIN proyecto pr ON pr.id = ep.id_proyecto
      WHERE pr.id = $1`, [id]);
      const infoCorreos = resultCorreos.rows;
      await agregarLink(tipol, link, infoCorreos);

      res.status(200).json({ success: true, message: 'Se ha guardado exitosamente el link y los estudiantes han sido notificados.' });

    } else {
      if (tipol === 'A' || tipol === 'D') {
        const columnToSet = tipol === 'A' ? 'artefactos' : 'documentos';
        const query = `
          UPDATE public.link
          SET ${columnToSet} = $2
          WHERE id = $1;
        `;
        const values = [id, link];
        await pool.query(query, values);

        const resultCorreos = await pool.query(`SELECT e.correo, e.nombre FROM estudiante e
        JOIN estudiante_proyecto ep ON ep.id_estudiante = e.id
        JOIN proyecto pr ON pr.id = ep.id_proyecto
        WHERE pr.id = $1`, [id]);
        const infoCorreos = resultCorreos.rows;
        await agregarLink(tipol, link, infoCorreos);

        res.status(200).json({ success: true, message: 'Se ha guardado exitosamente el link y los estudiantes han sido notificados.' });

      } else {
        return res.status(203).json({ success: false, message: 'Ha ingresado un valor inválido de link.' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Ha ocurrido un error al guardar el link. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerInfoDirector = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT u.id, u.nombre, u.correo FROM usuario u WHERE u.id IN (SELECT id_usuario FROM usuario_rol WHERE id_proyecto=$1 AND estado=true AND id_rol=1) AND u.estado=true', [id]);
    const director = result.rows[0];
    if (result.rowCount > 0) {
      return res.status(200).json({ success: true, director });
    } else {
      return res.status(203).json({ success: true, message: 'No hay un director asigando a este proyecto. Si cree que esto es un error, póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerInfoLector = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT u.id, u.nombre, u.correo FROM usuario u WHERE u.id IN (SELECT id_usuario FROM usuario_rol WHERE id_proyecto=$1 AND estado=true AND id_rol=2) AND u.estado=true', [id]);
    const lector = result.rows[0];
    if (result.rowCount > 0) {
      return res.status(200).json({ success: true, lector });
    } else {
      return res.status(203).json({ success: true, message: 'No hay un lector asigando a este proyecto. Si cree que esto es un error, póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerInfoJurado = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT u.id, u.nombre, u.correo FROM usuario u WHERE u.id IN (SELECT id_usuario FROM usuario_rol WHERE id_proyecto=$1 AND estado=true AND id_rol=3) AND u.estado=true', [id]);
    const jurado = result.rows;
    if (result.rowCount > 0) {
      return res.json({ success: true, jurado });
    } else {
      return res.status(203).json({ success: true, message: 'No hay jurado(s) asigando(s) a este proyecto. Si cree que esto es un error, póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerInfoCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM cliente WHERE id_proyecto =$1', [id]);
    const cliente = result.rows[0];
    if (result.rowCount > 0) {
      return res.json({ success: true, cliente });
    } else {
      return res.status(203).json({ success: true, message: 'No hay un cliente asigando a este proyecto. Si cree que esto es un error, póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
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

const editarReunion = async (req, res) => {
  const { id, id_proyecto, nombre, fecha, enlace, director, lector, cliente, jurado, added, removed } = req.body;
  const roleIds = {
    "director": director.id,
    "lector": lector.id,
    "cliente": cliente.id,
  };
  const rolID = {
    "director": 1,
    "lector": 2,
  };

  try {
    await pool.query('BEGIN');
    await pool.query(`UPDATE reunion SET nombre=$2, fecha=TO_TIMESTAMP($3, 'DD-MM-YYYY HH24:MI'), enlace=$4 WHERE id=$1`, [id, nombre, fecha, enlace]);

    // Added
    for (let index = 0; index < added.length; index++) {
      const roleName = added[index];
      if (roleName in roleIds) {
        if (roleName === 'cliente') {
          await pool.query(`INSERT INTO invitados(id_reunion, id_cliente) VALUES ($1, $2)`, [id, roleIds[roleName]]);
        } else {
          await pool.query(`INSERT INTO invitados(id_reunion, id_usuario_rol) VALUES ($1, (SELECT id FROM usuario_rol WHERE id_usuario=$2 AND id_rol=$3 AND estado=true AND id_proyecto=$4))`, [id, roleIds[roleName], rolID[roleName], id_proyecto]);
        }

        // Verificar si es jurado
      } else if (roleName.startsWith("jurado")) {
        const juradoIndex = parseInt(roleName.split(" ")[1]);
        await pool.query(`INSERT INTO invitados(id_reunion, id_usuario_rol) VALUES ($1, (SELECT id FROM usuario_rol WHERE id_usuario=$2 AND id_rol=3 AND estado=true))`, [id, jurado[juradoIndex].id]);
      }
    }

    // Removed
    for (let index = 0; index < removed.length; index++) {
      const roleName = removed[index];
      if (roleName in roleIds) {
        if (roleName === 'cliente') {
          await pool.query(`DELETE FROM invitados WHERE id_reunion=$1 AND id_cliente=$2`, [id, roleIds[roleName]]);
        } else {
          await pool.query(`DELETE FROM invitados WHERE id_reunion=$1 AND id_usuario_rol = (SELECT id FROM usuario_rol WHERE id_usuario=$2 AND id_rol=$3 AND estado=true AND id_proyecto=$4)`, [id, roleIds[roleName], rolID[roleName], id_proyecto]);
        }

        // Verificar si es jurado
      } else if (roleName.startsWith("jurado")) {
        const juradoIndex = parseInt(roleName.split(" ")[1]);
        await pool.query(`DELETE FROM invitados WHERE id_reunion=$1 AND id_usuario_rol=(SELECT id FROM usuario_rol WHERE id_usuario=$2 AND id_rol=3 AND estado=true)`, [id, jurado[juradoIndex].id]);
      }
    }

    // Enviar correo
    const resultProyecto = await pool.query(`SELECT pr.nombre FROM proyecto pr JOIN reunion r ON r.id_proyecto = pr.id WHERE r.id = $1`, [id]);
    const nombre_proyecto = resultProyecto.rows[0].nombre;

    const resultCorreos = await pool.query(`SELECT e.correo, e.nombre FROM estudiante e JOIN estudiante_proyecto ep ON ep.id_estudiante = e.id JOIN proyecto pr ON pr.id = ep.id_proyecto JOIN reunion r ON r.id_proyecto = pr.id WHERE r.id = $1 AND ep.estado = true`, [id]);
    const infoCorreos = resultCorreos.rows;

    const resultInvitados = await pool.query(`SELECT COALESCE(c.correo_repr, u.correo) AS correo, COALESCE(c.nombre_repr, u.nombre) AS nombre FROM invitados i LEFT JOIN cliente c ON i.id_cliente = c.id LEFT JOIN usuario_rol ur ON i.id_usuario_rol = ur.id LEFT JOIN usuario u ON ur.id_usuario = u.id LEFT JOIN rol r ON ur.id_rol = r.id WHERE i.id_reunion = $1`, [id]);
    const correosInvitados = resultInvitados.rows;

    await editarReunionProyecto(nombre, fecha, enlace, nombre_proyecto, correosInvitados, infoCorreos);

    await pool.query('COMMIT');
    res.status(200).json({ success: true, message: 'La reunión fue editada exitosamente y los involucrados han sido notificados.' });

  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }

};

const crearReunionInvitados = async (req, res) => {
  const { id, nombre, fecha, enlace, id_proyecto, id_estado, director, lector, cliente, jurado, infoChecked } = req.body;

  const roleIds = { "director": director.id, "lector": lector.id, "cliente": cliente.id };
  const rolID = { "director": 1, "lector": 2 };
  const nameRol = { "director": director.nombre, "lector": lector.nombre };
  const correoRol = { "director": director.correo, "lector": lector.correo };

  try {
    await pool.query('BEGIN');

    // Crear la nueva reunion
    await pool.query(`INSERT INTO reunion(id, nombre, fecha, enlace, id_proyecto, id_estado) VALUES ($1, $2, TO_TIMESTAMP($3, 'DD-MM-YYYY HH24:MI'), $4, $5, $6)`, [id, nombre, fecha, enlace, id_proyecto, id_estado]);

    // Agregar invitados
    const correosInvitados = [];
    const nombreInvitados = [];

    for (let index = 0; index < infoChecked.length; index++) {
      const roleName = infoChecked[index];
      // Verificar si es director, cliente o lector
      if (roleName in roleIds) {
        if (roleName === 'cliente') {
          await pool.query(`INSERT INTO invitados(id_reunion, id_cliente) VALUES ($1, $2)`, [id, roleIds[roleName]]);

          // Correo
          correosInvitados.push(cliente.correo_repr);
          nombreInvitados.push(cliente.nombre_repr)

        } else {
          await pool.query(`INSERT INTO invitados(id_reunion, id_usuario_rol) VALUES ($1, (SELECT id FROM usuario_rol WHERE id_usuario=$2 AND id_rol=$3 AND estado=true AND id_proyecto=$4))`, [id, roleIds[roleName], rolID[roleName], id_proyecto]);

          // Correo
          correosInvitados.push(correoRol[roleName]);
          nombreInvitados.push(nameRol[roleName]);
        }

        // Verificar si es jurado
      } else if (roleName.startsWith("jurado")) {

        const juradoIndex = parseInt(roleName.split(" ")[1]);
        await pool.query(`INSERT INTO invitados(id_reunion, id_usuario_rol) VALUES ($1, (SELECT id FROM usuario_rol WHERE id_usuario=$2 AND id_rol=3 AND estado=true AND id_proyecto=$3))`, [id, jurado[juradoIndex].id, id_proyecto]);

        correosInvitados.push(jurado[juradoIndex].correo);
        nombreInvitados.push(jurado[juradoIndex].nombre);
      }
    }

    // Enviar correo
    const resultProyecto = await pool.query(`SELECT nombre FROM proyecto WHERE id=$1`, [id_proyecto]);
    const nombre_proyecto = resultProyecto.rows[0].nombre;

    const resultCorreos = await pool.query(`SELECT correo, nombre FROM estudiante e
    JOIN estudiante_proyecto ep ON ep.id_estudiante = e.id
    WHERE ep.estado = true AND ep.id_proyecto = $1`, [id_proyecto]);
    const infoCorreos = resultCorreos.rows;

    await nuevaReunionEstudiantes(nombre, fecha, enlace, nombre_proyecto, nombreInvitados, correosInvitados, infoCorreos);

    await pool.query('COMMIT');
    res.status(201).json({ success: true, message: 'La reunión fue creada exitosamente y los invitados han sido notificados.' });

  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
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

const cancelarReunion = async (req, res) => {
  const { id_reunion, id_proyecto, justificacion } = req.body;
  try {

    // Cancelar reunión
    const query = `UPDATE reunion SET id_estado=(SELECT id FROM estado_reunion WHERE nombre = 'Cancelada'), justificacion=$3 WHERE id=$1 AND id_proyecto=$2`;
    const values = [id_reunion, id_proyecto, justificacion];
    await pool.query(query, values);

    // Enviar correo
    const resultProyecto = await pool.query(`SELECT pr.nombre FROM proyecto pr JOIN reunion r ON r.id_proyecto = pr.id WHERE r.id = $1`, [id_reunion]);
    const nombre_proyecto = resultProyecto.rows[0].nombre;

    const resultCorreos = await pool.query(`SELECT e.correo, e.nombre FROM estudiante e JOIN estudiante_proyecto ep ON ep.id_estudiante = e.id JOIN proyecto pr ON pr.id = ep.id_proyecto JOIN reunion r ON r.id_proyecto = pr.id WHERE r.id = $1 AND ep.estado = true`, [id_reunion]);
    const infoCorreos = resultCorreos.rows;

    const resultInvitados = await pool.query(`SELECT COALESCE(c.correo_repr, u.correo) AS correo FROM invitados i LEFT JOIN cliente c ON i.id_cliente = c.id LEFT JOIN usuario_rol ur ON i.id_usuario_rol = ur.id LEFT JOIN usuario u ON ur.id_usuario = u.id LEFT JOIN rol r ON ur.id_rol = r.id WHERE i.id_reunion = $1`, [id_reunion]);
    const correosInvitados = resultInvitados.rows;

    const resultReunion = await pool.query(`SELECT nombre, TO_CHAR(fecha, 'DD-MM-YYYY HH24:MI') AS fecha, enlace FROM reunion where id = $1`, [id_reunion]);
    const infoReunion = resultReunion.rows[0];

    await cancelarReunionProyecto(infoReunion.nombre, infoReunion.fecha, infoReunion.enlace, nombre_proyecto, correosInvitados, infoCorreos, justificacion);

    res.status(200).json({ success: true, message: 'La reunión ha sido cancelada con éxito y los involucrados han sido notificados.' });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'No se pudo completar la cancelación de la reunión.' });
  }
};

module.exports = {
  obtenerProyecto, obtenerEntregasRealizadasCalificadas, obtenerEntregasRealizadasSinCalificar, obtenerEntregasPendientes,
  obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas,
  obtenerSolicitudesPendientes, obtenerSolicitudesRechazadas, obtenerSolicitudesAprobadas,
  cancelarReunion, editarReunion, obtenerInfoCliente, obtenerInvitados,
  obtenerTipoSolicitud, guardarSolicitud, ultIdReunion, crearReunionInvitados,
  guardarInfoActa, obtenerInfoActa, guardarLink, obtenerLinkProyecto, obtenerInfoJurado, obtenerInfoDirector, obtenerInfoLector
}
