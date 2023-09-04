const bcrypt = require('bcrypt');
const pool = require('../database')

const nodemailer = require('nodemailer');

const { mailAsignarCodigo, cambioEstadoUsuario, nuevoUsuarioAdmin, removerEstudianteProyecto, nuevoEstudianteProyecto, nuevoUsuarioRol, anteriorUsuarioRol, mailCambioCodigo, mailCambioNombreProyecto, mailCambioEstadoProyecto, mailCambioEtapaProyecto, mailCambioFechaGraduacionProyecto } = require('../controllers/mail.controller')

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
        await pool.query(
            `SELECT 
            p.id, 
            p.codigo, 
            p.nombre, 
            he.anio,  
            he.periodo, 
            m.acronimo as modalidad, 
            e.nombre as etapa, 
            es.nombre as estado 
            FROM proyecto p 
            JOIN modalidad m ON p.id_modalidad = m.id 
            JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id
            JOIN estado es ON p.id_estado = es.id 
            WHERE es.nombre NOT IN ('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado')
            AND he.fecha_cambio = (
                SELECT MAX(fecha_cambio)
                FROM historial_etapa
                WHERE id_proyecto = p.id
            )`
            , async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                }
                if (result.rowCount > 0) {
                    return res.json({ success: true, proyectos: result.rows });
                } else if (result.rowCount <= 0) {
                    return res.status(203).json({ success: true, message: 'No hay proyectos en desarrollo actualmente.' })
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosTerminados = async (req, res) => {
    try {
        await pool.query(
            `SELECT
            p.id,
            p.codigo,
            p.nombre,
            he.anio,
            he.periodo,
            m.acronimo as modalidad,
            e.nombre as etapa,
            es.nombre as estado
            FROM proyecto p 
            JOIN modalidad m ON p.id_modalidad = m.id 
            JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id
            JOIN estado es ON p.id_estado = es.id 
            WHERE es.nombre IN ('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado')
            AND he.fecha_cambio = (
                SELECT MAX(fecha_cambio)
                FROM historial_etapa
                WHERE id_proyecto = p.id
            )`
            , async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                }
                if (result.rowCount > 0) {
                    return res.json({ success: true, proyectos: result.rows });
                } else if (result.rowCount <= 0) {
                    return res.status(203).json({ success: true, message: 'No hay proyectos terminados actualmente.' })
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosDirector = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT p.id, p.codigo, p.nombre, he.anio, he.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN usuario_rol ur ON p.id = ur.id_proyecto 
        WHERE ur.id_usuario = $1 AND ur.id_rol = 1 AND ur.estado = true AND
            he.fecha_cambio = (
              SELECT MAX(fecha_cambio)
              FROM historial_etapa
              WHERE id_proyecto = p.id
          )`, [id]);
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
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT p.id, p.codigo, p.nombre, he.anio, he.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN usuario_rol ur ON p.id = ur.id_proyecto 
        WHERE ur.id_usuario = $1 AND ur.id_rol = 2 AND ur.estado = true AND
            he.fecha_cambio = (
              SELECT MAX(fecha_cambio)
              FROM historial_etapa
              WHERE id_proyecto = p.id
          )`, [id]);
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
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT p.id, p.codigo, p.nombre, he.anio, he.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p 
        JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
            JOIN estado es ON p.id_estado = es.id 
            JOIN usuario_rol ur ON p.id = ur.id_proyecto 
            WHERE ur.id_usuario = $1 AND ur.id_rol = 3 AND ur.estado = true AND
            he.fecha_cambio = (
              SELECT MAX(fecha_cambio)
              FROM historial_etapa
              WHERE id_proyecto = p.id
          )`, [id]);
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
        const result = await pool.query(`SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, e.nombre as etapa, es.nombre as estado 
        FROM proyecto p 
        JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id WHERE
        he.fecha_cambio = (
              SELECT MAX(fecha_cambio)
              FROM historial_etapa
              WHERE id_proyecto = p.id
          )`)
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
        const result = await pool.query(`
        SELECT 
            p.id, 
            p.codigo, 
            p.nombre, 
            he.anio as anio,
            he.periodo as periodo,
            m.nombre as modalidad, 
            m.acronimo as acronimo, 
            e.nombre as etapa, 
            e.id as id_etapa,
            es.nombre as estado,
            es.id as id_estado
        FROM proyecto p 
        JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id
        JOIN estado es ON p.id_estado = es.id 
        WHERE p.id = $1 AND
        he.fecha_cambio = (
          SELECT MAX(fecha_cambio)
          FROM historial_etapa
          WHERE id_proyecto = p.id
      )
    `, [id])
        const proyecto = result.rows
        if (result.rowCount === 1) {
            const result_director = await pool.query("SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, u.id AS id_usuario, ur.id_proyecto, u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('director') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const usuario_director = result_director.rows[0]
            const result_lector = await pool.query("SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, u.id AS id_usuario, ur.id_proyecto, u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('lector') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const info_lector = result_lector.rowCount > 0 ? { "existe_lector": true, "lector": result_lector.rows[0] } : { "existe_lector": false };
            const result_jurado = await pool.query("SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, u.id AS id_usuario, ur.id_proyecto, u.nombre, u.id FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('jurado')AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const info_jurado = result_jurado.rowCount > 0 ? { "existe_jurado": true, "jurados": result_jurado.rows } : { "existe_jurado": false };
            const result_estudiantes = await pool.query(`SELECT ROW_NUMBER() OVER (ORDER BY ep.id) AS id, ep.id AS id_estudiante_proyecto, e.id AS id_estudiante, ep.id_proyecto, e.nombre, e.correo, e.num_identificacion, TO_CHAR(e.fecha_grado, 'DD-MM-YYYY') AS fecha_grado FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = TRUE`, [id])
            const result_cliente = await pool.query("SELECT c.nombre_empresa, c.nombre_repr, c.correo_repr FROM cliente c, proyecto p WHERE p.id = c.id_proyecto AND p.id = $1;", [id])
            const info_cliente = result_cliente.rowCount > 0 ? { "existe_cliente": true, "empresa": result_cliente.rows[0].nombre_empresa, "representante": result_cliente.rows[0].nombre_repr, "correo": result_cliente.rows[0].correo_repr } : { "existe_cliente": false };
            return res.json({ success: true, proyecto: proyecto[0], director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows, cliente: info_cliente });

        } else {
            return res.status(203).json({ success: true, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerProyectosActivos = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT p.id, p.codigo, p.nombre, he.anio, he.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN estudiante_proyecto ep ON p.id = ep.id_proyecto
		JOIN estudiante est ON ep.id_estudiante = est.id
        WHERE ep.id_estudiante = $1 AND ep.estado = true AND
            he.fecha_cambio = (
              SELECT MAX(fecha_cambio)
              FROM historial_etapa
              WHERE id_proyecto = p.id
          )`, [id]);
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
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT DISTINCT p.id, p.codigo, p.nombre, he.anio, he.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN estudiante_proyecto ep ON p.id = ep.id_proyecto
        WHERE ep.id_estudiante = $1 AND ep.estado = false AND
            he.fecha_cambio = (
              SELECT MAX(fecha_cambio)
              FROM historial_etapa
              WHERE id_proyecto = p.id
          )`, [id]);
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
    const { id } = req.params;
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
    const { id } = req.params;
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
    const { id } = req.params;
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
    const { id } = req.params;
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
    const { id } = req.params;
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
        await pool.query('BEGIN');
        const result = await pool.query('SELECT * FROM usuario WHERE nombre=$1 OR correo = $2', [nombre, correo]);
        if (result.rowCount > 0) {
            return res.status(203).json({ success: false, message: 'El usuario ya existe.' });
        } else {
            await pool.query('INSERT INTO usuario(nombre, correo, contrasena, estado, id_tipo_usuario) VALUES($1, $2, $3, true, 2)', [nombre, correo, hashedPassword]);
            const mail = await nuevoUsuarioAdmin(nombre, correo);
            if (mail.success) {
                await pool.query('COMMIT');
                const usuario = await pool.query(`SELECT * FROM usuario WHERE nombre=$1 AND correo = $2`, [nombre, correo])
                res.status(201).json({ success: true, message: 'El usuario fue registrado exitosamente.', usuario });
            } else {
                await pool.query('ROLLBACK');
                res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
            }
        }
    } catch (error) {
        await pool.query('ROLLBACK');
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
    try {
        const { proyecto, nuevo_estado } = req.body;
        const { id, acronimo, etapa, estado } = proyecto;

        if (estado === 'Rechazado' || estado === 'Cancelado' || estado === 'Terminado' || estado === 'Aprobado comité') {
            return res.status(203).json({ success: false, message: 'No se puede cambiar la etapa/estado de un proyecto que ya termino (Terminado, Aprobado comité, Rechazado o Cancelado).' });
        }

        if (acronimo === 'COT') {
            if (nuevo_estado.nombre !== 'En desarrollo' && nuevo_estado.nombre !== 'Aprobado comité' && nuevo_estado.nombre !== 'Rechazado' && nuevo_estado.nombre !== 'Cancelado') {
                return res.status(203).json({ success: false, message: 'Los estados válidos para la modalidad COT son: En desarrollo, Aprobado comité, Rechazado, Cancelado.' });
            }
        }
        if (acronimo !== 'COT' && nuevo_estado.nombre === 'Aprobado comité') {
            return res.status(203).json({ success: false, message: 'El estado Aprobado comité solo es valida para la modalidad COT.' });

        }

        if (etapa === 'Propuesta') {
            if (nuevo_estado.nombre !== 'En desarrollo' && nuevo_estado.nombre !== 'Aprobado comité' && nuevo_estado.nombre !== 'Aprobado propuesta' && nuevo_estado.nombre !== 'Rechazado' && nuevo_estado.nombre !== 'Cancelado') {
                return res.status(203).json({ success: false, message: 'Los estados válidos para Propuesta son: En desarrollo, Aprobado, Terminado, Rechazado, Cancelado.' });
            }
        }


        if (etapa === 'Proyecto de grado 1') {
            if (nuevo_estado.nombre !== 'En desarrollo' && nuevo_estado.nombre !== 'Aprobado proyecto de grado 1' && nuevo_estado.nombre !== 'Rechazado' && nuevo_estado.nombre !== 'Cancelado') {
                return res.status(203).json({ success: false, message: 'Los estados válidos para Proyecto de grado 2 son: En desarrollo, Aprobado, Terminado, Rechazado, Cancelado.' });
            }
        }
        if (etapa === 'Proyecto de grado 2') {
            if (nuevo_estado.nombre !== 'En desarrollo' && nuevo_estado.nombre !== 'Aprobado' && nuevo_estado.nombre !== 'Rechazado' && nuevo_estado.nombre !== 'Terminado' && nuevo_estado.nombre !== 'Cancelado') {
                return res.status(203).json({ success: false, message: 'Los estados válidos para Proyecto de grado 2 son: En desarrollo, Aprobado, Terminado, Rechazado, Cancelado.' });
            }
            if (nuevo_estado.nombre === 'Terminado') {
                return res.status(203).json({ success: false, message: 'Para cambiar a estado Terminado debe realizarlo por medio del formulario y estar en estado Aprobado.' });
            }
        }
        await pool.query('BEGIN');
        await pool.query(
            `
            UPDATE proyecto
            SET id_estado = $1
            WHERE id = $2
        `,
            [nuevo_estado.id, id], async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error al realizar el cambio de estado." });
                }
                if (result) {
                    const resultCorreos = await pool.query('SELECT e.correo FROM estudiante_proyecto ep JOIN estudiante e ON ep.id_estudiante = e.id WHERE id_proyecto=$1 and estado=true', [id]);
                    const correos = resultCorreos.rows;
                    await mailCambioEstadoProyecto(correos, nuevo_estado.nombre, 'Comité de Opciones de Grado - Ingeniería de Sistemas');
                    await pool.query('COMMIT')
                    return res.json({ success: true })
                }
            })
    } catch (error) {
        await pool.query('ROLLBACK');
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
    try {
        const { tipo, id_proyecto, id_usuario_anterior, id_usuario_nuevo, id_rol } = req.body;
        console.log(id_usuario_anterior)
        console.log(id_usuario_nuevo)
        const query = `
            SELECT
                ROW_NUMBER() OVER (ORDER BY ur.id) AS id,
                ur.id AS id_usuario_rol,
                u.id AS id_usuario,
                ur.id_proyecto,
                u.nombre,
                u.id AS otro_id
            FROM
                usuario u
            INNER JOIN
                usuario_rol ur ON u.id = ur.id_usuario
            INNER JOIN
                rol r ON ur.id_rol = r.id
            WHERE
                r.id = $2 AND ur.id_proyecto = $1 AND ur.estado = TRUE
        `;

        await pool.query('BEGIN');
        // Validar que el director no sea igual al jurado o lector y viceversa
        if (id_rol === 2 || id_rol === 3) {
            const validationQuery = ` SELECT 1 FROM usuario_rol WHERE id_usuario = $1 AND id_proyecto = $2 AND id_rol=1 AND estado = TRUE `;
            const validationResult = await pool.query(validationQuery, [id_usuario_nuevo, id_proyecto]);
            if (validationResult.rows.length > 0) {
                await pool.query('ROLLBACK');
                return res.status(203).json({ success: false, message: 'El jurado o lector no puede ser igual al director.' });
            }
        } else if (id_rol === 1) {
            const validationQuery = ` SELECT 1 FROM usuario_rol WHERE id_usuario = $1 AND id_proyecto = $2 AND id_rol IN (2, 3) AND estado = TRUE`;
            const validationResult = await pool.query(validationQuery, [id_usuario_nuevo, id_proyecto]);
            if (validationResult.rows.length > 0) {
                await pool.query('ROLLBACK');
                return res.status(203).json({ success: false, message: 'El director no puede ser parte de los lectores o jurados del proyecto.' });
            }
        }
        // Validar que los dos jurado no sean iguales
        if (id_rol === 3) {
            const additionalValidationQuery = ` SELECT 1 FROM usuario_rol WHERE id_usuario = $1 AND id_rol = 3 AND id_proyecto = $2 AND estado = TRUE `;
            const additionalValidationResult = await pool.query(additionalValidationQuery, [id_usuario_nuevo, id_proyecto]);
            if (additionalValidationResult.rows.length > 0) {
                await pool.query('ROLLBACK');
                return res.status(203).json({ success: false, message: 'El usuario ya es uno de los jurados.' });
            }
        }
        if (tipo === "anterior") {
            // Anterior
            await pool.query('UPDATE usuario_rol SET estado=false WHERE id_proyecto=$1 AND id_usuario=$2 AND id_rol=$3', [id_proyecto, id_usuario_anterior, id_rol]);
            const resultAnterior = await pool.query(`SELECT pr.nombre, pr.codigo, m.nombre AS nombre_modalidad, e.nombre AS nombre_estado, u.nombre AS nombre_usuario, u.correo FROM proyecto pr 
            JOIN modalidad m ON m.id = pr.id_modalidad
            JOIN estado e ON e.id = pr.id_estado
            JOIN usuario_rol ur ON ur.id_proyecto = pr.id
            JOIN usuario u ON ur.id_usuario = u.id
            WHERE id_proyecto = $1 AND id_usuario = $2`, [id_proyecto, id_usuario_anterior]);
            const infoAnterior = resultAnterior.rows[0];
            await anteriorUsuarioRol(infoAnterior, id_rol)

            // Nuevo
            await pool.query('INSERT INTO usuario_rol(estado, id_usuario, id_rol, id_proyecto) VALUES (true, $1, $2, $3)', [id_usuario_nuevo, id_rol, id_proyecto]);
            const resultInsert = await pool.query(`SELECT pr.nombre, pr.codigo, m.nombre AS nombre_modalidad, e.nombre AS nombre_estado, u.nombre AS nombre_usuario, u.correo FROM proyecto pr 
            JOIN modalidad m ON m.id = pr.id_modalidad
            JOIN estado e ON e.id = pr.id_estado
            JOIN usuario_rol ur ON ur.id_proyecto = pr.id
            JOIN usuario u ON ur.id_usuario = u.id
            WHERE id_proyecto = $1 AND id_usuario = $2`, [id_proyecto, id_usuario_nuevo]);
            const infoNuevo = resultInsert.rows[0];
            await nuevoUsuarioRol(infoNuevo, id_rol)

            await pool.query('COMMIT');
            const result = await pool.query(query, [id_proyecto, id_rol]);
            return res.json({ success: true, message: 'El cambio se ha efectuado con éxito, y todas las partes involucradas han sido notificadas.', usuarios: result.rows });

        } else if (tipo === "nuevo") {
            await pool.query('INSERT INTO usuario_rol(estado, id_usuario, id_rol, id_proyecto) VALUES (true, $1, $2, $3)', [id_usuario_nuevo, id_rol, id_proyecto]);

            const resultInsert = await pool.query(`SELECT pr.nombre, pr.codigo, m.nombre AS nombre_modalidad, e.nombre AS nombre_estado, u.nombre AS nombre_usuario, u.correo FROM proyecto pr 
            JOIN modalidad m ON m.id = pr.id_modalidad
            JOIN estado e ON e.id = pr.id_estado
            JOIN usuario_rol ur ON ur.id_proyecto = pr.id
            JOIN usuario u ON ur.id_usuario = u.id
            WHERE id_proyecto = $1 AND id_usuario = $2`, [id_proyecto, id_usuario_nuevo]);
            const infoNuevo = resultInsert.rows[0];
            await nuevoUsuarioRol(infoNuevo, id_rol);

            await pool.query('COMMIT');
            const result = await pool.query(query, [id_proyecto, id_rol]);

            return res.json({ success: true, message: 'El usuario ha sido asignado y se le ha notificado con éxito.', usuarios: result.rows });
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        console.log(error)
        res.status(500).json({ success: false, message: 'Ha ocurrido un error al cambiar o asignar el usuario. Por favor inténtelo más tarde.' });
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

const asignarCodigoProyecto = async (req, res) => {
    try {
        const { id, acronimo, anio, periodo } = req.body;
        await pool.query(
            "SELECT MAX(CAST(SUBSTRING(p.codigo, LENGTH(m.acronimo)+2+4+2+2) AS INTEGER))  FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id WHERE p.codigo LIKE CONCAT($1::text, '_', $2::text, '-', $3::text, '-%')",
            [acronimo, anio, periodo], async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                } else if (result.rowCount === 1) {
                    const codigo = result.rows[0].max > 0 ? `${acronimo}_${anio}-${periodo}-${(result.rows[0].max + 1).toString().padStart(2, '0')}` : `${acronimo}_${anio}-${periodo}-01`;
                    await pool.query(
                        "UPDATE proyecto SET codigo = $1 WHERE id = $2",
                        [codigo, id], async (error, result) => {
                            if (error) {
                                if (error.code === "23505" && error.constraint === "proyecto_codigo_key") {
                                    return res.status(203).json({ success: false, message: "El código ya está en uso, inténtelo más tarde." });
                                } else {
                                    return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                                }
                            }
                            if (result) {
                                const resultCorreos = await pool.query('SELECT e.correo FROM estudiante_proyecto ep JOIN estudiante e ON ep.id_estudiante = e.id WHERE id_proyecto=$1 and estado=true', [id]);
                                const correos = resultCorreos.rows;
                                await mailCambioCodigo(correos, codigo, 'Comité de Opciones de Grado - Ingeniería de Sistemas');
                                return res.json({ success: true, codigo })
                            }
                        })
                } else {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const removerEstudiante = async (req, res) => {
    try {
        const id_estudiante_proyecto = req.params.id_estudiante;
        const id_proyecto = req.params.id_proyecto;
        const query = 'UPDATE estudiante_proyecto SET estado=false WHERE id=$1';
        const values = [id_estudiante_proyecto];

        await pool.query('BEGIN');
        await pool.query(query, values, async (error) => {
            if (error) {
                return res.status(502).json({ success: false, message: "Error al retirar el estudiante." });
            }

            const resultEstudiante = await pool.query(`SELECT pr.nombre, pr.codigo, m.nombre AS nombre_modalidad, e.nombre AS nombre_estado, est.nombre AS nombre_estudiante, est.correo
            FROM proyecto pr 
            JOIN modalidad m ON m.id = pr.id_modalidad
            JOIN estado e ON e.id = pr.id_estado
            JOIN estudiante_proyecto ep ON ep.id_proyecto = pr.id
            JOIN estudiante est ON ep.id_estudiante = est.id
            WHERE id_proyecto = $1 AND ep.id = $2`, [id_proyecto, id_estudiante_proyecto]);
            const infoEstudiante = resultEstudiante.rows[0];
            await removerEstudianteProyecto(infoEstudiante);

            await pool.query('COMMIT');

            await pool.query(`SELECT ROW_NUMBER() OVER (ORDER BY ep.id) AS id, ep.id AS id_estudiante_proyecto, e.id AS id_estudiante, ep.id_proyecto, e.nombre, e.correo, e.num_identificacion, TO_CHAR(e.fecha_grado, 'DD - MM - YYYY') AS fecha_grado FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = TRUE`, [id_proyecto], (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: "Error al obtener los estudiantes." });

                } else if (result) {
                    return res.status(200).json({ success: true, message: 'El estudiantes ha sido retirado correctamente del proyecto.', estudiantes: result.rows });
                }
            });
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(502).json({ success: false, message: 'Error en el servidor' });
    }
};

const agregarEstudiante = async (req, res) => {
    const id_proyecto = req.params.id;
    const { nombre, num_identificacion, correo } = req.body;

    try {
        await pool.query('BEGIN');
        const result = await pool.query('SELECT e.id FROM estudiante e WHERE LOWER(e.num_identificacion) = LOWER($1) OR LOWER(e.correo) = LOWER($2)', [num_identificacion, correo]);
        if (result.rowCount > 0) {
            const estudianteId = result.rows[0].id;
            const resultProyecto = await pool.query('SELECT 1 FROM estudiante_proyecto pr WHERE pr.id_estudiante = $1 AND pr.estado = true', [estudianteId]);
            if (resultProyecto.rowCount > 0) {
                return res.status(203).json({ success: false, message: 'El estudiante con número de identificación ' + num_identificacion + ' o correo ' + correo + 'ya tiene un proyecto activo. No es posible asignarlo a otro proyecto.' });
            } else {
                await pool.query('INSERT INTO estudiante_proyecto(id_proyecto, id_estudiante) VALUES ( $1, $2)', [id_proyecto, estudianteId]);

                const resultEstudiante = await pool.query(`SELECT pr.nombre, pr.codigo, m.nombre AS nombre_modalidad, e.nombre AS nombre_estado
                FROM proyecto pr 
                JOIN modalidad m ON m.id = pr.id_modalidad
                JOIN estado e ON e.id = pr.id_estado
                WHERE pr.id = $1`, [id_proyecto]);
                const infoEstudiante = resultEstudiante.rows[0];
                await nuevoEstudianteProyecto(infoEstudiante, nombre, correo);

                await pool.query('COMMIT');
            }
        } else {
            const insertEstudianteResult = await pool.query('INSERT INTO estudiante(nombre, num_identificacion, correo) VALUES ($1, $2, $3) RETURNING id', [nombre, num_identificacion, correo]);
            const nuevoEstudianteId = insertEstudianteResult.rows[0].id;
            await pool.query('INSERT INTO estudiante_proyecto(id_proyecto, id_estudiante) VALUES ($1, $2)', [id_proyecto, nuevoEstudianteId]);

            const resultEstudiante = await pool.query(`SELECT pr.nombre, pr.codigo, m.nombre AS nombre_modalidad, e.nombre AS nombre_estado
            FROM proyecto pr 
            JOIN modalidad m ON m.id = pr.id_modalidad
            JOIN estado e ON e.id = pr.id_estado
            WHERE pr.id = $1`, [id_proyecto]);
            const infoEstudiante = resultEstudiante.rows[0];
            await nuevoEstudianteProyecto(infoEstudiante, nombre, correo);

            await pool.query('COMMIT');
        }

        const estudiantes = await pool.query(`SELECT ROW_NUMBER() OVER (ORDER BY ep.id) AS id, ep.id AS id_estudiante_proyecto, e.id AS id_estudiante, ep.id_proyecto, e.nombre, e.correo, e.num_identificacion, TO_CHAR(e.fecha_grado, 'DD-MM-YYYY') AS fecha_grado FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = TRUE`, [id_proyecto])
        return res.status(200).json({ success: true, message: 'Se ha creado un nuevo estudiante y asignado al proyecto.', estudiantes: estudiantes.rows });

    } catch (error) {
        await pool.query('ROLLBACK');
        if (error.code === "23505" && (error.constraint === "estudiante_correo_key" || error.constraint === "estudiante_num_identificacion_key")) {
            return res.status(400).json({ success: false, message: "La información del estudiante ya existe en otro proyecto." });
        }
        return res.status(500).json({ success: false, message: 'Ha ocurrido un error al registrar el estudiante. Por favor inténtelo más tarde.' });
    }
};

const asignarFechaGrado = async (req, res) => {
    try {
        const { id_proyecto, id_estudiante, fecha_grado } = req.body;
        await pool.query('BEGIN');
        await pool.query(
            "UPDATE estudiante SET fecha_grado = $1 WHERE id = $2",
            [fecha_grado, id_estudiante], async (error, result) => {
                if (error) {
                    return res.status(500).json({ success: false, message: "Lo siento, ha ocurrido un erroral actualizar la fecha." });
                }
                if (result) {
                    const resultCorreos = await pool.query('SELECT correo FROM estudiante where id=$1', [id_estudiante]);
                    const correo = resultCorreos.rows[0].correo;
                    await mailCambioFechaGraduacionProyecto(correo, fecha_grado, 'Administrador del Sistema SABAH');
                    const result_estudiantes = await pool.query(`SELECT ROW_NUMBER() OVER (ORDER BY ep.id) AS id, ep.id AS id_estudiante_proyecto, e.id AS id_estudiante, ep.id_proyecto, e.nombre, e.correo, e.num_identificacion, TO_CHAR(e.fecha_grado, 'DD-MM-YYYY') AS fecha_grado FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = TRUE`, [id_proyecto])
                    await pool.query('COMMIT');
                    return res.json({ success: true, estudiantes: result_estudiantes.rows })
                }
            })
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const asignarNuevoCodigo = async (req, res) => {
    try {
        const { id, codigo } = req.body;
        await pool.query('BEGIN');

        await pool.query("UPDATE proyecto SET codigo = $1 WHERE id = $2", [codigo, id], async (error, result) => {
            if (error) {
                if (error.code === "23505" && error.constraint === "proyecto_codigo_key") {
                    return res.status(203).json({ success: false, message: "El código ya está en uso." });
                } else {
                    return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                }
            }
            if (result) {
                const resultCorreos = await pool.query('SELECT e.correo FROM estudiante_proyecto ep JOIN estudiante e ON ep.id_estudiante = e.id WHERE id_proyecto=$1 and estado=true', [id]);
                const correos = resultCorreos.rows;
                await mailCambioCodigo(correos, codigo, 'Comité de Opciones de Grado - Ingeniería de Sistemas');
                await pool.query('COMMIT');
                return res.json({ success: true, codigo })
            }
        })
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const cambiarEtapa = async (req, res) => {
    try {
        const { proyecto, nueva_etapa, anio, periodo } = req.body;
        const { id, acronimo, etapa, estado } = proyecto;

        if (estado === 'Rechazado' || estado === 'Cancelado' || estado === 'Terminado' || estado === 'Aprobado comité') {
            return res.status(203).json({ success: false, message: 'No se puede cambiar la etapa/estado de un proyecto que ya termino (Terminado, Aprobado comité, Rechazado o Cancelado).' });
        }
        if (acronimo === 'COT') {
            if (nueva_etapa.nombre !== 'Propuesta') {
                return res.status(203).json({ success: false, message: 'La modalidad COT solo puede estar en etapa Propuesta.' });
            }
        }

        const etapasOrden = ['Propuesta', 'Proyecto de grado 1', 'Proyecto de grado 2'];
        const indexEtapaActual = etapasOrden.indexOf(etapa);
        const indexEtapaNueva = etapasOrden.indexOf(nueva_etapa.nombre);
        if (indexEtapaNueva < indexEtapaActual) {
            return res.status(203).json({ success: false, message: 'No se puede cambiar a una etapa anterior.' });
        }
        if (etapa === 'Propuesta' && nueva_etapa.nombre === 'Proyecto de grado 2') {
            return res.status(203).json({ success: false, message: 'Primero debe pasar por Proyecto de grado 1' });
        }

        if (nueva_etapa.nombre === 'Proyecto de grado 1' && etapa !== 'Proyecto de grado 1') {
            if (estado !== 'Aprobado propuesta') {
                return res.status(203).json({ success: false, message: 'Para pasar a Proyecto de grado 1 debe estar en estado Aprobado propuesta.' });
            }
        }
        if (nueva_etapa.nombre === 'Proyecto de grado 2' && etapa !== 'Proyecto de grado 2') {
            if (estado !== 'Aprobado proyecto de grado 1') {
                return res.status(203).json({ success: false, message: 'Para pasar a Proyecto de grado 2 debe estar en estado Aprobado proyecto de grado 1' });
            }
        }
        await pool.query('BEGIN');
        await pool.query(
            `INSERT INTO historial_etapa(id_proyecto, id_etapa, anio, periodo) 
            VALUES ($1, $2, $3, $4)`,
            [id, nueva_etapa.id, anio, periodo], async (error, result) => {
                if (error) {
                    if (error.code === "23505" && error.constraint === "historial_etapa_id_proyecto_anio_periodo_key") {
                        return res.status(203).json({ success: false, message: "No es posible llevar a cabo dos etapas en el mismo año y semestre. Por favor, modifique uno de los dos." });
                    }
                    await pool.query('ROLLBACK');
                    return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error al realizar el cambio de etapa." });
                }
                if (result) {
                    await pool.query(
                        `
                        WITH updated_proyectos AS (
                            UPDATE proyecto
                            SET id_estado = (SELECT id FROM estado WHERE LOWER(nombre) = LOWER('en desarrollo'))
                            WHERE id = $1
                            RETURNING id_estado
                        )
                        SELECT estado.id, estado.nombre
                        FROM updated_proyectos
                        JOIN estado ON updated_proyectos.id_estado = estado.id
                        `,
                        [id], async (error, result) => {
                            if (error) {
                                await pool.query('ROLLBACK');
                                return res.status(502).json({ success: false, message: "Lo siento, ha ocurrido un error al realizar el cambio de estado." });
                            }
                            if (result.rowCount > 0) {
                                const resultCorreos = await pool.query('SELECT e.correo FROM estudiante_proyecto ep JOIN estudiante e ON ep.id_estudiante = e.id WHERE id_proyecto=$1 and estado=true', [id]);
                                const correos = resultCorreos.rows;
                                await mailCambioEtapaProyecto(correos, nueva_etapa.nombre, 'Comité de Opciones de Grado - Ingeniería de Sistemas');
                                await pool.query('COMMIT');
                                return res.json({ success: true, estado: result.rows[0] })
                            }
                            await pool.query('ROLLBACK');
                        })
                }
            })
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const asignarNuevoNombre = async (req, res) => {
    try {
        const { id, nombre } = req.body;
        await pool.query('BEGIN');
        await pool.query(
            "UPDATE proyecto SET nombre = $1 WHERE id = $2",
            [nombre, id], async (error, result) => {
                if (error) {
                    return res.status(500).json({ success: false, message: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                }
                if (result) {
                    const resultCorreos = await pool.query('SELECT e.correo FROM estudiante_proyecto ep JOIN estudiante e ON ep.id_estudiante = e.id WHERE id_proyecto=$1 and estado=true', [id]);
                    const correos = resultCorreos.rows
                    await mailCambioNombreProyecto(correos, nombre, 'Comité de Opciones de Grado - Ingeniería de Sistemas');
                    await pool.query('COMMIT');
                    return res.json({ success: true })
                }

            })
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerItemsCumplimiento = async (req, res) => {
    try {
        const acro = req.params.acro;

        const query = `SELECT * FROM cumplimientos_modalidad WHERE LOWER(modalidad) = LOWER($1) OR modalidad = 'todas' `;

        const values = [acro];

        await pool.query(query, values, async (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: "Error al obtener los items" });
            } else if (result) {
                return res.status(200).json({ success: true, cumplimientos: result.rows });
            }

        });
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Error en el servidor' });
    }
};

const cambiarEstadoUsuario = async (req, res) => {
    const { id, estado } = req.body;
    try {
        await pool.query('BEGIN');
        await pool.query('UPDATE usuario SET estado=$1 WHERE id=$2', [estado, id]);
        const result = await pool.query('SELECT correo FROM usuario WHERE id=$1', [id]);
        const correo = result.rows[0].correo;
        const mail = await cambioEstadoUsuario(correo, estado);

        if (mail.success) {
            await pool.query('COMMIT');
            res.status(201).json({ success: true, message: 'Fue modificado el estado del usuario exitosamente.' });
        } else {
            await pool.query('ROLLBACK');
            res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error al cambiar el estado del usuario.' });
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

module.exports = { cambiarEstadoUsuario, obtenerItemsCumplimiento, asignarNuevoNombre, cambiarEtapa, asignarNuevoCodigo, asignarFechaGrado, agregarEstudiante, removerEstudiante, asignarCodigoProyecto, estudiantesNuevo, obtenerProyectosInactivos, obtenerProyectosActivos, verEstudiante, obtenerEstudiantes, cambioUsuarioRol, estudiantesEliminados, obtenerProyectosDirector, obtenerProyectosJurado, obtenerProyectosLector, registro, modificarProyecto, obtenerProyecto, obtenerTodosProyectos, obtenerProyectosTerminados, obtenerProyectosDesarrollo, obtenerUsuarios, verUsuario, rolDirector, rolLector, rolJurado, agregarUsuario, modificarUsuario, cambiarEstado }
