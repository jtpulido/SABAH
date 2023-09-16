const cors = require('cors');
const express = require('express');
const passport = require('passport');
const morgan = require('morgan');
const path = require('path');
const { CORS } = require('./config')
const loginRoutes = require('./routes/login.routes');
const usersRoutes = require('./routes/usuarios.routes');
const adminRoutes = require('./routes/admin.routes');
const cmtRoutes = require('./routes/comite.routes');
const proyectosRoutes = require('./routes/proyecto.routes');

const app = express();

require('./config/passport')(passport);
app.use(express.json());
app.use(passport.initialize());

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de CORS
const corsOptions = {
  origin: CORS,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false
};
app.use(cors(corsOptions));

// Rutas
app.use(loginRoutes);
app.use(adminRoutes);
app.use(cmtRoutes);
app.use(usersRoutes);
app.use(proyectosRoutes);

// Publicos
app.use(express.static(path.join(__dirname, 'public')));

app.set('port', 5000);

// Iniciar Servidor
app.listen(app.get('port'), () => {
  console.log('Servidor en el puerto', app.get('port'));
});
