const { v4: uuidv4 } = require('uuid');
const { repository,API_KEY } = require('../config')
const { Readable } = require('stream');

const fs = require('fs');
const path = require('path');
const pool = require('../database')
const drive = require('../repositorio')

const subirArchivoAGoogleDrive = async (nombreArchivo, mimeType, contenido, carpeta) => {
  try {
 
    const response = await drive.files.create({
      requestBody: {
        name: nombreArchivo,
        parents: [carpeta], 
      },
      media: {
        mimeType,
        body: Readable.from(contenido),
      },
    });
    return response.data.id;
  } catch (error) {
    throw error;
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
      return res.status(203).json({ success: false, message: 'Espacio de entrega no encontrado.' });
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
      // Obtener información del documento existente
      documentoId = existingDocumentResult.rows[0].id;
      uuid = existingDocumentResult.rows[0].uuid;
      fechaEntrega = existingDocumentResult.rows[0].fecha_entrega;
    
      if (uuid) {
        await eliminarArchivoDeGoogleDrive(uuid);
      }
    
    
      const fileId = await subirArchivoAGoogleDrive(nombre, file.mimetype, file.buffer,repository.id_entrega);
    
      // Actualizar la información del documento en la base de datos (nombre y UUID)
      const documentoUpdateQuery = `
        UPDATE documento
        SET nombre = $1, uuid = $2
        WHERE id = $3
      `;
      const documentoUpdateValues = [nombre, fileId, documentoId];
    
      await pool.query(documentoUpdateQuery, documentoUpdateValues);
    } else {
      const fileId = await subirArchivoAGoogleDrive(nombre, file.mimetype, file.buffer,repository.id_entrega);
      const documentoQuery = `
        INSERT INTO documento (nombre, uuid)
        VALUES ($1, $2)
        RETURNING id
      `;
      const documentoValues = [nombre, fileId];

      const documentoResult = await pool.query(documentoQuery, documentoValues);
      documentoId = documentoResult.rows[0].id;

      fechaEntrega = new Date(); 
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
const eliminarArchivoDeGoogleDrive = async (fileId) => {
  try {
    await drive.files.delete({
      fileId: fileId,
    });
  } catch (error) {
    throw error;
  }
};
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
    await pool.query(query, [id], async (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
      }
      if (result.rows.length === 0) {
        return res.status(203).json({ success: false, message: 'No se encontro el documento entregado.' });
      }else{
        const documento = result.rows[0];
        return res.json({ success: true, documento });
      }
    })
  } catch (error) {
    return res.status(502).json({ success: false, message: 'Error al obtener la información del documento entregado' });
  }
};


const descargarDocumento = async (req, res) => {
  try {
    const fileId = req.params.uuid;
    const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    if (response.status !== 200) {
      throw new Error(`Error al descargar el archivo, comuníquese con el administrador.`);
    }
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Disposition', `attachment; filename=${fileId}`);
    response.data.pipe(res);
  } catch (error) {
    res.status(502).json({ success: false, message: 'No se pudo encontrar el archivo entregado, comuníquese con el administrador' });
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
      return res.status(502).json({ success: false, message: 'Espacio de entrega no encontrado.' });
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

    const fileId = await subirArchivoAGoogleDrive(nombre, file.mimetype, file.buffer,repository.id_retroalimentacion);

    const documentoQuery = `
      INSERT INTO documento_retroalimentacion (nombre, uuid, id_calificacion)
      VALUES ($1, $2, $3)
`;
    const documentoValues = [nombre, fileId, id_calificacion];

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
    await pool.query(query, [id], async (error, result) => {
      if (error) {
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
      }
      if (result.rows.length === 0) {
        return res.status(203).json({ success: false, message: 'No se encontro el documento entregado.' });
      }else{
        const documento = result.rows[0];
        return res.json({ success: true, documento });
      }
      
    })
  } catch (error) {
    return res.status(502).json({ success: false, message: 'Error al obtener la información del documento de retroalimentación' });
  }
};

const descargarDocumentoRetroalimentacion = async (req, res) => {
  try {
    const fileId = req.params.uuid;
    const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    if (response.status !== 200) {
      throw new Error(`Error al descargar el archivo, comuníquese con el administrador.}`);
    }
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Disposition', `attachment; filename=${fileId}`);
    response.data.pipe(res);
  } catch (error) {
    res.status(502).json({ success: false, message: 'No se pudo encontrar el archivo entregado, comuníquese con el administrador.' });
  }
};
module.exports = {
  guardarDocumentoYEntrega, verInfoDocEntregado, descargarDocumento, guardarCalificacionDoc,
  verInfoDocRetroalimentacion, descargarDocumentoRetroalimentacion
};
