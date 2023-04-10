const passport = require('passport')
const pool = require('../database')
const LocalStrategy = require('passport-local').Strategy
const helpers = require('../lib/helpers')


passport.use('local.login', new LocalStrategy(async function (username, password, done) {
  try {
    const result = await pool.query('SELECT u.*, tu.tipo AS id_tipo_usuario FROM usuario u JOIN tipo_usuario tu ON u.id_tipo_usuario= tu.id WHERE LOWER(u.correo)=LOWER($1)', [username])
    const user = result.rows[0]
    
    if (!user) {
      return done(null, false, { message: 'Autenticación fallida: usuario no encontrado' })
    }
    const validPassword = await helpers.matchPassword(password, user.contrasena)
    if (!validPassword) {
      return done(null, false, { message: 'Autenticación fallida: contraseña inválida' })
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));



passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = (await (pool.query('SELECT * FROM users WHERE id=$1', [id]))).rows;
  done(null, { row: rows[0] });
}); 