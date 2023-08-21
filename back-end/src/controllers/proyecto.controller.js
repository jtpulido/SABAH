const pool = require('../database')
let proyectos = "";
let director = "";
let jurados = "";
let estudiantes = ""
let lector = "";

const obtenerProyecto = async (req, res) => {
  const id = req.params.id;
  try {
    const error = "No se puedo encontrar toda la información relacionada al proyecto. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda."
    const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, m.acronimo as acronimo, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE p.id = $1', [id])
    const proyecto = result.rows
    if (result.rowCount === 1) {
      const result_director = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('director') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
      const usuario_director = result_director.rows[0]
      const result_lector = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('lector') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
      const info_lector = result_lector.rowCount > 0 ? { "existe_lector": true, "nombre": result_lector.rows[0].nombre } : { "existe_lector": false };
      const result_jurado = await pool.query("SELECT u.nombre, u.id FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('jurado')AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
      const info_jurado = result_jurado.rowCount > 0 ? { "existe_jurado": true, "jurados": result_jurado.rows } : { "existe_jurado": false };
      const result_estudiantes = await pool.query('SELECT e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = true', [id])
      proyectos = proyecto[0];
      director = usuario_director;
      jurados = info_jurado;
      estudiantes = result_estudiantes.rows;
      lector = info_lector;
      return res.json({ success: true, proyecto: proyecto[0], director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows });

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
    const query = `SELECT 
    ROW_NUMBER() OVER (ORDER BY ee.id) AS id,
    ee.id AS id_espacio_entrega,
    ee.nombre AS nombre_espacio_entrega,
    r.nombre AS nombre_rol,
    p.id AS id_proyecto,
    p.nombre AS nombre_proyecto,
    ee.descripcion,
    ee.fecha_apertura,
    ee.fecha_cierre
FROM 
    proyecto p
INNER JOIN espacio_entrega ee ON p.id_modalidad = ee.id_modalidad AND p.id_etapa = ee.id_etapa
INNER JOIN rol r ON ee.id_rol = r.id
WHERE 
    NOT EXISTS (
        SELECT 1
        FROM documento_entrega de
        WHERE de.id_proyecto = p.id AND de.id_espacio_entrega = ee.id
    )
    AND p.id = $1
ORDER BY 
    ee.fecha_cierre;
`
    await pool.query(query, [id], (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
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
        return res.status(203).json({ success: true, message: 'No se encontraron los links, debe agregarlos.' });
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
    ee.fecha_apertura,
    ee.fecha_cierre,
    p.nombre AS nombre_proyecto,
    ee.descripcion,
    ur.id AS id_usuario_rol,
    u.nombre AS evaluador,
    de.fecha_entrega,
    de.id AS id_doc_entrega
FROM 
    documento_entrega de
INNER JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id
INNER JOIN proyecto p ON de.id_proyecto = p.id
INNER JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ee.id_rol = ur.id_rol 
INNER JOIN usuario u ON ur.id_usuario = u.id 
INNER JOIN rol r ON ur.id_rol = r.id 
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
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
      }

      if (result.rows.length === 0) {
        return res.status(203).json({ success: true, message: 'No se han realizado entregas.' });
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
    ee.fecha_apertura,
    ee.fecha_cierre,
    r.nombre AS nombre_rol,
    p.nombre AS nombre_proyecto,
    ee.descripcion,
    u.nombre AS evaluador,
    de.fecha_entrega,
    de.id AS id_doc_entrega,
    c.fecha_evaluacion,
    c.nota_final
FROM 
    documento_entrega de
    INNER JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id
    INNER JOIN proyecto p ON de.id_proyecto = p.id
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
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
      }

      if (result.rows.length === 0) {
        return res.status(203).json({ success: true, message: 'No se han realizado entregas.' });
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
WHERE r.id_proyecto = $2 AND e.nombre = $1 GROUP BY r.id, r.nombre, r.fecha, r.enlace ORDER BY fecha ASC;`, ['Completa', id])
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
      JOIN etapa e ON p.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  
      WHERE ad.aprobado = true AND ac.id IS NULL AND p.id = $1
  
      UNION 
  
      SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.id AS id_proyecto, NULL AS fecha_aprobado_director 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN etapa e ON p.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
      WHERE s.creado_proyecto = false AND ac.id IS NULL AND p.id = $1
  
      UNION 
  
      SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud,  p.id AS id_proyecto, NULL AS fecha_aprobado_director 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN etapa e ON p.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      LEFT JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
      WHERE s.creado_proyecto = true AND ad.id IS NULL AND p.id = $1`, [id]);
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
      JOIN etapa e ON p.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  
      WHERE ad.aprobado = true AND ac.aprobado = true AND p.id = $1
  
      UNION 
  
      SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud,  p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN etapa e ON p.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
      WHERE s.creado_proyecto = false AND ac.aprobado = true AND p.id = $1`, [id]);
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
      JOIN etapa e ON p.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud  
      WHERE ad.aprobado = true AND ac.aprobado = false AND p.id = $1
      UNION 
      SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud,  p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN etapa e ON p.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
      WHERE s.creado_proyecto = false AND ac.aprobado = false AND p.id = $1
      UNION 
      SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud,  p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_director, NULL AS fecha_rechazado_comite 
      FROM solicitud s 
      JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
      JOIN proyecto p ON s.id_proyecto = p.id 
      JOIN etapa e ON p.id_etapa = e.id 
      JOIN estado es ON p.id_estado = es.id 
      JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
      WHERE ad.aprobado = false AND p.id = $1`, [id]);
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

const guardarReunion = async (req, res) => {

  const { nombre, fecha, invitados, enlace, id_proyecto, id_estado } = req.body;
  try {
    const query = `
        INSERT INTO public.reunion(nombre, fecha, invitados, enlace, id_proyecto, id_estado)
        VALUES ( $1, $2, $3, $4, $5, $6)
      `;
    const values = [nombre, fecha, invitados, enlace, id_proyecto, id_estado];
    await pool.query(query, values);

    res.status(200).json({ message: 'Reunión guardada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la reunión' });
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
      return res.status(203).json({ success: false, message: 'No hay reuniones' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }

}

const cancelarReunion = async (req, res) => {
  const { id_reunion, id_proyecto, justificacion } = req.body;
  try {
    const query = `UPDATE reunion SET id_estado=(SELECT id FROM estado_reunion WHERE nombre = 'Cancelada'), justificacion=$3 WHERE id=$1 AND id_proyecto=$2`;
    const values = [id_reunion, id_proyecto, justificacion];
    await pool.query(query, values);
    res.status(200).json({ success: true, message: 'La reunión ha sido cancelada con éxito.' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'No se pudo completar la cancelación de la reunión.' });
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

const guardarInfoActa = async (req, res) => {

  const { id_reunion, objetivos, resultados, tareas, compromisos } = req.body;

  try {
    // Ejemplo usando el paquete "pg" para ejecutar la consulta SQL

    const query = `
        INSERT INTO public.acta_reunion(
            id, descrip_obj, resultados_reu, tareas_ant, compromisos)
        VALUES ( $1, $2, $3, $4, $5 )
      `;
    const values = [id_reunion, objetivos, resultados, tareas, compromisos];

    // Ejecutar la consulta SQL usando el pool de conexiones de PostgreSQL
    await pool.query(query, values);

    res.status(200).json({ message: 'Acta guardada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el acta' });
  }
};
const obtenerInfoActa = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT t1.fecha, t1.invitados, t1.nombre, t2.compromisos, t2.descrip_obj, t2.tareas_ant, t2.resultados_reu FROM public.reunion t1, public.acta_reunion t2  WHERE t1.id = $1 AND t2.id = $1', [id]);
    const acta = result.rows
    if (result.rowCount > 0) {
      return res.json({ success: true, acta })
    } else {
      return res.status(203).json({ success: false, message: 'No hay actas' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const generarPDF = async (req, res) => {
  try {
    const { fecha, invitados, compromisos, objetivos, tareas, nombre } = req.body;
    const PDFDocument = require('pdfkit');
    const path = require('path');
    const doc = new PDFDocument();

    const tituloParte1 = 'FACULTAD DE INGENIERÍA\nPROGRAMA INGENIERÍA DE SISTEMAS\nCOMITÉ OPCIONES DE GRADO';
    const tituloParte2 = 'FORMATO REUNIONES REALIMENTACIÓN PROPUESTAS DE GRADO';
    const tituloParte3 = 'OPCIONES DESARROLLO TECNOLÓGICO Y PROYECTO DE GRADO';

    const imagePath = path.join(__dirname, 'Logo.png');

    doc
      .image(imagePath, 50, 50, { width: 100 })
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(tituloParte1, { align: 'center' })
      .moveDown(0)
      .text(tituloParte2, { align: 'center' })
      .moveDown(0)
      .font('Helvetica')
      .fontSize(10)
      .text(tituloParte3, { align: 'center' })
      .moveDown(1);


    const asistentes = [];


    doc.font('Helvetica-Bold').fontSize(10).text('TÍTULO PROPUESTA: ', { continued: true })
      .font('Helvetica').text(proyectos.nombre, { continued: false, align: 'left' });
    doc.font('Helvetica-Bold').fontSize(10).text('OPCIÓN DE GRADO: ', { continued: true })
      .font('Helvetica').text(proyectos.modalidad, { continued: false, align: 'left' });
    doc.font('Helvetica-Bold').fontSize(10).text('CÓDIGO ASIGNADO A PROPUESTA: ', { continued: true })
      .font('Helvetica').text(proyectos.codigo, { continued: false, align: 'left' })
      .moveDown(1);


    doc.font('Helvetica-Bold').fontSize(10).text('ESTUDIANTES', { align: 'left' });
    estudiantes.forEach((estudiante) => {
      doc.font('Helvetica').fontSize(10).text(`${estudiante.nombre} - ${estudiante.num_identificacion}`, { align: 'left' });
      asistentes.push(estudiante.nombre);
    });
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(10).text('DIRECTOR: ', { continued: true })
      .font('Helvetica').text(director.nombre, { continued: false, align: 'left' })
      .moveDown(1);

    doc.font('Helvetica-Bold').fontSize(11).text(nombre, { continued: false, align: 'center' })
      .moveDown(1);

    const tableData = [
      [{ text: '1.', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'FECHA Y HORA', font: 'Helvetica-Bold', fontSize: 10 }],
      [{ text: '', font: 'Helvetica-Bold', fontSize: 12 }, { text: fecha, font: 'Helvetica', fontSize: 10 }],
      [{ text: '2.', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'DESCRIPCIÓN DE OBJETIVOS', font: 'Helvetica-Bold', fontSize: 10 }],
      [{ text: '', font: 'Helvetica-Bold', fontSize: 12 }, { text: objetivos, font: 'Helvetica', fontSize: 10 }],
      [{ text: '3.', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'RESULTADOS DE REUNIÓN', font: 'Helvetica-Bold', fontSize: 10 }],
      [{ text: '', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'resultados', font: 'Helvetica', fontSize: 10 }],
      [{ text: '4.', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'TAREAS SESION ANTERIOR', font: 'Helvetica-Bold', fontSize: 10 }],
      [{ text: '', font: 'Helvetica-Bold', fontSize: 12 }, { text: tareas, font: 'Helvetica', fontSize: 10 }],
      [{ text: '5.', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'COMPROMISOS', font: 'Helvetica-Bold', fontSize: 10 }],
      [{ text: '', font: 'Helvetica-Bold', fontSize: 12 }, { text: compromisos, font: 'Helvetica', fontSize: 10 }],
      // Agregar más filas de datos aquí...
    ];

    const tableSettings = {
      x: 80,
      y: doc.y, // La posición Y actual del cursor, para que la tabla comience desde este punto
      col1Width: 50, // Ancho de la columna uno (números tipo 1.)
      col2Width: 400, // Ancho de la columna dos (títulos formales)
      rowHeight: 40,
      cellMargin: 5,
    };

    drawTable(doc, tableData, tableSettings);
    doc.moveDown(1);
    doc.addPage();

    doc.font('Helvetica-Bold').fontSize(11).text('FIRMAS ASISTENTES', { continued: false, align: 'center' })
      .moveDown(1);
    doc.font('Helvetica-Bold').fontSize(11).text(invitados, { continued: false, align: 'center' })
      .moveDown(1);
    doc.moveDown(1);


    // Llamamos a la función para agregar las firmas después del contenido previo
    // Llamamos a la función para agregar las firmas después del contenido previo
    const signatureSettings = {
      x: 50,
      y: doc.y, // La posición Y actual del cursor, para que las firmas comiencen desde este punto
      width: 165, // Width of the signature field
      rowHeight: 100, // Height of each row for signatures
      signatureHeight: 40, // Height of the signature field (adjust as needed)
      fontSize: 10,
      signaturesPerRow: 3, // Number of signatures per row
    };

   // if (invitados.includes("director")) {
    //  asistentes.push(director.nombre);
    //}

    //if (invitados.includes("lector")) {
     // asistentes.push(lector);
    //}

    //if(invitados.includes("cliente")){
    // asistentes.push(cliente.nombre);
    //}


    const numberOfSignatureFields = asistentes; // Number of signature fields you want to have
    drawSignatureFields(doc, numberOfSignatureFields, signatureSettings);

    doc.end();
    const buffer = await new Promise((resolve, reject) => {
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    res.setHeader('Content-Disposition', `attachment; filename="${nombre}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);


  } catch (error) {
    console.log(error)
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

function drawTable(doc, table, settings) {
  const { x, y, col1Width, col2Width, rowHeight, cellMargin } = settings;

  doc.font('Helvetica-Bold');

  // Dibujar los bordes externos de la tabla
  doc.rect(x, y, col1Width + col2Width + cellMargin * 2, rowHeight * table.length + cellMargin * 2).stroke();

  // Dibujar los bordes internos de la tabla (columnas)
  doc.lineWidth(2);
  doc.moveTo(x + col1Width, y + cellMargin).lineTo(x + col1Width, y + rowHeight * table.length + cellMargin).stroke();

  // Dibujar los bordes internos de la tabla (filas)
  doc.lineWidth(1);
  for (let i = 1; i < table.length; i++) {
    const yPos = y + i * rowHeight + cellMargin;
    doc.moveTo(x, yPos).lineTo(x + col1Width + col2Width + cellMargin * 2, yPos).stroke();
  }

  doc.text('', x + cellMargin, y + cellMargin);

  table.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const xPos = x + (colIndex === 0 ? 0 : col1Width) + cellMargin;
      const yPos = y + rowIndex * rowHeight + cellMargin + (rowHeight - cell.fontSize) / 2;
      const { text, font, fontSize, align } = cell;

      // Verificar si la primera celda de la fila contiene solo espacios en blanco
      const isFirstCellEmpty = colIndex === 0 && text.trim().length === 0;

      // Desplazar las celdas hacia arriba si la primera celda está vacía
      const verticalOffset = isFirstCellEmpty ? -rowHeight / 4 : 0;

      doc
        .font(font || 'Helvetica')
        .fontSize(fontSize || 12)
        .text(text, xPos, yPos + verticalOffset, { width: colIndex === 0 ? col1Width : col2Width, align: align || (colIndex === 0 ? 'center' : 'left') });
    });
  });
}

function drawSignatureFields(doc, numberOfFields, settings) {
  const { x, y, width, rowHeight, signatureHeight, fontSize, signaturesPerRow } = settings;

  doc.font('Helvetica').fontSize(fontSize);

  for (let i = 0; i < numberOfFields.length; i++) {
    const row = Math.floor(i / signaturesPerRow);
    const col = i % signaturesPerRow;

    const xPos = x + (width + 20) * col; // Añadimos 20 de separación horizontal entre las celdas
    const yPos = y + row * rowHeight;

    doc.font('Helvetica-Bold').fontSize(11).text(numberOfFields[i], xPos + 10, yPos + 50, { width: width - 20, align: 'center' });

    const lineYPos = yPos + signatureHeight;
    const lineLength = width * 0.85; // Ajusta este valor para cambiar la longitud de la línea
    const lineXPos = xPos + (width - lineLength) / 2;
    doc
      .strokeColor('#000000')
      .lineJoin('round')
      .moveTo(lineXPos, lineYPos)
      .lineTo(lineXPos + lineLength, lineYPos)
      .stroke();
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
      } else {
        return res.status(203).json({ success: false, message: 'Valor inválido para tipol' });
      }
    }
    res.status(200).json({ message: 'Link guardado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el link' });
  }
};

const obtenerInfoDirector = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await pool.query('SELECT u.id, u.nombre FROM usuario u WHERE u.id IN (SELECT id_usuario FROM usuario_rol WHERE id_proyecto=$1 AND estado=true AND id_rol=1) AND u.estado=true', [id]);
    const director = result.rows[0];
    if (result.rowCount > 0) {
      return res.json({ success: true, director });
    } else {
      return res.status(404).json({ success: false, message: 'No hay un director asigando a este proyecto. Si cree que esto es un error, póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerInfoLector = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await pool.query('SELECT u.id, u.nombre FROM usuario u WHERE u.id IN (SELECT id_usuario FROM usuario_rol WHERE id_proyecto=$1 AND estado=true AND id_rol=2) AND u.estado=true', [id]);
    const lector = result.rows[0];
    if (result.rowCount > 0) {
      return res.json({ success: true, lector });
    } else {
      return res.status(404).json({ success: false, message: 'No hay un lector asigando a este proyecto. Si cree que esto es un error, póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerInfoJurado = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await pool.query('SELECT u.id, u.nombre FROM usuario u WHERE u.id IN (SELECT id_usuario FROM usuario_rol WHERE id_proyecto=$1 AND estado=true AND id_rol=3) AND u.estado=true', [id]);
    const jurado = result.rows;
    if (result.rowCount > 0) {
      return res.json({ success: true, jurado });
    } else {
      return res.status(404).json({ success: false, message: 'No hay jurado(s) asigando(s) a este proyecto. Si cree que esto es un error, póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerInfoCliente = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await pool.query('SELECT * FROM cliente WHERE id IN (SELECT id_cliente FROM proyecto WHERE id=$1)', [id]);
    const cliente = result.rows[0];
    if (result.rowCount > 0) {
      return res.json({ success: true, cliente });
    } else {
      return res.status(404).json({ success: false, message: 'No hay un cliente asigando a este proyecto. Si cree que esto es un error, póngase en contacto con el administrador del sistema para obtener ayuda.' });
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

    await pool.query('COMMIT');
    res.status(200).json({ success: true, message: 'Reunión editada exitosamente' });

  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }

};

const crearReunionInvitados = async (req, res) => {
  const { id, nombre, fecha, enlace, id_proyecto, id_estado, director, lector, cliente, jurado, infoChecked } = req.body;

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

    // Crear la nueva reunion
    await pool.query(`INSERT INTO reunion(id, nombre, fecha, enlace, id_proyecto, id_estado) VALUES ($1, $2, TO_TIMESTAMP($3, 'DD-MM-YYYY HH24:MI'), $4, $5, $6)`, [id, nombre, fecha, enlace, id_proyecto, id_estado]);

    // Agregar invitados
    for (let index = 0; index < infoChecked.length; index++) {
      const roleName = infoChecked[index];
      // Verificar si es director, cliente o lector
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


module.exports = {
  obtenerProyecto, obtenerEntregasRealizadasCalificadas, obtenerEntregasRealizadasSinCalificar, obtenerEntregasPendientes,
  obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas,
  obtenerSolicitudesPendientes, obtenerSolicitudesRechazadas, obtenerSolicitudesAprobadas, guardarReunion, obtenerReunion,
  cancelarReunion, editarReunion, obtenerInfoCliente, obtenerInvitados,
  obtenerTipoSolicitud, guardarSolicitud, ultIdReunion, crearReunionInvitados,
  guardarInfoActa, generarPDF, obtenerInfoActa, guardarLink, obtenerLinkProyecto, obtenerInfoJurado, obtenerInfoDirector, obtenerInfoLector
}
