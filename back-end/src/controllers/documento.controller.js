const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const pool = require('../database')

const guardarDocumentoYEntrega = async (req, res, file) => {
  
  const  entrega  = JSON.parse(req.body.entrega);
  
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
    const documentoValues = [file.originalname, uuid];

    const documentoResult = await pool.query(documentoQuery, documentoValues);
    const documentoId = documentoResult.rows[0].id;

    const entregaQuery = `
      INSERT INTO documento_entrega (id_documento, id_proyecto, id_espacio_entrega)
      VALUES ($1, $2, $3)
    `;
    const entregaValues = [documentoId, entrega.id_proyecto, entrega.id];
   
    await pool.query(entregaQuery, entregaValues);

    await pool.query('COMMIT');

    return res.status(200).json({ success: true, message: 'Documento y entrega guardados exitosamente.' });
  } catch (error) {
    await pool.query('ROLLBACK');
    return res.status(502).json({ success: false, message: 'Ha ocurrido un error al guardar el documento y la entrega.' });
  }
};

module.exports = {
  guardarDocumentoYEntrega
};
