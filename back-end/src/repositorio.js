const { repository } = require('./config')
const { google } = require('googleapis');

const authClient = new google.auth.JWT({
    email: repository.client_email,
    key: repository.private_key,
    scopes: ['https://www.googleapis.com/auth/drive'], // Ámbito de acceso
  });


authClient.authorize(function (err, tokens) {
  if (err) {
    console.error('Error de autenticación:', err);
    return;
  }
 console.log("RP conectado")
});

const drive = google.drive({ version: 'v3', auth: authClient });

module.exports = drive