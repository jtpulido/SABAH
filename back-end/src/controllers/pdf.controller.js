const pool = require('../database')

const generarPDF = async (req, res) => {
  try {
    const { fecha, compromisos, objetivos, tareas, nombre, resultados, data_proyecto, data_invitados } = req.body;
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
      .font('Helvetica').text(data_proyecto.proyecto.nombre, { continued: false, align: 'left' });
    doc.font('Helvetica-Bold').fontSize(10).text('OPCIÓN DE GRADO: ', { continued: true })
      .font('Helvetica').text(data_proyecto.proyecto.modalidad, { continued: false, align: 'left' });
    doc.font('Helvetica-Bold').fontSize(10).text('CÓDIGO ASIGNADO A PROPUESTA: ', { continued: true })
      .font('Helvetica').text(data_proyecto.proyecto.codigo, { continued: false, align: 'left' })
      .moveDown(1);

    doc.font('Helvetica-Bold').fontSize(10).text('ESTUDIANTES', { align: 'left' });
    data_proyecto.estudiantes.forEach((estudiante) => {
      doc.font('Helvetica').fontSize(10).text(`${estudiante.nombre} - ${estudiante.num_identificacion}`, { align: 'left' });
      asistentes.push(estudiante.nombre);
    });

    data_invitados.invitados.forEach((invitado) => {
      asistentes.push(invitado.nombre_usuario);
    });
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(10).text('DIRECTOR: ', { continued: true })
      .font('Helvetica').text(data_proyecto.director.nombre, { continued: false, align: 'left' })
      .moveDown(1);

    doc.font('Helvetica-Bold').fontSize(11).text(nombre, { continued: false, align: 'center' })
      .moveDown(1);

    const tableData = [
      [{ text: '1.', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'FECHA Y HORA', font: 'Helvetica-Bold', fontSize: 10 }],
      [{ text: '', font: 'Helvetica-Bold', fontSize: 12 }, { text: fecha, font: 'Helvetica', fontSize: 10 }],
      [{ text: '2.', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'DESCRIPCIÓN DE OBJETIVOS', font: 'Helvetica-Bold', fontSize: 10 }],
      [{ text: '', font: 'Helvetica-Bold', fontSize: 12 }, { text: objetivos, font: 'Helvetica', fontSize: 10 }],
      [{ text: '3.', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'RESULTADOS DE REUNIÓN', font: 'Helvetica-Bold', fontSize: 10 }],
      [{ text: '', font: 'Helvetica-Bold', fontSize: 12 }, { text: resultados, font: 'Helvetica', fontSize: 10 }],
      [{ text: '4.', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'TAREAS SESION ANTERIOR', font: 'Helvetica-Bold', fontSize: 10 }],
      [{ text: '', font: 'Helvetica-Bold', fontSize: 12 }, { text: tareas, font: 'Helvetica', fontSize: 10 }],
      [{ text: '5.', font: 'Helvetica-Bold', fontSize: 12 }, { text: 'COMPROMISOS', font: 'Helvetica-Bold', fontSize: 10 }],
      [{ text: '', font: 'Helvetica-Bold', fontSize: 12 }, { text: compromisos, font: 'Helvetica', fontSize: 10 }],
    ];

    const tableSettings = {
      x: 80,
      y: doc.y,
      col1Width: 50,
      col2Width: 400,
      rowHeight: 40,
      cellMargin: 5,
    };

    drawTable(doc, tableData, tableSettings);
    doc.moveDown(1);
    doc.addPage();

    doc.font('Helvetica-Bold').fontSize(11).text('FIRMAS ASISTENTES', { continued: false, align: 'center' })
      .moveDown(1);
    doc.moveDown(1);

    const signatureSettings = {
      x: 50,
      y: doc.y,
      width: 165,
      rowHeight: 100,
      signatureHeight: 40,
      fontSize: 10,
      signaturesPerRow: 3,
    };


    const numberOfSignatureFields = asistentes;
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
  doc.lineWidth(1);
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

    const xPos = x + (width + 20) * col;
    const yPos = y + row * rowHeight;

    doc.font('Helvetica-Bold').fontSize(11).text(numberOfFields[i], xPos + 10, yPos + 50, { width: width - 20, align: 'center' });

    const lineYPos = yPos + signatureHeight;
    const lineLength = width * 0.85;
    const lineXPos = xPos + (width - lineLength) / 2;
    doc
      .strokeColor('#000000')
      .lineJoin('round')
      .moveTo(lineXPos, lineYPos)
      .lineTo(lineXPos + lineLength, lineYPos)
      .stroke();
  }
};

module.exports = { generarPDF }