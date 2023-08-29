const pool = require('../database')
const nodemailer = require('nodemailer');

const nuevoUsuario = async (req, res) => {
    const { nombre, correo } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: correo,
        subject: 'Bienvenido al sistema - Creación de cuenta exitosa',
        text: `
Estimado(a) ${nombre},
¡Bienvenido al sistema! Nos complace informarte que tu cuenta ha sido creada exitosamente.

Recuerda que para garantizar la seguridad de la cuenta, hemos generado una contraseña temporal. Te recomendamos cambiar esta contraseña temporal por una que sea segura y única. Para hacerlo, sigue estos sencillos pasos:

    1. Ve a la página de inicio de sesión en [URL del Sitio Web].
    2. Haz clic en "Recuperar Contraseña".
    3. Se te mostrará una ventana emergente de recuperación de contraseña.
    4. Ingresa tu dirección de correo electrónico asociada a tu cuenta y haz clic en "Enviar Código".
    5. Recibirás un correo electrónico con un código de verificación para restablecer tu contraseña.
    6. Ingresa el código de verificación y haz click en "Verificar".
    7. Ingresa la nueva contraseña.

Recuerda mantener tu contraseña en un lugar seguro y nunca compartirla con nadie más. Si tienes alguna pregunta o necesitas ayuda adicional, no dudes en contactarnos.

Atentamente,
El Equipo de SABAH
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Hubo un error al enviar el correo electrónico.' });
        } else {
            return res.status(200).json({ success: true, message: 'Se ha enviado el correo electrónico.' });
        }
    });
};

const codigoVerificacion = async (req, res) => {
    const { correo } = req.body;
    const codigoCreado = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Almacenar el código generado en req.app.locals
    req.app.locals.codigoCreado = codigoCreado;
    req.app.locals.correo = correo;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: correo,
        subject: 'Código de verificación para restablecer tu contraseña',
        text: `
Estimado(a) Usuario,

Recientemente has solicitado restablecer tu contraseña en nuestro sistema. Para continuar con el proceso de restablecimiento, por favor utiliza el siguiente código de verificación: ${codigoCreado}

Ingresa este código en la página de restablecimiento para verificar tu identidad y crear una nueva contraseña.
Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.

Atentamente,
El Equipo de SABAH
`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Hubo un error al enviar el correo electrónico.' });
        } else {
            return res.status(200).json({ success: true, message: 'Se ha enviado un correo electrónico con el código de verificación.' });
        }
    });
};

const codigoVerificacionEstudiantes = async (req, res) => {
    const correos = req.body;
    const codigoCreado = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Almacenar el código generado y la lista de correos en req.app.locals
    req.app.locals.codigoCreado = codigoCreado;
    req.app.locals.correos = correos;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    for (let i = 0; i < correos.length; i++) {
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: correos[i].correo,
            subject: 'Código de verificación para restablecer tu contraseña',
            text: `
Estimado(a) Usuario,

Recientemente has solicitado restablecer tu contraseña en nuestro sistema. Para continuar con el proceso de restablecimiento, por favor utiliza el siguiente código de verificación: ${codigoCreado}
            
Ingresa este código en la página de restablecimiento para verificar tu identidad y crear una nueva contraseña.
Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.
            
Atentamente,
El Equipo de SABAH
`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Hubo un error al enviar el correo electrónico.' });
            } else {
                return res.status(200).json({ success: true, message: 'Se ha enviado un correo electrónico con el código de verificación.' });
            }
        });
    }
};

const nuevaPropuesta = async (nombre, codigo, correo) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: correo,
        subject: 'Bienvenido al sistema - Creación de cuenta exitosa',
        text: `
  ¡Bienvenido al sistema! Nos complace informarte que la cuenta para tu propuesta ha sido creada exitosamente. Ha continuación, te porporcionamos los detalles de la propuesta:
  
  Nombre del proyecto: ${nombre}
  Código del proyecto: ${codigo}
  
  Recuerda que para garantizar la seguridad de la cuenta, hemos generado una contraseña temporal. Te recomendamos cambiar esta contraseña temporal por una que sea segura y única. Para hacerlo, sigue estos sencillos pasos:
    1. Ve a la página de inicio de sesión en [URL del Sitio Web].
    2. Haz clic en "Recuperar Contraseña".
    3. Se te mostrará una ventana emergente de recuperación de contraseña.
    4. Ingresa tu dirección de correo electrónico asociada a tu cuenta y haz clic en "Enviar Código".
    5. Recibirás un correo electrónico con un código de verificación para restablecer tu contraseña.
    6. Ingresa el código de verificación y haz click en "Verificar".
    7. Ingresa la nueva contraseña.
          
    Recuerda mantener tu contraseña en un lugar seguro y nunca compartirla con nadie más. Si tienes alguna pregunta o necesitas ayuda adicional, no dudes en contactarnos.
    `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Hubo un error al enviar el correo electrónico.' });
        } else {
            return res.status(200).json({ success: true, message: 'Se ha enviado un correo electrónico de bienvenida.' });
        }
    });
};

const nuevaPropuestaVarios = async (nombre, codigo, infoEstudiantes) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    for (let i = 0; i < infoEstudiantes.length; i++) {
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: infoEstudiantes[i].correo,
            subject: 'Bienvenido al sistema - Creación de cuenta exitosa',
            text: `
  ¡Bienvenido al sistema! Nos complace informarte que la cuenta para tu propuesta ha sido creada exitosamente. Ha continuación, te porporcionamos los detalles de la propuesta:
        
  Nombre del proyecto: ${nombre}
  Código del proyecto: ${codigo}
        
  Recuerda que para garantizar la seguridad de la cuenta, hemos generado una contraseña temporal. Te recomendamos cambiar esta contraseña temporal por una que sea segura y única. Para hacerlo, sigue estos sencillos pasos:
    1. Ve a la página de inicio de sesión en [URL del Sitio Web].
    2. Haz clic en "Recuperar Contraseña".
    3. Se te mostrará una ventana emergente de recuperación de contraseña.
    4. Ingresa tu dirección de correo electrónico asociada a tu cuenta y haz clic en "Enviar Código".
    5. Recibirás un correo electrónico con un código de verificación para restablecer tu contraseña.
    6. Ingresa el código de verificación y haz click en "Verificar".
    7. Ingresa la nueva contraseña.
          
    Recuerda mantener tu contraseña en un lugar seguro y nunca compartirla con nadie más. Si tienes alguna pregunta o necesitas ayuda adicional, no dudes en contactarnos.
    `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Hubo un error al enviar el correo electrónico.' });
            } else {
                return res.status(200).json({ success: true, message: 'Se han enviado los correo electrónico de bienvenida.' });
            }
        });
    }
};

const cambioContrasena = async (req, res) => {
    const { correo } = req.body;
    const codigoCreado = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Almacenar el código generado en req.app.locals
    req.app.locals.codigoCreado = codigoCreado;
    req.app.locals.correo = correo;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: correo,
        subject: 'Cambio de Contraseña Exitoso',
        text: `
Estimado(a) Usuario,

Te informamos que se ha realizado un cambio exitoso de tu contraseña en nuestro sistema. 
Si no has realizado este cambio, por favor contáctanos de inmediato.

Atentamente,
El Equipo de SABAH
`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Hubo un error al enviar el correo electrónico.' });
        } else {
            return res.status(200).json({ success: true, message: 'Se ha enviado un correo electrónico.' });
        }
    });
};

const cambioContrasenaVarios = async (infoEstudiantes) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    for (let i = 0; i < infoEstudiantes.length; i++) {
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: infoEstudiantes[i].correo,
            subject: 'Cambio de Contraseña Exitoso',
            text: `
Estimado(a) Usuario,

Te informamos que se ha realizado un cambio exitoso de tu contraseña en nuestro sistema. 
Si no has realizado este cambio, por favor contáctanos de inmediato.
            
Atentamente,
El Equipo de SABAH`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Hubo un error al enviar el correo electrónico.' });
            } else {
                return res.status(200).json({ success: true, message: 'Se han enviado los correo electrónico de bienvenida.' });
            }
        });
    }
};

const cambioEstadoUsuario = async (correo, estado) => {

    const estadoTexto = estado ? 'habilitado' : 'inhabilitado';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: correo,
        subject: `Cambio de Estado de Usuario`,
        text: `
Estimado(a) Usuario,

Te informamos que tu estado en nuestro sistema ha sido cambiado a ${estadoTexto}.

Si tienes alguna pregunta o inquietud, por favor contáctanos de inmediato.

Atentamente,
El Equipo de SABAH
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Hubo un error al enviar el correo electrónico.' });
        } else {
            return res.status(200).json({ success: true, message: 'Se ha enviado el correo electrónico.' });
        }
    });
};

module.exports = { cambioContrasena, cambioEstadoUsuario, cambioContrasenaVarios, nuevoUsuario, codigoVerificacion, codigoVerificacionEstudiantes, nuevaPropuesta, nuevaPropuestaVarios }