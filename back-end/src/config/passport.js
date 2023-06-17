const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');
const pool = require('../database')
const { JWT_SECRET } = require('../config') 

module.exports = (passport) => {
  console.log("////entro 1////")
  passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  },async (payload, done) => {
    console.log("////entro////")
    await pool.query('SELECT u.*, tu.tipo AS id_tipo_usuario FROM usuario u JOIN tipo_usuario tu ON u.id_tipo_usuario = tu.id WHERE u.id = $1', [payload.id], (error, result) => {
      if (error) {
        console.log(error)
        return done(error, false);
      }
      if (result.rowCount === 1) {
        return done(null, result.rows[0]);
      } else {
        return done(null, false);
      }
    });
  }));
};
