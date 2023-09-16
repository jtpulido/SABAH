const { config } = require('dotenv');
config();

module.exports = {
  database: {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
  },
  repository:{
    id_entrega:process.env.RP_ID_ENTREGAS,
    id_retroalimentacion:process.env.RP_ID_RETROALIMENTACIONES,
    scopes:process.env.RP_SCOPES,
    project_id : process.env.GOOGLE_PROJECT_ID,
    private_key_id :process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key : process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email : process.env.GOOGLE_CLIENT_EMAIL,
    client_id :process.env.GOOGLE_CLIENT_ID,
  },
  API_KEY:process.env.API_KEY,
  JWT_SECRET: process.env.JWT_SECRET
  
};