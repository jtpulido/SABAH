const passport = require('../lib/passport');

const login = (req, res, next) => {
  passport.authenticate('local.login', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ success: true, message: 'Inicio de sesión exitoso', user });
    });
  })(req, res, next);
};

module.exports = { login };
