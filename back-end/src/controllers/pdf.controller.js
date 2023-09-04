const pool = require('../database')

const generarPDF = async (req, res) => {
  try {
    const { fecha, compromisos, objetivos, tareas, nombre, resultados, data_proyecto, data_invitados } = req.body;
    const PDFDocument = require('pdfkit');
    const path = require('path');
    const doc = new PDFDocument();

    const tituloParte1 = 'FACULTAD DE INGENIERÍA\nPROGRAMA INGENIERÍA DE SISTEMAS\nCOMITÉ OPCIONES DE GRADO';
    const tituloParte3 = 'OPCIONES DESARROLLO TECNOLÓGICO Y PROYECTO DE GRADO';

    const imagePath = path.join(__dirname, 'Logo.png');

    doc
      .image(imagePath, 50, 50, { width: 100 })
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(tituloParte1, { align: 'center' })
      .moveDown(0)
      .font('Helvetica')
      .fontSize(10)
      .text(tituloParte3, { align: 'center' })
      .moveDown(1);

    const asistentes = [];
    const nombre_rol = [];

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
      nombre_rol.push("Estudiante");

    });

    data_invitados.invitados.forEach((invitado) => {
      if(invitado.id_cliente != null){
        asistentes.push(invitado.nombre_repr);
        nombre_rol.push("Cliente" )
      }else{
      asistentes.push(invitado.nombre_usuario);
      nombre_rol.push(invitado.nombre_rol);
    }
    });
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(10).text('DIRECTOR: ', { continued: true })
      .font('Helvetica').text(data_proyecto.director.nombre, { continued: false, align: 'left' })
      .moveDown(1);

    doc.font('Helvetica-Bold').fontSize(12).text(nombre, { continued: false, align: 'center' })
      .moveDown(1);

    const marginLeft = 82; 
    const marginlefttitles = 72;

    doc.font('Helvetica-Bold').fontSize(10).text('1. FECHA Y HORA', { continued: false, align: 'left' })
    .moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(fecha, marginLeft,doc.y, { continued: false, align: 'left' })
    .moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(10).text('2. DESCRIPCIÓN DE OBJETIVOS',marginlefttitles,doc.y, { continued: false, align: 'left' })
    .moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(objetivos, marginLeft,doc.y, { continued: false, align: 'left' })
    .moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(10).text('3. RESULTADOS DE REUNIÓN',marginlefttitles,doc.y, { continued: false, align: 'left' })
    .moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(resultados, marginLeft,doc.y, { continued: false, align: 'left' })
    .moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(10).text('4. TAREAS SESION ANTERIOR',marginlefttitles,doc.y, { continued: false, align: 'left' })
    .moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(tareas, marginLeft,doc.y, { continued: false, align: 'left' })
    .moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(10).text('5. COMPROMISOS',marginlefttitles,doc.y, { continued: false, align: 'left' })
    .moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(compromisos, marginLeft,doc.y, { continued: false, align: 'left' })
    .moveDown(0.5);
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
    drawSignatureFields(doc, numberOfSignatureFields, signatureSettings, nombre_rol);

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



function drawSignatureFields(doc, numberOfFields, settings, dataRol) {
  const { x, y, width, rowHeight, signatureHeight, fontSize, signaturesPerRow } = settings;

  doc.font('Helvetica').fontSize(fontSize);

  for (let i = 0; i < numberOfFields.length; i++) {
    const row = Math.floor(i / signaturesPerRow);
    const col = i % signaturesPerRow;

    const xPos = x + (width + 20) * col;
    const yPos = y + row * rowHeight;

    doc.font('Helvetica-Bold').fontSize(11).text(numberOfFields[i], xPos + 10, yPos + 50, { width: width - 20, align: 'center' });
    doc.font('Helvetica').fontSize(10).text(dataRol[i], xPos + 10, yPos + 70, { width: width - 20, align: 'center' });

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