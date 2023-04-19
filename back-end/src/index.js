
const express = require('express')
const session = require('express-session')
const passport = require('./lib/passport');

const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
const loginRoutes = require('./routes/login.routes')
const usersRoutes = require('./routes/usuarios.routes')
const adminRoutes = require('./routes/admin.routes')
const cmtRoutes = require('./routes/comite.routes')
const proyectosRoutes = require('./routes/proyecto.routes')


//inicialización
const app = express()

//Configuración del puerto
app.set('port', process.env.PORT || 5000)


// Configura la sesión de Express
app.use(session({
  secret: 'sabahproject',
  resave: false,
  saveUninitialized: false
}))

// Configura Passport.js
app.use(passport.initialize())
app.use(passport.session())

app.use(cors())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Rutas
app.use(adminRoutes)
app.use(cmtRoutes)
app.use(loginRoutes)
app.use(usersRoutes)
app.use(proyectosRoutes)

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'No autorizado' });
};

//Publicos
app.use(express.static(path.join(__dirname, 'public')))

//Iniciar Servidor
app.listen(app.get('port'), () => {
  console.log('Servidor en el puerto', app.get('port'))
})