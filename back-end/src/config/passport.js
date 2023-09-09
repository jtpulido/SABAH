const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');
const pool = require('../database')
const { JWT_SECRET } = require('../config')

module.exports = (passport) => {

  passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  }, async (payload, done) => {
    try {
      let query, params;

      if (payload.tipo === 'U') {
        query = `
          SELECT u.*, tu.tipo AS id_tipo_usuario
          FROM usuario u
          JOIN tipo_usuario tu ON u.id_tipo_usuario = tu.id
          WHERE u.id = $1
        `;
        params = [payload.id];
      } else {
        query = `
          SELECT pr.id, i.contrasena
          FROM inicio_sesion i
          JOIN proyecto pr ON pr.id = i.id_proyecto
          WHERE pr.id = $1
        `;
        params = [payload.id];
      }

      const { rows, rowCount } = await pool.query(query, params);

      if (rowCount === 1) {
        return done(null, rows[0]);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }
  ));
};
