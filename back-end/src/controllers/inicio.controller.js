const passport = require('passport');

const login = (req, res, next) => {
    passport.authenticate('local.login', function (err, user, info) {
      if (err) { 
        return res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.', error: err.message });
      }
      if (!user) {
        return res.status(401).json({ success: false, message: info.message });
      } else {
        return res.json({ success: true, message: 'Inicio de sesión exitoso',user})
      
      }
    })(req, res, next);
  };
  

module.exports = { login }