const pool = require('../database')
let proyectos = "";
let director = "";
let jurados = "";
let estudiantes = ""
let lector ="";

const obtenerProyecto = async (req, res) => {
  const id = req.params.proyecto_id;
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
        proyectos = proyecto[0];
        director = usuario_director;
        jurados = info_jurado;
        estudiantes = result_estudiantes.rows;
        lector = info_lector;
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
    const pendientes = result.rowCount > 0 ? { "existe_pendientes": true, "pendientes": result.rows } : { "existe": false };
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
    const updateQuery = `
        UPDATE reuniones
        SET id_estado = 2
        WHERE id_proyecto = $1 AND fecha < CURRENT_DATE AND id_estado != 3;
        `;
    const updateValues = [id];
    await pool.query(updateQuery, updateValues);

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
    const result = await pool.query(`SELECT r.id, r.nombre, r.fecha, r.invitados, r.enlace, CASE WHEN ar.id IS NOT NULL THEN true ELSE false END AS has_acta FROM reuniones r JOIN estadoReunion e ON r.id_estado = e.id LEFT JOIN actasreunion ar ON r.id = ar.id WHERE r.id_proyecto = $2 AND e.nombre = $1;`, ['Completa', id])
    const completas = result.rows
    if (result.rowCount > 0) {
  }} catch (error) {
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
        INSERT INTO public.reuniones(nombre, fecha, invitados, enlace, id_proyecto, id_estado)
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

    const result = await pool.query('SELECT r.id, r.nombre, r.fecha, r.invitados, r.enlace FROM reuniones r JOIN estadoReunion e ON r.id_estado = e.id WHERE r.id_proyecto = $1 AND r.id = $2;', [id, id_reunion])
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
      UPDATE public.reuniones
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
        UPDATE public.reuniones
        SET nombre=$1, fecha=$2, invitados=$3, enlace=$4
        WHERE id = $5
      `;
    const values = [nombre, fecha, invitados, enlace, id_reunion];

    await pool.query(query, values);

    res.status(200).json({ message: 'Reunión editada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar la reunión' });
  }
};

const guardarSolicitud = async (req, res) => {

  const { tipo_solicitud, justificacion, id_proyecto } = req.body;


  try {
    const id_tipo_solicitud = await pool.query('SELECT id FROM tipo_solicitud WHERE nombre = $1;', [id_proyecto])
    const id_tipo = id_tipo_solicitud.rows
    const query = `
        INSERT INTO public.solicitud(fecha, justificacion, id_tipo_solicitud)
        VALUES ( $1, $2, $3)
      `;
    const values = [tipo_solicitud, justificacion, id_tipo_solicitud[0]];

    await pool.query(query, values);

    res.status(200).json({ message: 'Solicitud enviada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar la solicitud' });
  }
};

const guardarInfoActa = async (req, res) => {

  const { id_reunion, objetivos, resultados, tareas, compromisos } = req.body;

  try {

    const query = `
        INSERT INTO public.actasreunion(
            id, descrip_obj, resultados_reu, tareas_ant, compromisos)
        VALUES ( $1, $2, $3, $4, $5 )
      `;
    const values = [id_reunion, objetivos, resultados, tareas, compromisos];

    await pool.query(query, values);

    res.status(200).json({ message: 'Acta guardada exitosamente' });
  } catch (error) {
    console.log(id_reunion);
  }

  const { id } = req.params;

  try {

    const result = await pool.query('SELECT t1.fecha, t1.invitados,t1.nombre, t2.compromisos, t2.descrip_obj, t2.tareas_ant, t2.resultados_reu FROM public.reuniones t1, public.actasreunion t2  WHERE t1.id = $1 AND t2.id = $1 ;'
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

   
    const asistentes =[];


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

  if(invitados.includes("director")){
    asistentes.push(director.nombre);
  }

  if(invitados.includes("lector")){
    asistentes.push(lector);
  }

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
}



const guardarLink = async (req, res) => {

  const { id, tipol, link } = req.body;
  try {
    const result = await pool.query('SELECT id, artefactos, documentos  FROM public.links WHERE id IN ($1)  ;'
      , [id])
    if (result.rowCount < 0 && tipol == 'A') {
      const query = `
        INSERT INTO public.links(
            id, artefactos)
            VALUES ($1, $2);
      `;
      const values = [id, link];
      await pool.query(query, values);

      res.status(200).json({ message: 'Link guardado exitosamente' });
    } else if (result.rowCount < 0 && tipol == 'D') {
      const query = `
        INSERT INTO public.links(
            id, documentos)
            VALUES ($1, $2);
      `;
      const values = [id, link];
      await pool.query(query, values);

      res.status(200).json({ message: 'Link guardado exitosamente' });
    } else if (tipol == 'A') {
      const query = `
        UPDATE public.links
        SET  artefactos = $2
        WHERE  id = $1;
      `;
      const values = [id, link];
      await pool.query(query, values);

      res.status(200).json({ message: 'Link guardado exitosamente' });
    } else if (tipol == 'D') {
      const query = `
        UPDATE public.links
        SET  documentos = $2
        WHERE  id = $1;
      `;
      const values = [id, link];
      await pool.query(query, values);

      res.status(200).json({ message: 'Link guardado exitosamente' });
    } else {
      return res.status(203).json({ success: false, message: 'No existe el proyecto' })
    }
    res.status(200).json({ message: 'Link guardado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el link' });
  }
};

  }catch (error) {
    res.status(500).json({ message: 'Error al guardar el link' });
  }
};

module.exports = {
  obtenerProyecto, obtenerEntregasCompletadas, obtenerEntregasPendientes,
  obtenerReunionesPendientes, obtenerReunionesCompletas, obtenerReunionesCanceladas,
  obtenerSolicitudesPendientes, obtenerSolicitudesRechazadas, obtenerSolicitudesAprobadas, guardarReunion, obtenerReunion,
  cancelarReunion, editarReunion,
  obtenerTipoSolicitud, guardarSolicitud,
  guardarInfoActa, generarPDF, obtenerInfoActa, guardarLink
}
