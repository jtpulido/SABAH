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
      const filePath = path.join("C:\\Users\\Tatiana Pulido\\Proyecto\\SABAH\\back-end\\uploads\\", documento.uuid + path.extname(documento.nombre_documento));
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
  const rutaArchivo = path.join("C:\\Users\\Tatiana Pulido\\Proyecto\\SABAH\\back-end\\uploads\\", nombreArchivo);

  if (fs.existsSync(rutaArchivo)) {
    res.sendFile(rutaArchivo);
  } else {
    res.status(404).json({ success: false, message: 'Archivo no encontrado' });
  }
};
const guardarDocumentoYEntrega = async (req, res, file) => {

  const entrega = JSON.parse(req.body.entrega);
  const nombre = JSON.parse(req.body.nombreArchivo);
  try {
    await pool.query('BEGIN');
    const uuid = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuid}${fileExtension}`;

    const newPath = path.join('uploads/', fileName);
    fs.renameSync(file.path, newPath);
    const documentoQuery = `
      INSERT INTO documento (nombre, uuid)
      VALUES ($1, $2)
      RETURNING id
    `;
    const documentoValues = [nombre, uuid];

    const documentoResult = await pool.query(documentoQuery, documentoValues);
    const documentoId = documentoResult.rows[0].id;

    const entregaQuery = `
      INSERT INTO documento_entrega (id_documento, id_proyecto, id_espacio_entrega)
      VALUES ($1, $2, $3)
    `;
    const entregaValues = [documentoId, entrega.id_proyecto, entrega.id_espacio_entrega];

    await pool.query(entregaQuery, entregaValues)

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


module.exports = { guardarDocumentoYEntrega, verInfoDocEntregado, descargarDocumento };
