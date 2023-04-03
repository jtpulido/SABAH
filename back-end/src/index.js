
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session);
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
  store: new pgSession({
    pool: pgPool,
    tableName: 'session',
  }),
  secret: 'sabahproject',
  resave: false,
  saveUninitialized: false
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
