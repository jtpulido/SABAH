const passport = require('passport')
const pool = require('../database')
const LocalStrategy = require('passport-local').Strategy
const helpers = require('../lib/helpers')


passport.use('local.login', new LocalStrategy(async function (username, password, done) {
  await pool.query('SELECT * FROM usuario WHERE correo=$1', [username], async (err, result) => {
    if (err) { 
      console.log('authentication error:', err);
      return done(err) 
    }
    const user = result.rows[0]
    if (!user) { 
      console.log('authentication failed: user not found');
      return done(null, false) 
    }
    const validPassword = await helpers.matchPassword(password, user.contrasena)
    if (!validPassword) { 
      console.log('authentication failed: invalid password');
      return done(null, false) 
    }
    console.log('authentication succeeded for user:', user);
    return done(null, user);
  });
}));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = (await (pool.query('SELECT * FROM users WHERE id=$1', [id]))).rows;
  done(null, { row: rows[0] });
}); 