const subirArchivo = (req, res) => {
  
  const { filename, originalname, mimetype, size } = req.file;

  // Mostrar la información del archivo
  console.log('Archivo recibido:');
  console.log('Nombre de archivo en el servidor:', filename);
  console.log('Nombre original del archivo:', originalname);
  console.log('Tipo MIME del archivo:', mimetype);
  console.log('Tamaño del archivo:', size, 'bytes');

  res.sendStatus(200); // Enviar respuesta exitosa
};

module.exports = { subirArchivo};