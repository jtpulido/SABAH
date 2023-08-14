
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
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE es.id=1 ORDER BY nombre ASC')
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosTerminados = async (req, res) => {
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE es.id <> 1 ORDER BY nombre ASC')
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyectos actualmente' })
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
            return res.status(203).json({ success: true, message: 'No hay proyectos actualmente' });
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
            return res.status(203).json({ success: true, message: 'No hay proyectos actualmente' })
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
            return res.status(203).json({ success: true, message: 'No hay proyectos actualmente' })
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
            return res.status(203).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyecto = async (req, res) => {
    const id = req.params.proyecto_id;
    try {
        const error = "No se puedo encontrar toda la información relacionada al proyecto. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda."
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, m.acronimo as acronimo, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE p.id = $1', [id])
        const proyecto = result.rows
        if (result.rowCount === 1) {
            const result_director = await pool.query("SELECT u.id, u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('director') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const usuario_director = result_director.rows[0]
            const result_lector = await pool.query("SELECT u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('lector') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const info_lector = result_lector.rowCount > 0 ? { "existe_lector": true, "nombre": result_lector.rows[0].nombre } : { "existe_lector": false };
            const result_jurado = await pool.query("SELECT u.nombre, u.id FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('jurado')AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const info_jurado = result_jurado.rowCount > 0 ? { "existe_jurado": true, "jurados": result_jurado.rows } : { "existe_jurado": false };
            const result_estudiantes = await pool.query('SELECT e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = true', [id])
            return res.json({ success: true, proyecto: proyecto[0], director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows });

        } else {
            return res.status(203).json({ success: true, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosActivos = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN estudiante_proyecto ep ON p.id = ep.id_proyecto WHERE ep.id_estudiante=$1  AND ep.estado = true', [id]);
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosInactivos = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id JOIN estudiante_proyecto ep ON p.id = ep.id_proyecto WHERE ep.id_estudiante=$1  AND ep.estado = false', [id]);
        const proyectos = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, proyectos });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyectos actualmente' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const result = await pool.query('SELECT u.id, u.nombre, u.correo, u.estado FROM usuario u WHERE u.id_tipo_usuario=2 ORDER BY nombre ASC')
        const usuarios = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, usuarios });
        } else {
            return res.status(203).json({ success: true, message: 'No hay usuarios actualmente.' })
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerEstudiantes = async (req, res) => {
    try {
        const result = await pool.query('SELECT u.id, u.nombre, u.num_identificacion, u.correo FROM estudiante u ORDER BY nombre ASC')
        const estudiantes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, estudiantes });
        } else {
            return res.status(203).json({ success: true, message: 'No hay estudiantes actualmente.' })
        }

    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const verEstudiante = async (req, res) => {
    const { id } = req.body;
    try {
        const result = await pool.query('SELECT u.id, u.nombre, u.correo, u.num_identificacion FROM estudiante u WHERE u.id = $1', [id]);
        const estudiante = result.rows;
        if (result.rowCount === 1) {
            return res.json({ success: true, estudiante });
        } else {
            return res.status(203).json({ success: false, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
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
            return res.status(203).json({ success: false, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
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
            return res.status(203).json({ success: false });
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
            return res.status(203).json({ success: false });
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
            return res.status(203).json({ success: false });
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
            return res.status(203).json({ success: false, message: 'El usuario ya existe.' });
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

const cambioUsuarioRol = async (req, res) => {
    const { tipo, id, id_usuario_anterior, id_usuario_nuevo, id_rol } = req.body;

    try {
        // Inicio transaccion
        await pool.query('BEGIN');

        if (tipo === "anterior") {
            // Modificar usuario-rol
            await pool.query('UPDATE usuario_rol SET estado=false WHERE id_proyecto=$1 AND id_usuario=$2', [id, id_usuario_anterior]);

            // Agregar usuario-rol
            await pool.query('INSERT INTO public.usuario_rol(estado, id_usuario, id_rol, id_proyecto) VALUES (true, $1, $2, $3)', [id_usuario_nuevo, id_rol, id]);

        } else if (tipo === "nuevo") {
            // Agregar usuario-rol
            await pool.query('INSERT INTO public.usuario_rol(estado, id_usuario, id_rol, id_proyecto) VALUES (true, $1, $2, $3)', [id_usuario_nuevo, id_rol, id]);

        } else if (tipo === "solo") {
            // Modificar usuario-rol
            await pool.query('UPDATE usuario_rol SET estado=false WHERE id_proyecto=$1 AND id_usuario=$2', [id, id_usuario_anterior]);

        }

        // Confirmar transaccion
        await pool.query('COMMIT');
        res.status(201).json({ success: true, message: 'El usuario fue modificado exitosamente.' });

    } catch (error) {
        // Deshacer transaccion
        await pool.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Ha ocurrido un error al eliminar al estudiante. Por favor inténtelo más tarde.' });
    }
};

const estudiantesEliminados = async (req, res) => {
    const { estudiantesEliminados, id_proyecto } = req.body;
    try {
        // Inicio transaccion
        await pool.query('BEGIN');

        for (let i = 0; i < estudiantesEliminados.length; i++) {
            // Modificar estudiante-proyecto
            await pool.query('UPDATE estudiante_proyecto AS ep SET estado=false FROM estudiante AS e WHERE ep.id_proyecto=$1 AND ep.id_estudiante= e.id AND e.nombre = $2', [id_proyecto, estudiantesEliminados[i].nombre]);
        }

        // Confirmar transaccion
        await pool.query('COMMIT');
        res.status(201).json({ success: true, message: 'El/los estudiante(s) ha(n) sido removido(s) del proyecto satisfactoriamente.' });

    } catch (error) {
        // Deshacer transaccion
        await pool.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Ha ocurrido un error al eliminar al estudiante. Por favor inténtelo más tarde.' });
    }
};

const estudiantesNuevo = async (req, res) => {
    const { nuevosEstudiantes, id_proyecto } = req.body;
    try {
        // Inicio transaccion
        await pool.query('BEGIN');
        for (let i = 0; i < nuevosEstudiantes.length; i++) {
            // Verificar si ya existe el estudiante
            const result = await pool.query('SELECT * FROM estudiante WHERE num_identificacion=$1 OR LOWER(correo)=LOWER($2)', [nuevosEstudiantes[i].num_identificacion, nuevosEstudiantes[i].correo]);
            if (result.rowCount > 0) {
                const estudianteId = result.rows[0].id;
                const resultProyecto = await pool.query('SELECT 1 FROM estudiante_proyecto pr WHERE pr.id_estudiante = $1 AND pr.estado = true', [estudianteId]);
                if (resultProyecto.rowCount > 0) {
                    await pool.query('ROLLBACK');
                    return res.status(203).json({ success: false, message: 'El estudiante con número de identificación ' + nuevosEstudiantes[i].num_identificacion + ' ya tiene un proyecto activo. No es posible asignarlo a otro proyecto.' });
                } else {
                    await pool.query('INSERT INTO estudiante_proyecto(id_proyecto, id_estudiante) VALUES ( $1, $2)', [id_proyecto, estudianteId]);
                }
            } else {
                const insertEstudianteResult = await pool.query('INSERT INTO estudiante(nombre, num_identificacion, correo) VALUES ($1, $2, $3) RETURNING id', [nuevosEstudiantes[i].nombre, nuevosEstudiantes[i].num_identificacion, nuevosEstudiantes[i].correo]);
                const nuevoEstudianteId = insertEstudianteResult.rows[0].id;
                await pool.query('INSERT INTO estudiante_proyecto(id_proyecto, id_estudiante) VALUES ($1, $2)', [id_proyecto, nuevoEstudianteId]);
            }
        }
        // Confirmar transaccion
        await pool.query('COMMIT');
        res.status(201).json({ success: true, message: 'Estudiante(s) registrado(s) exitosamente.' });
    } catch (error) {
        // Deshacer transaccion
        await pool.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Ha ocurrido un error al registrar el estudiante. Por favor inténtelo más tarde.' });
    }
};

module.exports = { estudiantesNuevo, obtenerProyectosInactivos, obtenerProyectosActivos, verEstudiante, obtenerEstudiantes, cambioUsuarioRol, estudiantesEliminados, obtenerProyectosDirector, obtenerProyectosJurado, obtenerProyectosLector, registro, modificarProyecto, obtenerProyecto, obtenerTodosProyectos, obtenerProyectosTerminados, obtenerProyectosDesarrollo, obtenerUsuarios, verUsuario, rolDirector, rolLector, rolJurado, agregarUsuario, sendEmail, modificarUsuario, cambiarEstado }
