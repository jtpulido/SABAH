
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
const session = require('express-session')
const pgPool = require('./database')
const passport = require('passport')
const inicioRoutes = require('./routes/inicio.routes')


//inicialización
const app = express()
require('./lib/passport')

//Configuración del puerto
app.set('port', process.env.PORT || 5000)

// Configura la sesión de Express
app.use(session({
  secret: 'sabahproject',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // tiempo de vida de la cookie en milisegundos
    httpOnly: true,              // no se permite acceso a la cookie desde el navegador
    secure: false                // establece si la cookie debe ser enviada solo sobre HTTPS
  }
}));

// Configura Passport.js
app.use(passport.initialize())
app.use(passport.session())

app.use(cors())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Rutas
app.use(inicioRoutes)

//Publicos
app.use(express.static(path.join(__dirname, 'public')))


//Iniciar Servidor
app.listen(app.get('port'), () => {
  console.log('Servidor en el puerto', app.get('port'))
})
