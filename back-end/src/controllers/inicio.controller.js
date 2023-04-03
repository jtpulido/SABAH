const passport = require('passport');

const login = (req, res, next) => {
    console.log(req)
    passport.authenticate('local.login', function (err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            return res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
        } else {
            return res.json({ success: true, message: 'Inicio de sesión exitoso' })
        }
    })(req, res, next);
};


module.exports = { login }