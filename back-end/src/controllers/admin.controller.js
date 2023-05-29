const bcrypt = require('bcrypt');
const pool = require('../database')

const nodemailer = require('nodemailer');

const registro = (req, res) => {
    const { nombre, contrasena, correo, estado, id_tipo_usuario } = req.body;
    bcrypt.hash(contrasena, 10, (error, hash) => {
        if (error) {
            return res.status(500).json({ error });
        }
        pool.query('INSERT INTO usuario (nombre, correo, contrasena, estado, id_tipo_usuario) VALUES ($1, $2, $3, $4,$5)',
            [nombre, correo, hash, estado, id_tipo_usuario], (error, result) => {
                if (error) {
                    return res.status(500).json({ error });
                }
                return res.status(201).json({ message: 'Usuario registrado correctamente.' });
            });
    });
};

const obtenerProyectosDesarrollo = async (req, res) => {
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE es.id=1')
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosTerminados = async (req, res) => {
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE es.id <> 1')
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosDirector = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario_rol ur ON p.id = ur.id_proyecto WHERE ur.id_usuario = $1 AND ur.id_rol = 1 AND ur.estado = true', [id]);
        const proyectos = result.rows;
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' });
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosLector = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario_rol ur ON p.id = ur.id_proyecto WHERE ur.id_usuario = $1 AND ur.id_rol = 2 AND ur.estado = true', [id]);
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosJurado = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN usuario_rol ur ON p.id = ur.id_proyecto WHERE ur.id_usuario = $1 AND ur.id_rol = 3 AND ur.estado = true', [id]);
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerTodosProyectos = async (req, res) => {
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id')
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(401).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyecto = async (req, res) => {
    const { id } = req.body;
    try {
        const error = "No se puedo encontrar toda la información relacionada al proyecto. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda."
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, m.acronimo as acronimo, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE p.id = $1', [id])
        const proyecto = result.rows
        if (result.rowCount === 1) {

            const result_director = await pool.query("SELECT u.id, u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('director') AND ur.id_proyecto = $1 AND ur.estado = true", [id])
            const usuario_director = result_director.rows[0]
            const result_lector = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('lector') AND ur.id_proyecto = $1 AND ur.estado = true", [id])
            const info_lector = result_lector.rowCount > 0 ? { "existe_lector": true, "nombre": result_lector.rows[0].nombre } : { "existe_lector": false };
            const result_jurado = await pool.query("SELECT u.nombre, u.id FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('jurado')AND ur.id_proyecto = $1 AND ur.estado = true", [id])
            const info_jurado = result_jurado.rowCount > 0 ? { "existe_jurado": true, "jurados": result_jurado.rows } : { "existe_jurado": false };
            const result_estudiantes = await pool.query('SELECT e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = true', [id])

            if (result_estudiantes.rowCount > 0 && result_director.rowCount > 0) {
                return res.json({ success: true, proyecto: proyecto[0], director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows });
            } else {
                return res.status(401).json({ success: true, message: error })
            }

        } else {
            return res.status(401).json({ success: false, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const result = await pool.query('SELECT u.id, u.nombre, u.correo, u.estado FROM usuario u WHERE u.id_tipo_usuario=2')
        const usuarios = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, usuarios });
        } else {
            return res.status(401).json({ success: true, message: 'No hay usuarios actualmente.' })
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const verUsuario = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT u.id, u.nombre, u.correo, u.estado FROM usuario u WHERE u.id = $1', [id]);
        const infoUsuario = result.rows;
        if (result.rowCount === 1) {
            return res.json({ success: true, infoUsuario });
        } else {
            return res.status(401).json({ success: false, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const rolDirector = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuario_rol WHERE id_rol=1 AND id_usuario = $1 AND estado=true', [id]);
        if (result.rowCount > 0) {
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false });
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const rolLector = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuario_rol WHERE id_rol=2 AND id_usuario = $1 AND estado=true', [id]);
        if (result.rowCount > 0) {
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false });
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const rolJurado = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuario_rol WHERE id_rol=3 AND id_usuario = $1 AND estado=true', [id]);
        if (result.rowCount > 0) {
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false });
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const agregarUsuario = async (req, res) => {
    const { nombre, correo } = req.body;
    const password = generarContrasenaAleatoria();
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await pool.query('SELECT * FROM usuario WHERE nombre=$1 AND correo = $2', [nombre, correo]);
        if (result.rowCount > 0) {
            return res.status(401).json({ success: false, message: 'El usuario ya existe.' });
        } else {
            await pool.query('INSERT INTO usuario(nombre, correo, contrasena, estado, id_tipo_usuario) VALUES($1, $2, $3, true, 2)', [nombre, correo, hashedPassword]);
            res.status(201).json({ success: true, message: 'El usuario fue registrado exitosamente.' });
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const generarContrasenaAleatoria = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let contrasena = '';

    for (let i = 0; i < 8; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        contrasena += caracteres.charAt(indice);
    }
    return contrasena;
};

const sendEmail = async (req, res) => {

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

Recuerda que puedes cambiar tu contraseña en cualquier momento accediendo a nuestro sitio web. Para hacerlo, sigue estos pasos:
    1. Ve a la página de inicio de sesión en [URL del Sitio Web].
    2. Haz clic en "Recuperar Contraseña".
    3. Se te mostrará una ventana emergente de recuperación de contraseña.
    4. Ingresa tu dirección de correo electrónico asociada a tu cuenta y haz clic en "Enviar Código".
    5. Recibirás un correo electrónico con un código de verificación para restablecer tu contraseña.
    6. Ingresa el código de verificación y haz click en "Verificar".
    7. Ingresa la nueva contraseña.
          
Si tienes alguna pregunta o necesitas ayuda adicional, no dudes en contactarnos.
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

const modificarUsuario = async (req, res) => {
    const { id, nombre, correo } = req.body;
    try {
        await pool.query('UPDATE usuario SET nombre=$1, correo=$2 WHERE id=$3', [nombre, correo, id]);
        res.status(201).json({ success: true, message: 'El usuario fue modificado exitosamente.' });

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const cambiarEstado = async (req, res) => {
    const { id, estado } = req.body;
    try {
        await pool.query('UPDATE usuario SET estado=$1 WHERE id=$2', [estado, id]);
        res.status(201).json({ success: true, message: 'Fue modificado el estado del usuario exitosamente.' });

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const modificarProyecto = async (req, res) => {
    const { id, modalidad, etapa, estado, anio, periodo } = req.body;
    try {
        await pool.query('UPDATE proyecto AS p SET anio = $2, periodo = $3, id_modalidad = m.id, id_etapa = u.id, id_estado = e.id FROM modalidad AS m, estado AS e, etapa AS u WHERE p.id = $1 AND m.nombre = $6 AND e.nombre = $5 AND u.nombre = $4', [id, anio, periodo, etapa, estado, modalidad]);
        res.status(201).json({ success: true, message: 'El proyecto fue modificado exitosamente.' });

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const modificarUsuarioRol = async (req, res) => {
    const { id, id_usuario } = req.body;
    try {
        await pool.query('UPDATE usuario_rol SET estado = false WHERE id_proyecto=$1 AND id_usuario=$2', [id, id_usuario]);
        res.status(201).json({ success: true, message: 'El director fue modificado exitosamente.' });

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const modificarLector = async (req, res) => {
    const { id, nombre_usuario } = req.body;
    try {
        await pool.query('UPDATE usuario_rol AS ur SET estado = false FROM usuario AS u WHERE ur.id_proyecto=$1 AND ur.id_usuario= u.id AND u.nombre = $2', [id, nombre_usuario]);
        res.status(201).json({ success: true, message: 'El usuario fue modificado exitosamente.' });

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const agregarUsuarioRol = async (req, res) => {
    const { estado, fecha_asignacion, id_usuario, id_rol, id_proyecto } = req.body;
    try {
        await pool.query('INSERT INTO public.usuario_rol(estado, fecha_asignacion, id_usuario, id_rol, id_proyecto) VALUES ($1, $2, $3, $4, $5)', [estado, fecha_asignacion, id_usuario, id_rol, id_proyecto]);
        res.status(201).json({ success: true, message: 'Fue registrado exitosamente.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Ha ocurrido un error en el registro. Por favor inténtelo más tarde.' });
    }
};

const agregarLector = async (req, res) => {
    const { estado, fecha_asignacion, id_rol, id_proyecto, nombre_usuario } = req.body;
    try {
        await pool.query('INSERT INTO usuario_rol(estado, fecha_asignacion, id_usuario, id_rol, id_proyecto) SELECT $1, $2, u.id, $3, $4 FROM usuario AS u WHERE u.nombre = $5', [estado, fecha_asignacion, id_rol, id_proyecto, nombre_usuario]);
        res.status(201).json({ success: true, message: 'Fue registrado exitosamente.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Ha ocurrido un error en el registro. Por favor inténtelo más tarde.' });
    }
};

const eliminarEstudiante = async (req, res) => {
    const { nombre, num_identificacion, correo } = req.body;
    try {
        await pool.query('DELETE FROM estudiante e WHERE e.nombre=$1 AND e.num_identificacion=$2 AND e.correo=$3', [nombre, num_identificacion, correo]);
        res.status(201).json({ success: true, message: 'El estudiante fue eliminado exitosamente.' });
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const agregarEstudianteProyecto = async (req, res) => {
    const { id_proyecto, nombre_estudiante } = req.body;
    try {
        await pool.query('INSERT INTO estudiante_proyecto(estado, id_proyecto, id_estudiante) SELECT true, $1, e.id FROM estudiante AS e WHERE e.nombre = $2', [id_proyecto, nombre_estudiante]);
        res.status(201).json({ success: true, message: 'Fue registrado exitosamente.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Ha ocurrido un error en el registro. Por favor inténtelo más tarde.' });
    }
};

const modificarEstudianteProyecto = async (req, res) => {
    const { id_proyecto, nombre_estudiante } = req.body;
    try {
        await pool.query('UPDATE estudiante_proyecto AS ep SET estado = false FROM estudiante AS e WHERE ep.id_proyecto=$1 AND ep.id_estudiante= e.id AND e.nombre = $2', [id_proyecto, nombre_estudiante]);
        res.status(201).json({ success: true, message: 'Fue registrado exitosamente.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Ha ocurrido un error en el registro. Por favor inténtelo más tarde.' });
    }
};

const agregarEstudiante = async (req, res) => {
    const { nombre, num_identificacion, correo } = req.body;
    try {
        await pool.query('INSERT INTO estudiante(nombre, num_identificacion, correo) VALUES ($1, $2, $3)', [nombre, num_identificacion, correo]);
        res.status(201).json({ success: true, message: 'El estudiante fue registrado exitosamente.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Ha ocurrido un error al registrar el estudiante. Por favor inténtelo más tarde.' });
    }
};

const prueba = async (req, res) => {
    const { id_proyecto } = req.body;
    try {
        console.log('inicio')
        await pool.query('DELETE FROM proyecto WHERE id=$1', [id_proyecto]);
        console.log('hola')
        res.status(201).json({ success: true, message: 'Prueba exitosa.' });
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

module.exports = { prueba, eliminarEstudiante, obtenerProyectosDirector, obtenerProyectosJurado, obtenerProyectosLector, agregarEstudiante, modificarEstudianteProyecto, agregarEstudianteProyecto, registro, agregarLector, agregarUsuarioRol, modificarLector, modificarUsuarioRol, modificarProyecto, obtenerProyecto, obtenerTodosProyectos, obtenerProyectosTerminados, obtenerProyectosDesarrollo, obtenerUsuarios, verUsuario, rolDirector, rolLector, rolJurado, agregarUsuario, sendEmail, modificarUsuario, cambiarEstado }
