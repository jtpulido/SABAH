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

    const query = `SELECT e.id, e.nombre, e.descripcion, e.fecha_apertura, e.fecha_cierre, r.nombre AS nombre_rol, p.id AS id_proyecto
      FROM espacio_entrega e
      INNER JOIN rol r ON e.id_rol = r.id
      LEFT JOIN documento_entrega d ON e.id = d.id_espacio_entrega
      JOIN proyecto p ON p.id_modalidad = e.id_modalidad AND p.id_etapa = e.id_etapa
      WHERE d.id_proyecto IS NULL AND p.id = $1
      `;

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

const obtenerEntregasCompletadas = async (req, res) => {
  try {
    const proyecto_id = req.params.id;

    const query = `SELECT e.id, e.nombre, e.descripcion, e.fecha_apertura, e.fecha_cierre, d.fecha_entrega, r.nombre AS nombre_rol
    FROM espacio_entrega e
    INNER JOIN rol r ON e.id_rol = r.id
    INNER JOIN documento_entrega d ON e.id = d.id_espacio_entrega
    JOIN proyecto p ON p.id_modalidad = e.id_modalidad AND p.id_etapa = e.id_etapa
    WHERE p.id = $1        
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
    console.log(error)
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
    const result = await pool.query('SELECT s.*, ts.nombre AS nombre_tipo_solicitud FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id WHERE s.finalizado = false AND s.id_proyecto = $1; ', [id])
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
    const result = await pool.query('SELECT s.*, ts.nombre AS nombre_tipo_solicitud FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id WHERE s.finalizado = true AND s.id_proyecto = $1; ', [id])
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
    console.log(error)
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

const guardarSolicitud = async (req, res) => {

  const { tipo_solicitud, justificacion, id_proyecto } = req.body;

  // Aquí puedes agregar la lógica para validar los datos recibidos si es necesario

  // Luego, puedes usar un ORM o una consulta SQL para guardar los datos en la base de datos
  try {
    // Ejemplo usando el paquete "pg" para ejecutar la consulta SQL
    const id_tipo_solicitud = await pool.query('SELECT id FROM tipo_solicitud WHERE nombre = $1;', [id_proyecto])
    const id_tipo = id_tipo_solicitud.rows
    const query = `
        INSERT INTO public.solicitud(fecha, justificacion, id_tipo_solicitud)
        VALUES ( $1, $2, $3)
      `;
    const values = [tipo_solicitud, justificacion, id_tipo_solicitud[0]];

    // Ejecutar la consulta SQL usando el pool de conexiones de PostgreSQL
    await pool.query(query, values);

    res.status(200).json({ message: 'Solicitud enviada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar la solicitud' });
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
    console.log(id_reunion);
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
  obtenerProyecto, obtenerEntregasCompletadas, obtenerEntregasPendientes,
  obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas,
  obtenerSolicitudesPendientes, obtenerSolicitudesCompletas, guardarReunion, obtenerReunion,
  cancelarReunion, editarReunion, guardarSolicitud, guardarInfoActa, generarPDF, obtenerInfoActa, guardarLink
}
