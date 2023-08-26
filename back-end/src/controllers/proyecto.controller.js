const pool = require('../database')

const obtenerProyecto = async (req, res) => {
  const id = req.params.id;
  try {
    const error = "No se puedo encontrar toda la información relacionada al proyecto. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda."
    const result = await pool.query(`
            SELECT 
                p.id, 
                p.codigo, 
                p.nombre, 
                he.anio_nuevo as anio,
                he.periodo_nuevo as periodo,
                m.nombre as modalidad, 
                m.acronimo as acronimo, 
                e.nombre as etapa, 
                es.nombre as estado 
            FROM proyecto p 
            JOIN modalidad m ON p.id_modalidad = m.id 
            JOIN historial_etapas he ON p.id_ultimo_historial = he.id
            JOIN etapa e ON he.id_etapa_nueva = e.id
            JOIN estado es ON p.id_estado = es.id 
            WHERE p.id = $1
        `, [id]); const proyecto = result.rows
    if (result.rowCount === 1) {
      const result_director = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('director') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
      const usuario_director = result_director.rows[0]
      const result_lector = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('lector') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
      const info_lector = result_lector.rowCount > 0 ? { "existe_lector": true, "nombre": result_lector.rows[0].nombre } : { "existe_lector": false };
      const result_jurado = await pool.query("SELECT u.nombre, u.id FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('jurado')AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
      const info_jurado = result_jurado.rowCount > 0 ? { "existe_jurado": true, "jurados": result_jurado.rows } : { "existe_jurado": false };
      const result_estudiantes = await pool.query('SELECT e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = true', [id])
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
      ep.nombre AS etapa
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
      INNER JOIN historial_etapas he ON p.id_ultimo_historial = he.id
      INNER JOIN etapa ep ON p.id_etapa = ep.id
    WHERE 
      p.id = $1 AND
      (NOT EXISTS (
        SELECT 1
        FROM documento_entrega de
        WHERE de.id_proyecto = p.id AND de.id_espacio_entrega = ee.id
      )
      OR
        NOW() <= ee.fecha_cierre_entrega) AND
      he.anio_nuevo = ee.anio AND he.periodo_nuevo = ee.periodo
      AND he.id_etapa_nueva = ee.id_etapa
    ORDER BY ee.fecha_cierre_entrega;`;

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
INNER JOIN historial_etapas he ON p.id = he.id_proyecto
INNER JOIN etapa ep ON he.id_etapa = ep.id
INNER JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ee.id_rol = ur.id_rol AND ur.estado = TRUE
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
    INNER JOIN historial_etapas he ON p.id = he.id_proyecto
    INNER JOIN etapa ep ON he.id_etapa = ep.id
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
    const updateQuery = `
        UPDATE reunion
        SET id_estado = 2
        WHERE id_proyecto = $1 AND fecha < CURRENT_DATE AND id_estado != 3;
        `;
    const updateValues = [id];
    await pool.query(updateQuery, updateValues);

    // Obtener reunion actualizadas
    const selectQuery = `
        SELECT r.id, r.nombre, r.fecha, r.invitados, r.enlace
        FROM reunion r
        JOIN estado_reunion e ON r.id_estado = e.id
        WHERE r.id_proyecto = $1 AND e.nombre = 'Pendiente';
        `;
    const selectValues = [id];
    const result = await pool.query(selectQuery, selectValues);
    const pendientes = result.rows;

    if (pendientes.length > 0) {
      return res.json({ success: true, pendientes });
    } else {
      return res.status(203).json({ success: false, message: 'No hay reuniones pendientes' });
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

const obtenerReunionesCompletas = async (req, res) => {

  const { id } = req.params;

  try {
    const result = await pool.query('SELECT r.id, r.nombre, r.fecha, r.invitados, r.enlace FROM reunion r JOIN estado_reunion e ON r.id_estado = e.id WHERE r.id_proyecto = $2 AND e.nombre = $1;', ['Completa', id])
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
    const result = await pool.query('SELECT r.id, r.nombre, r.fecha, r.invitados, r.enlace FROM reunion r JOIN estado_reunion e ON r.id_estado = e.id WHERE r.id_proyecto = $2 AND e.nombre = $1;', ['Cancelada', id])
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

  const { id } = req.body;

  try {
    const query = `
      UPDATE public.reunion
      SET id_estado = 3
      WHERE id = $1
      `;
    const values = [id];
    await pool.query(query, values);

    res.status(200).json({ message: 'Reunión cancelada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar la reunión' });
  }
};

const editarReunion = async (req, res) => {
  const { nombre, fecha, invitados, enlace, id_reunion } = req.body;
  try {
    const query = `
        UPDATE public.reunion
        SET nombre=$1, fecha=$2, invitados=$3, enlace=$4
        WHERE id = $5
      `;
    const values = [nombre, fecha, invitados, enlace, id_reunion];

    // Ejecutar la consulta SQL usando el pool de conexiones de PostgreSQL
    await pool.query(query, values);

    res.status(200).json({ message: 'Reunión editada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar la reunión' });
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
        INSERT INTO public.actasreunion(
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

    const result = await pool.query('SELECT t1.fecha, t1.invitados,t1.nombre, t2.compromisos, t2.descrip_obj, t2.tareas_ant, t2.resultados_reu FROM public.reunion t1, public.actasreunion t2  WHERE t1.id = $1 AND t2.id = $1 ;'
      , [id])
    const acta = result.rows

    if (result.rowCount > 0) {
      return res.json({ success: true, acta })
    } else {
      return res.status(203).json({ success: false, message: 'No hay actas' })
    }
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }

}

const generarPDF = async (req, res) => {
  const { fecha, invitados, compromisos, objetivos, tareas, nombre } = req.body;
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  try {


    const doc = new PDFDocument();

    // Agrega contenido al PDF
    doc.text("");

    const tableData = [
      ['Fecha', fecha],
      ['invitados', invitados],
      ['Compromisos', compromisos],
      ['Objetivos', objetivos],
      ['Tareas', tareas],
      ['Nombre', nombre]
    ];

    const table = {
      headers: ['Nombre', 'Edad'],
      rows: tableData
    };

    doc.moveDown();
    drawTable(doc, table, {
      x: 50,
      y: doc.y,
      width: 200,
      height: 0,
      cellMargin: 10
    });

    // Guarda el archivo en el sistema de archivos
    const outputPath = nombre + '.pdf';
    doc.pipe(fs.createWriteStream(outputPath));
    doc.end();

    return outputPath;
  } catch (error) {
    res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
  }
};

function drawTable(doc, table, settings) {
  const startX = settings.x;
  const startY = settings.y;
  const marginCell = settings.cellMargin || 0;

  const columnCount = table.headers.length;
  const columnWidth = settings.width / columnCount;
  const rowHeight = settings.rowHeight || 20;
  const pageHeight = doc.page.height;

  doc.font('Helvetica-Bold');

  // Dibuja los encabezados de la tabla
  doc.fillColor('black');
  doc.fontSize(12);

  let currentY = startY;
  table.headers.forEach((header, columnIndex) => {
    const currentX = startX + columnIndex * columnWidth;
    doc.text(header, currentX, currentY, { width: columnWidth, align: 'left' });
  });

  // Dibuja las filas de la tabla
  doc.font('Helvetica');
  doc.fontSize(10);

  table.rows.forEach((row, rowIndex) => {
    currentY += rowHeight;
    let rowText = '';
    row.forEach((cell, cellIndex) => {
      const currentX = startX + cellIndex * columnWidth;
      doc.text(cell, currentX, currentY, { width: columnWidth - marginCell, align: 'left' });
    });
  });

  // Calcula la altura de la tabla
  const tableHeight = currentY - startY + rowHeight;
  if (tableHeight > settings.height) {
    doc.addPage();
  }
}

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


module.exports = {
  obtenerProyecto, obtenerEntregasRealizadasCalificadas, obtenerEntregasRealizadasSinCalificar, obtenerEntregasPendientes,
  obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas,
  obtenerSolicitudesPendientes, obtenerSolicitudesRechazadas, obtenerSolicitudesAprobadas, guardarReunion, obtenerReunion,
  cancelarReunion, editarReunion,
  obtenerTipoSolicitud, guardarSolicitud,
  guardarInfoActa, generarPDF, obtenerInfoActa, guardarLink, obtenerLinkProyecto
}
