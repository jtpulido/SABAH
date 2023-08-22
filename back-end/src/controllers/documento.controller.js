const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const pool = require('../database')
const verInfoDocEntregado = async (req, res) => {
  try {
    const id = req.params.id_doc_entrega;
    const query =
      `SELECT 
          de.id,
          d.nombre AS nombre_documento,
          d.id AS id_doc,
          d.uuid,
          de.fecha_entrega
      FROM 
          documento_entrega de
          INNER JOIN documento d ON de.id_documento = d.id
      WHERE de.id = $1  
  `;
    await pool.query(query, [id], (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
      }
      if (result.rows.length === 0) {

        return res.status(203).json({ success: true, message: 'No se encontro el documento entregado.' });
      }
      const documento = result.rows[0];

      if (!documento) {

        return res.status(404).json({ success: false, message: 'Documento no encontrado' });
      }
      const filePath = path.join("C:\\Users\\Tatiana Pulido\\Proyecto\\SABAH\\back-end\\uploads\\entregas\\", documento.uuid + path.extname(documento.nombre_documento));
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
      }
      const nombreArchivo = documento.uuid + path.extname(documento.nombre_documento)
      // Envía el archivo para descargar al front-end.
      res.json({ success: true, filePath, documento, nombreArchivo });
    })
    return res.status(500).json({ success: false, message: 'Error al descargar el archivo' });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al descargar el archivo' });
  }
};
const descargarDocumento = async (req, res) => {
  const nombreArchivo = req.params.nombreArchivo;
  const rutaArchivo = path.join("C:\\Users\\Tatiana Pulido\\Proyecto\\SABAH\\back-end\\uploads\\entregas\\", nombreArchivo);

  if (fs.existsSync(rutaArchivo)) {
    res.sendFile(rutaArchivo);
  } else {
    res.status(203).json({ success: false, message: 'Archivo no encontrado' });
  }
};

const guardarDocumentoYEntrega = async (req, res, file) => {
  const entrega = JSON.parse(req.body.entrega);
  const nombre = JSON.parse(req.body.nombreArchivo);

  try {
    const espacioEntregaQuery = `
      SELECT fecha_cierre_entrega
      FROM espacio_entrega
      WHERE id = $1
    `;
    const espacioEntregaResult = await pool.query(espacioEntregaQuery, [entrega.id_espacio_entrega]);

    if (espacioEntregaResult.rows.length === 0) {
      return res.status(501).json({ success: false, message: 'Espacio de entrega no encontrado.' });
    }

    const fechaCierreEntrega = new Date(espacioEntregaResult.rows[0].fecha_cierre_entrega);
    const now = new Date();

    if (now > fechaCierreEntrega) {
      return res.status(203).json({ success: false, message: 'El espacio de entrega ya ha cerrado.' });
    }

    await pool.query('BEGIN');

    const existingDocumentQuery = `
      SELECT d.id, d.uuid, d.nombre, de.fecha_entrega
      FROM documento_entrega de
      INNER JOIN documento d ON d.id = de.id_documento
      WHERE de.id_proyecto = $1 AND de.id_espacio_entrega = $2
      ORDER BY de.fecha_entrega DESC
      LIMIT 1
    `;
    const existingDocumentValues = [entrega.id_proyecto, entrega.id_espacio_entrega];

    const existingDocumentResult = await pool.query(existingDocumentQuery, existingDocumentValues);
    let documentoId, uuid, fechaEntrega;

    if (existingDocumentResult.rows.length > 0) {
      // Actualizar el documento existente y la fecha de entrega
      documentoId = existingDocumentResult.rows[0].id;
      uuid = existingDocumentResult.rows[0].uuid;
      fechaEntrega = existingDocumentResult.rows[0].fecha_entrega;

      // Eliminar el archivo anterior
      const fileExtension = path.extname(existingDocumentResult.rows[0].nombre);
      const previousFilePath = path.join('uploads/entregas/', `${uuid}${fileExtension}`);
      fs.unlinkSync(previousFilePath);

      // Actualizar el UUID para mantener la consistencia
      uuid = uuidv4();
      const newFileName = `${uuid}${fileExtension}`;
      const newPath = path.join('uploads/entregas/', newFileName);
      fs.renameSync(file.path, newPath);

      const documentoUpdateQuery = `
        UPDATE documento
        SET nombre = $1, uuid = $2
        WHERE id = $3
      `;
      const documentoUpdateValues = [nombre, uuid, documentoId];

      await pool.query(documentoUpdateQuery, documentoUpdateValues);
    } else {
      // Insertar nuevo documento y entrada de entrega
      uuid = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuid}${fileExtension}`;
      const newPath = path.join('uploads/entregas/', fileName);
      fs.renameSync(file.path, newPath);

      const documentoQuery = `
        INSERT INTO documento (nombre, uuid)
        VALUES ($1, $2)
        RETURNING id
      `;
      const documentoValues = [nombre, uuid];

      const documentoResult = await pool.query(documentoQuery, documentoValues);
      documentoId = documentoResult.rows[0].id;

      fechaEntrega = new Date(); // Marca de tiempo actual
    }

    // Insertar o actualizar entrada de entrega
    const entregaQuery = `
      INSERT INTO documento_entrega (id_documento, id_proyecto, id_espacio_entrega, fecha_entrega)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id_proyecto, id_espacio_entrega) DO UPDATE
      SET id_documento = EXCLUDED.id_documento, fecha_entrega = $4
    `;
    const entregaValues = [documentoId, entrega.id_proyecto, entrega.id_espacio_entrega, fechaEntrega];

    await pool.query(entregaQuery, entregaValues);

    await pool.query('COMMIT');

    return res.status(200).json({ success: true, message: 'Documento y entrega guardados exitosamente.' });
  } catch (error) {
    await pool.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(203).json({ success: true, message: "Ya existe una entrega para este proyecto" });
    }
    return res.status(502).json({ success: false, message: 'Ha ocurrido un error al guardar el documento y la entrega.' });
  }
};



const guardarCalificacionDoc = async (req, res, file) => {

  try {
    const calificacion = JSON.parse(req.body.calificacionData);
    const nombre = JSON.parse(req.body.nombreArchivo);
    const { id_doc_entrega, id_usuario_rol, calificacion_aspecto, id_espacio_entrega } = calificacion;

    const espacioEntregaQuery = `
      SELECT fecha_cierre_calificacion
      FROM espacio_entrega
      WHERE id = $1
    `;
    const espacioEntregaResult = await pool.query(espacioEntregaQuery, [id_espacio_entrega]);

    if (espacioEntregaResult.rows.length === 0) {
      return res.status(501).json({ success: false, message: 'Espacio de entrega no encontrado.' });
    }

    const fechaCierreCal = new Date(espacioEntregaResult.rows[0].fecha_cierre_calificacion);
    const now = new Date();

    if (now > fechaCierreCal) {
      return res.status(203).json({ success: false, message: 'El espacio de calificación ya ha cerrado.' });
    }

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

    // Insertar nuevo documento y entrada de entrega
    uuid = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuid}${fileExtension}`;
    const newPath = path.join('uploads/retro/', fileName);
    fs.renameSync(file.path, newPath);

    const documentoQuery = `
      INSERT INTO documento_retroalimentacion (nombre, uuid, id_calificacion)
      VALUES ($1, $2, $3)
`;
    const documentoValues = [nombre, uuid, id_calificacion];

    await pool.query(documentoQuery, documentoValues);

    await pool.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Calificación y documento guardados correctamente' });
  } catch (error) {
    await pool.query('ROLLBACK');
    return res.status(502).json({ success: false, message: 'Error guardar la calificación' });
  }
};
const verInfoDocRetroalimentacion = async (req, res) => {
  try {
    const id = req.params.id;
    const query =
      `SELECT 
        id,
        nombre AS nombre_documento,
        uuid,
        id_calificacion
      FROM 
        documento_retroalimentacion
      WHERE id_calificacion= $1  
      `;
    await pool.query(query, [id], (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
      }
      if (result.rows.length === 0) {

        return res.status(203).json({ success: true, message: 'No se encontro el documento entregado.' });
      }
      const documento = result.rows[0];

      if (!documento) {
        return res.status(203).json({ success: false, message: 'Documento no encontrado' });
      }
      const filePath = path.join("C:\\Users\\Tatiana Pulido\\Proyecto\\SABAH\\back-end\\uploads\\retro\\", documento.uuid + path.extname(documento.nombre_documento));
      if (!fs.existsSync(filePath)) {
        return res.status(203).json({ success: false, message: 'Archivo no encontrado' });
      }
      const nombreArchivo = documento.uuid + path.extname(documento.nombre_documento)
      res.json({ success: true, filePath, documento, nombreArchivo });
    })
    return res.status(502).json({ success: false, message: 'Error al descargar el archivo' });
  } catch (error) {
    return res.status(502).json({ success: false, message: 'Error al descargar el archivo' });
  }
};

const descargarDocumentoRetroalimentacion = async (req, res) => {
  const nombreArchivo = req.params.nombreArchivo;
  const rutaArchivo = path.join("C:\\Users\\Tatiana Pulido\\Proyecto\\SABAH\\back-end\\uploads\\entregas\\", nombreArchivo);

  if (fs.existsSync(rutaArchivo)) {
    res.sendFile(rutaArchivo);
  } else {
    res.status(203).json({ success: false, message: 'Archivo no encontrado' });
  }
};
module.exports = {
  guardarDocumentoYEntrega, verInfoDocEntregado, descargarDocumento, guardarCalificacionDoc,
  verInfoDocRetroalimentacion, descargarDocumentoRetroalimentacion
};
