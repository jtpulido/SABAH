const pool = require('../database')
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const nuevoUsuario = async (req) => {
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

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const codigoVerificacion = async (req) => {
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

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const codigoVerificacionEstudiantes = async (req) => {
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

    const recipients = [];
    correos.forEach((estudiante) => {
        recipients.push(estudiante.correo);
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients.join(','),
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

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const nuevaPropuesta = async (nombre, nombre_estudiante, codigo, correo) => {
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
Hola ${nombre_estudiante},

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

Atentamente,
El Equipo de SABAH
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const nuevaPropuestaDirector = async (nombre, codigo, correo) => {
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
        subject: 'Nuevo Proyecto de Grado Asignado',
        text: `
Te informamos que has sido asignado como director a un nuevo proyecto. A continuación, te proporcionamos los detalles del proyecto:

Nombre del proyecto: ${nombre}
Código del proyecto: ${codigo}
  
Te invitamos a acceder al sistema para acceder a más información y realizar las acciones necesarias para el éxito del proyecto.

Si tienes alguna pregunta o necesitas ayuda adicional, no dudes en contactarnos.

Atentamente,
El Equipo de SABAH
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const cambioContrasena = async (req) => {
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

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const cambioContrasenaVarios = async (infoEstudiantes) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const recipients = [];
    infoEstudiantes.forEach((estudiante) => {
        recipients.push(estudiante.correo);
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients.join(','),
        subject: 'Cambio de Contraseña Exitoso',
        text: `
Estimado(a) Usuario,

Te informamos que se ha realizado un cambio exitoso de tu contraseña en nuestro sistema. 
Si no has realizado este cambio, por favor contáctanos de inmediato.
            
Atentamente,
El Equipo de SABAH`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
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

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const mailCambioCodigo = async (correos, codigo, responsable) => {
    const fechaHoraCambio = new Date();
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const recipients = [];
    correos.forEach((estudiante) => {
        recipients.push(estudiante.correo);
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients.join(','),
        subject: 'Cambio de Código de Proyecto',
        text: `
Estimado(a) Usuario,

Te informamos que se ha realizado un cambio exitoso en el código de tu proyecto en nuestro sistema. Por favor tener en cuenta la siguiente información: 
            
    Nuevo código: ${codigo}
    Fecha y hora del cambio: ${fechaHoraCambio.toLocaleString()}
    Responsable: ${responsable}
                
Por favor, revisa este cambio en el sistema para asegurarte de que sea correcto.
                        
Atentamente,
El Equipo de SABAH`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const mailCambioNombreProyecto = async (correos, nombre, responsable) => {
    const fechaHoraCambio = new Date();
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const recipients = [];
    correos.forEach((estudiante) => {
        recipients.push(estudiante.correo);
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients.join(','),
        subject: 'Cambio de Nombre del Proyecto',
        text: `
Estimado(a) Usuario,

Te informamos que se ha realizado un cambio exitoso en el nombre de tu proyecto en nuestro sistema. Por favor tener en cuenta la siguiente información: 

    Nuevo nombre: ${nombre}
    Fecha y hora del cambio: ${fechaHoraCambio.toLocaleString()}
    Responsable: ${responsable}
    
Por favor, revisa este cambio en el sistema para asegurarte de que sea correcto.
            
Atentamente,
El Equipo de SABAH`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const mailCambioEstadoProyecto = async (correos, estado, responsable) => {
    const fechaHoraCambio = new Date();
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const recipients = [];
    correos.forEach((estudiante) => {
        recipients.push(estudiante.correo);
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients.join(','),
        subject: 'Cambio de Estado del Proyecto',
        text: `
Estimado(a) Usuario,

Te informamos que se ha realizado un cambio exitoso en el estado de tu proyecto en nuestro sistema. Por favor tener en cuenta la siguiente información: 

    Nuevo estado: ${estado}
    Fecha y hora del cambio: ${fechaHoraCambio.toLocaleString()}
    Responsable: ${responsable}
    
Por favor, revisa este cambio en el sistema para asegurarte de que sea correcto.
            
Atentamente,
El Equipo de SABAH`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const mailCambioEtapaProyecto = async (correos, etapa, responsable) => {
    const fechaHoraCambio = new Date();
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const recipients = [];
    correos.forEach((estudiante) => {
        recipients.push(estudiante.correo);
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients.join(','),
        subject: 'Cambio de Etapa del Proyecto',
        text: `
Estimado(a) Usuario,

Te informamos que se ha realizado un cambio exitoso en la etapa de tu proyecto en nuestro sistema. Por favor tener en cuenta la siguiente información: 

    Nueva etapa: ${etapa}
    Fecha y hora del cambio: ${fechaHoraCambio.toLocaleString()}
    Responsable: ${responsable}
    
Por favor, revisa este cambio en el sistema para asegurarte de que sea correcto.
            
Atentamente,
El Equipo de SABAH`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const mailCambioFechaGraduacionProyecto = async (correo, fecha_grado, responsable) => {
    const fechaHoraCambio = new Date();
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
        subject: 'Cambio de Fecha de Graduación',
        text: `
Estimado(a) Usuario,

Te informamos que se ha realizado un cambio exitoso en tu fecha de graduación en nuestro sistema. Por favor tener en cuenta la siguiente información: 

    Nueva fecha de graduación: ${fecha_grado}
    Fecha y hora del cambio: ${fechaHoraCambio.toLocaleString()}
    Responsable: ${responsable}
    
Por favor, revisa este cambio en el sistema para asegurarte de que sea correcto.
            
Atentamente,
El Equipo de SABAH`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const nuevoUsuarioRol = (infoNuevo, id_rol) => {
    const rol = { 1: 'Director', 2: 'Lector', 3: 'Jurado' }[id_rol];

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: infoNuevo.correo,
        subject: 'Vinculación Exitosa a Rol en Proyecto',
        text: `
Estimado(a) ${infoNuevo.nombre_usuario},

Te informamos que has sido vinculado(a) exitosamente al rol de ${rol} en el proyecto de grado con la siguiente información:

    Nombre: ${infoNuevo.nombre}
    Código: ${infoNuevo.codigo}
    Modalidad: ${infoNuevo.nombre_modalidad}
    Estado: ${infoNuevo.nombre_estado}

Te recomendamos revisar la documentación del proyecto y ponerte en contacto con el equipo para conocer más sobre tu rol y responsabilidades. Si tienes alguna pregunta o necesitas orientación, no dudes en comunicarte con nosotros.

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

const anteriorUsuarioRol = (infoAnterior, id_rol) => {
    const rol = { 1: 'Director', 2: 'Lector', 3: 'Jurado' }[id_rol];

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: infoAnterior.correo,
        subject: 'Desvinculación de Usuario de Rol en Proyecto',
        text: `
Estimado(a) ${infoAnterior.nombre_usuario},

Te informamos que has sido desvinculado exitosamente del rol de ${rol} en el proyecto de grado con la siguiente información:

    Nombre: ${infoAnterior.nombre}
    Código: ${infoAnterior.codigo}
    Modalidad: ${infoAnterior.nombre_modalidad}
    Estado: ${infoAnterior.nombre_estado}

A partir de este momento, ya no tendrás acceso a las funcionalidades y permisos asociados a este rol en el proyecto.

Por favor, ten en cuenta lo siguiente:

    - Si tienes alguna pregunta o inquietud sobre esta desvinculación, te recomendamos ponerte en contacto con el administrador del sistema o el equipo de soporte.
    - Si consideras que esta desvinculación ha sido realizada por error, por favor, comunica esto a la brevedad para que podamos tomar las medidas necesarias.

Agradecemos tu colaboración y participación en el proyecto hasta el momento. Esperamos que esta desvinculación no afecte negativamente tus objetivos y actividades relacionadas con el proyecto.

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

const removerEstudianteProyecto = (infoEstudiante) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: infoEstudiante.correo,
        subject: 'Desvinculación a Proyecto de Grado',
        text: `
Estimado(a) ${infoEstudiante.nombre_estudiante},

Te informamos que has sido desvinculado exitosamente del siguiente proyecto de grado:

    Nombre: ${infoEstudiante.nombre}
    Código: ${infoEstudiante.codigo}
    Modalidad: ${infoEstudiante.nombre_modalidad}
    Estado: ${infoEstudiante.nombre_estado}

Queremos agradecerte sinceramente por tu participación y contribuciones hasta la fecha. Entendemos que has dedicado tiempo y esfuerzo a este proyecto, y apreciamos tus contribuciones. Si tienes alguna pregunta o inquietud sobre esta decisión, no dudes en ponerte en contacto con nosotros. Estamos aquí para proporcionarte cualquier información adicional que puedas necesitar.
    
Te deseamos lo mejor en tus futuros proyectos académicos y profesionales. Agradecemos tu comprensión y cooperación en este asunto.
    
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

const nuevoEstudianteProyecto = (infoEstudiante, nombre, correo) => {
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
        subject: 'Vinculación Exitosa al Proyecto de Grado',
        text: `
Estimado(a) ${nombre},

Le informamos que ha sido vinculado exitosamente al siguiente proyecto de grado:

    Nombre: ${infoEstudiante.nombre}
    Código: ${infoEstudiante.codigo}
    Modalidad: ${infoEstudiante.nombre_modalidad}
    Estado: ${infoEstudiante.nombre_estado}

Su participación en este proyecto es muy valiosa y estamos emocionados de trabajar contigo en este emocionante camino académico. Creemos que su experiencia y habilidades serán una gran contribución al éxito del proyecto. Por favor, asegúrase de revisar la información y estar preparado para participar en las reuniones y actividades del proyecto. 

Si tiene alguna pregunta o necesitas más detalles, no dudes en ponerte en contacto con nosotros.

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

const nuevaReunionEstudiantes = () => {

};

const nuevaReunionUser = async (nombre, fecha, enlace, proyecto, rol, nombre_usuario, correo_usuario, infoCorreos) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const recipients = [];
    recipients.push(correo_usuario);
    infoCorreos.forEach((estudiante) => {
        recipients.push(estudiante.correo);
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients.join(','),
        subject: 'Nueva Reunión Agendada',
        text: `
Estimado(a) Usuario,
    
Le confirmamos que se ha creado una nueva reunión con los siguientes detalles:
    
- Nombre: ${nombre}
- Fecha: ${fecha}
- Enlace: ${enlace}
- Proyecto: ${proyecto}
- Invitado: ${rol} ${nombre_usuario}

Ten en cuenta que después de completar la reunión, el proyecto tendrá la opción de generar una acta de reunión para registrar los detalles importantes discutidos y compartirlos con los demás participantes. Asimismo, los directores, lectores y jurados tendrán la opción de editar su asistencia.
    
Por favor, asegúrate de marcar esta fecha y hora en su calendario. Esperamos contar con su presencia en la reunión y agradecemos tu cooperación.
    
Atentamente,
El Equipo de SABAH
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const cancelarReunionUser = async (nombre, fecha, enlace, proyecto, rol, nombre_usuario, correo_usuario, infoCorreos, justificacion) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const recipients = [];
    recipients.push(correo_usuario);
    infoCorreos.forEach((estudiante) => {
        recipients.push(estudiante.correo);
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients.join(','),
        subject: 'Cancelación de Reunión',
        text: `
Estimado(a) Usuario,
    
Le informamos que se ha cancelado una reunión. A continuación, se detallan los aspectos clave:
    
- Nombre: ${nombre}
- Fecha: ${fecha}
- Enlace: ${enlace}
- Proyecto: ${proyecto}
- Invitado: ${rol} ${nombre_usuario}
- Justificación: ${justificacion}

Esperamos poder reprogramarla en una fecha futura y te mantendremos informado(a) sobre los detalles.

Disculpa las molestias y gracias por tu comprensión.
    
Atentamente,
El Equipo de SABAH
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const cambioAsistencia = async (nombre, fecha, proyecto, rol, nombre_usuario, correo_usuario, asistencia) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: correo_usuario,
        subject: 'Cambio de Asistencia',
        text: `
Estimado(a) ${nombre_usuario},
    
Le confirmamos que se ha actualizado su estado de asistencia de la siguiente reunión:
    
- Nombre: ${nombre}
- Fecha: ${fecha}
- Proyecto: ${proyecto}
- Asistencia: ${asistencia}
- Rol: ${rol}

Atentamente,
El Equipo de SABAH
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Se ha enviado el correo electrónico.' };
    } catch (error) {
        return { success: false, message: 'Hubo un error al enviar el correo electrónico.' };
    }
};

const editarReunionUser = async (nombre, fecha, enlace, proyecto, rol, nombre_usuario, correo_usuario, infoCorreos) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const recipients = [];
    recipients.push(correo_usuario);
    infoCorreos.forEach((estudiante) => {
        recipients.push(estudiante.correo);
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients.join(','),
        subject: 'Actualización de Reunión Pendiente',
        text: `
Estimado(a) Usuario,
    
Le informamos que se ha actualizado la información de una reunión pendiente.
    
Los cambios realizados en la reunión pueden incluir actualizaciones en la fecha, hora, nombre y/o enlace. Queremos asegurarnos de que esté al tanto de estos cambios para que pueda estar preparado/a.

A continuación se detalla la información actualizada de la reunión: 

- Nombre: ${nombre}
- Fecha: ${fecha}
- Enlace: ${enlace}
- Proyecto: ${proyecto}
- Invitado(s): ${rol} ${nombre_usuario}

Por favor, revísalos con atención y asegúrate de que estos cambios sean convenientes. Si tienes alguna pregunta o necesitas aclaraciones adicionales, no dudes en ponerte en contacto con nosotros.
    
Atentamente,
El Equipo de SABAH
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const nuevaSolicitudUser = async (tipo, descripcion, proyecto, nombre_usuario, correo_usuario, infoCorreos) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const recipients = [];
    recipients.push('dbenavidesg@unbosque.edu.co'); //opcionesdegrado.sistemas@unbosque.edu.co
    recipients.push(correo_usuario);
    infoCorreos.forEach((estudiante) => {
        recipients.push(estudiante.correo);
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients.join(','),
        subject: 'Nueva Solicitud',
        text: `
Estimado(a) Usuario,
    
Le informamos que se ha registrado una nueva solicitud. A continuación, se detallan los aspectos clave:
    
- Proyecto: ${proyecto}
- Tipo: ${tipo}
- Descripción: ${descripcion}
- Responsable: ${nombre_usuario}

Si desea acceder a más detalles sobre esta solicitud, pueden hacerlo a través del sistema de SABAH en la sección de solicitudes.

Atentamente,
El Equipo de SABAH
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false };
    }

};

module.exports = { nuevaSolicitudUser, editarReunionUser, cambioAsistencia, nuevaReunionEstudiantes, cancelarReunionUser, nuevaReunionUser, removerEstudianteProyecto, nuevoEstudianteProyecto, mailCambioEstadoProyecto, nuevoUsuarioRol, anteriorUsuarioRol, mailCambioFechaGraduacionProyecto, mailCambioEtapaProyecto, mailCambioCodigo, mailCambioNombreProyecto, cambioContrasena, cambioEstadoUsuario, cambioContrasenaVarios, nuevoUsuario, codigoVerificacion, codigoVerificacionEstudiantes, nuevaPropuesta, nuevaPropuestaDirector }