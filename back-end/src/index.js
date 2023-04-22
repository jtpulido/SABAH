
const express = require('express')
const passport = require('passport');
const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
const loginRoutes = require('./routes/login.routes')
const usersRoutes = require('./routes/usuarios.routes')
const adminRoutes = require('./routes/admin.routes')
const cmtRoutes = require('./routes/comite.routes')
const proyectosRoutes = require('./routes/proyecto.routes')


const app = express()


require('./config/passport')(passport);
app.use(express.json());
app.use(passport.initialize());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Rutas
app.use(loginRoutes);
app.use(adminRoutes)
app.use(cmtRoutes)
app.use(usersRoutes)
app.use(proyectosRoutes)


//Publicos
app.use(express.static(path.join(__dirname, 'public')))

app.set('port', 5000)

//Iniciar Servidor
app.listen(app.get('port'), () => {
  console.log('Servidor en el puerto', app.get('port'))
})
