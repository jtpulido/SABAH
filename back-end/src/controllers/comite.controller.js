const pool = require('../database')

const { removerEstudianteProyecto, nuevoEstudianteProyecto, nuevoUsuarioRol, anteriorUsuarioRol, mailCambioCodigo, mailCambioNombreProyecto, mailCambioEstadoProyecto, mailCambioEtapaProyecto, mailCambioFechaGraduacionProyecto } = require('../controllers/mail.controller')

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
const cambioUsuarioRol = async (req, res) => {
    try {
        const { tipo, id_proyecto, id_usuario_anterior, id_usuario_nuevo, id_rol } = req.body;

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
            return res.json({ success: true, message: 'Se realizo el cambio correctamente.', usuarios: result.rows });
        } else if (tipo === "nuevo") {
            await pool.query('INSERT INTO usuario_rol(estado, id_usuario, id_rol, id_proyecto) VALUES (true, $1, $2, $3)', [id_usuario_nuevo, id_rol, id_proyecto]);
            await pool.query('COMMIT');
            const result = await pool.query(query, [id_proyecto, id_rol]);
            return res.json({ success: true, message: 'Se asigno el usuario correctamente.', usuarios: result.rows });
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Ha ocurrido un error al cambiar o asignar el usuario. Por favor inténtelo más tarde.' });
    }
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
            m.id as id_modalidad,
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
            const result_sustentacion = await pool.query('SELECT id, fecha_sustentacion, lugar, anio, periodo, id_proyecto FROM sustentacion_proyecto WHERE id_proyecto= $1', [id])
            const sustentacion = result_sustentacion.rowCount > 0 ? { "existe_sustentacion": true, "sustentacion": result_sustentacion.rows[0] } : { "existe_sustentacion": false };
            return res.json({ success: true, proyecto: proyecto[0], director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows, cliente: info_cliente, sustentacion: sustentacion });
        } else {
            return res.status(203).json({ success: true, message: 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
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
const cambiarEstado = async (req, res) => {
    try {
        const { proyecto, nuevo_estado } = req.body;
        const { id, acronimo, etapa, estado } = proyecto;

        if (estado === 'Rechazado' || estado === 'Cancelado' || estado === 'Terminado' || estado === 'Aprobado comité') {
            return res.status(203).json({ success: false, message: 'No se puede cambiar la etapa/estado de un proyecto que ya termino (Terminado, Aprobado comité, Rechazado o Cancelado).' });
        }

        if (acronimo === 'COT') {
            if (nuevo_estado.nombre !== 'En desarrollo' && nuevo_estado.nombre !== 'Aprobado propuesta' && nuevo_estado.nombre !== 'Aprobado comité' && nuevo_estado.nombre !== 'Rechazado' && nuevo_estado.nombre !== 'Cancelado') {
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
                    await mailCambioFechaGraduacionProyecto(correo, fecha_grado, 'Comité de Opciones de Grado - Ingeniería de Sistemas');
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
const obtenerDirectoresProyectosActivos = async (req, res) => {
    try {
        const result = await pool.query(`SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, u.id AS id_usuario, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, m.acronimo AS modalidad,e.nombre as etapa, es.nombre as estado 
            FROM proyecto p LEFT 
            JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 1 AND ur.estado 
            JOIN modalidad m ON p.id_modalidad = m.id 
            JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
            JOIN estado es ON p.id_estado = es.id 
            LEFT JOIN usuario u ON u.id = ur.id_usuario 
            WHERE es.nombre NOT IN ('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado') 
            AND he.fecha_cambio = (
                SELECT MAX(fecha_cambio)
                FROM historial_etapa
                WHERE id_proyecto = p.id
              )
            ORDER BY u.nombre ASC`)
        const directores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, directores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay directores activos asignados en proyectos actualmente' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerDirectoresProyectosCerrados = async (req, res) => {
    try {
        const result = await pool.query(`SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol,p.id AS id_proyecto, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 1 AND ur.estado 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN usuario u ON u.id = ur.id_usuario 
        WHERE es.nombre IN ('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado')
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          ) 
        ORDER BY u.nombre ASC`)
        const directores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, directores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyecto cerrados.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerDirectoresProyectosInactivos = async (req, res) => {
    try {
        const result = await pool.query(`SELECT ur.id,p.id AS id_proyecto, u.id AS id_usuario, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre as etapa, es.nombre as estado 
            FROM usuario_rol ur 
            JOIN proyecto p ON p.id = ur.id_proyecto 
            JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
            JOIN modalidad m ON p.id_modalidad = m.id 
            JOIN estado es ON p.id_estado = es.id 
            JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 1 AND NOT ur.estado
            AND he.fecha_cambio = (
                SELECT MAX(fecha_cambio)
                FROM historial_etapa
                WHERE id_proyecto = p.id
              )`)
        const directores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, directores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay directores inactivos asignados en proyectos.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerJuradosProyectosActivos = async (req, res) => {
    try {
        const result = await pool.query(`SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, u.id AS id_usuario, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre AS etapa, es.nombre AS estado 
        FROM proyecto p 
        LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 3 AND ur.estado 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN usuario u ON u.id = ur.id_usuario 
        WHERE p.id_modalidad <> 3 AND es.nombre NOT IN ('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado')
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          ) 
        ORDER BY u.nombre ASC`)
        const jurados = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, jurados });
        } else {
            return res.status(203).json({ success: true, message: 'No hay jurados activos en proyectos en desarrollo actualmente' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerJuradosProyectosCerrados = async (req, res) => {
    try {
        const result = await pool.query(`SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre AS etapa, es.nombre AS estado 
            FROM proyecto p 
            LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 3 AND ur.estado 
            JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
            JOIN modalidad m ON p.id_modalidad = m.id 
            JOIN estado es ON p.id_estado = es.id 
            LEFT JOIN usuario u ON u.id = ur.id_usuario 
            WHERE p.id_modalidad <> 3 AND es.nombre IN ('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado')
            AND he.fecha_cambio = (
                SELECT MAX(fecha_cambio)
                FROM historial_etapa
                WHERE id_proyecto = p.id
              ) 
            ORDER BY u.nombre ASC`)
        const jurados = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, jurados });
        } else {
            return res.status(203).json({ success: true, message: 'No hay jurados activos en proyectos cerrados actualmente' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerJuradosProyectosInactivos = async (req, res) => {
    try {
        const result = await pool.query(`SELECT ur.id,p.id AS id_proyecto, u.id AS id_usuario, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre as etapa, es.nombre as estado 
        FROM usuario_rol ur 
        JOIN proyecto p ON p.id = ur.id_proyecto 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN usuario u ON u.id = ur.id_usuario 
        WHERE ur.id_rol = 3 AND NOT ur.estado 
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          )
        ORDER BY u.nombre ASC`)
        const jurados = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, jurados });
        } else {
            return res.status(203).json({ success: true, message: 'No hay jurados inactivos asignado en proyectos actualmente' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerLectoresProyectosActivos = async (req, res) => {
    try {
        const result = await pool.query(`SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_lector, u.id AS id_usuario, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre AS etapa, es.nombre AS estado 
        FROM proyecto p 
        LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 2 AND  ur.estado 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN usuario u ON u.id = ur.id_usuario 
        WHERE p.id_modalidad <> 3 AND es.nombre NOT IN ('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado')
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          ) 
        ORDER BY u.nombre ASC`)
        const lectores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, lectores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyectos en desarrollo.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerLectoresProyectosCerrados = async (req, res) => {
    try {
        const result = await pool.query(`SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_lector, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre AS etapa, es.nombre AS estado 
        FROM proyecto p 
        LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 2 AND  ur.estado 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN usuario u ON u.id = ur.id_usuario 
        WHERE p.id_modalidad <> 3 AND es.nombre IN ('Rechazado', 'Aprobado comité', 'Cancelado', 'Terminado')
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          )
        ORDER BY u.nombre ASC`)
        const lectores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, lectores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay proyectos cerrados, finalizados o rechazados.' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerLectoresProyectosInactivos = async (req, res) => {
    try {
        const result = await pool.query(`SELECT ur.id,p.id AS id_proyecto, u.id AS id_usuario, p.codigo, u.nombre AS nombre_lector, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre as etapa, es.nombre as estado 
        FROM usuario_rol ur 
        JOIN proyecto p ON p.id = ur.id_proyecto 
        JOIN historial_etapa he ON p.id = he.id_proyecto
        JOIN etapa e ON he.id_etapa = e.id 
        JOIN modalidad m ON p.id_modalidad = m.id 
        JOIN estado es ON p.id_estado = es.id
        JOIN usuario u ON u.id = ur.id_usuario 
        WHERE ur.id_rol = 2 AND NOT ur.estado
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          )`)
        const lectores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, lectores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay lectores inactivos en proyectos actualmente' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerSolicitudesPendientesComite = async (req, res) => {
    try {
        const result = await pool.query(`SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_aprobado_director 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE ad.aprobado = true AND ac.id IS NULL 
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          )
        UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE s.creado_proyecto = false AND ac.id IS NULL
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          )`)
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: true, message: 'No hay solicitudes pendientes por aprobación del comité' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerSolicitudesAprobadasComite = async (req, res) => {
    try {
        const result = await pool.query(`SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE ad.aprobado = true AND ac.aprobado = true
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          )
        UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE s.creado_proyecto = false AND ac.aprobado = true
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          )`)
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: true, message: 'No hay solicitudes aprobadas por el comité' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerSolicitudesRechazadasComite = async (req, res) => {
    try {
        const result = await pool.query(`SELECT s.id, s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto,  TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE ad.aprobado = true AND ac.aprobado = false 
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          )
        UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE s.creado_proyecto = false AND ac.aprobado = false
        AND he.fecha_cambio = (
            SELECT MAX(fecha_cambio)
            FROM historial_etapa
            WHERE id_proyecto = p.id
          )`)
        const solicitudes = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, solicitudes });
        } else {
            return res.status(203).json({ success: true, message: 'No hay solicitudes rechazadas por el comité' })
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const verSolicitud = async (req, res) => {
    try {

        const id = req.params.solicitud_id;
        await pool.query(
            `SELECT s.id,
            p.codigo AS codigo_proyecto,
            e.nombre AS etapa_proyecto,
            s.creado_proyecto AS creado_por_proyecto,
            s.justificacion, s.finalizado,
            ts.nombre AS tipo_solicitud,
            TO_CHAR(s.fecha, 'DD/MM/YYYY') AS fecha_solicitud,
            p.id AS id_proyecto, u.nombre AS nombre_director
            FROM solicitud s 
            JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
            JOIN proyecto p ON s.id_proyecto = p.id 
            JOIN usuario_rol ur ON p.id = ur.id_proyecto 
            JOIN usuario u ON ur.id_usuario = u.id 
            JOIN rol r ON ur.id_rol = r.id AND r.id = 1 
            JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id 
            JOIN estado es ON p.id_estado = es.id 
            WHERE s.id = $1 AND ur.estado = TRUE
            AND he.fecha_cambio = (
                SELECT MAX(fecha_cambio)
                FROM historial_etapa
                WHERE id_proyecto = p.id
              )`,
            [id], async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
                } else if (result.rowCount === 1) {
                    return res.json({ success: true, solicitud: result.rows[0] });
                } else {
                    return res.status(203).json({ success: true, message: 'No fue posible encontrar la solicitud' });
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const verAprobacionesSolicitud = async (req, res) => {
    try {
        const id = req.params.solicitud_id;
        await pool.query(
            "SELECT ROW_NUMBER() OVER (ORDER BY id_solicitud) AS id, id_solicitud, aprobador, aprobado,fecha, comentario_aprobacion FROM (SELECT s.id AS id_solicitud, 'Director' AS aprobador, CASE WHEN ad.aprobado = true THEN 'Sí' WHEN ad.aprobado = false THEN 'No' ELSE '' END AS aprobado,TO_CHAR(ad.fecha, 'DD/MM/YYYY') AS fecha, ad.comentario AS comentario_aprobacion FROM solicitud s LEFT JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud WHERE s.id = $1 AND EXISTS (SELECT 1 FROM aprobado_solicitud_director WHERE id_solicitud = s.id) UNION SELECT s.id AS id_solicitud, 'Comite' AS aprobador, CASE WHEN ac.aprobado = true THEN 'Sí' WHEN ac.aprobado = false THEN 'No' ELSE '' END AS aprobado, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha, ac.comentario AS comentario_aprobacion FROM solicitud s LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud WHERE s.id = $1 AND EXISTS ( SELECT 1 FROM aprobado_solicitud_comite WHERE id_solicitud = s.id )) AS subquery",
            [id], async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
                } else if (result.rowCount > 0) {
                    return res.json({ success: true, aprobaciones: result.rows });
                } else {
                    return res.status(203).json({ success: true, message: 'No se encontraron aprobaciones para la solicitud' });
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const agregarAprobacion = async (req, res) => {
    try {
        const { aprobado, comentario, id_solicitud } = req.body;
        await pool.query(
            "INSERT INTO public.aprobado_solicitud_comite (aprobado, comentario, id_solicitud) VALUES ($1, $2, $3)",
            [aprobado, comentario, id_solicitud],
            (error, result) => {
                if (error) {
                    if (error.code === "23505") {
                        return res.status(400).json({ success: false, message: "Ya fue aprobada esta solicitud." });
                    }
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error al guardar la aprobación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
                }

                if (result.rowCount > 0) {
                    pool.query(
                        "UPDATE public.solicitud SET finalizado = $1 WHERE id = $2",
                        [true, id_solicitud],
                        (error1, result1) => {
                            if (error1) {
                                return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error al guardar la aprobación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
                            }
                            if (result1.rowCount > 0) {
                                return res.json({ success: true, message: 'Aprobación guardada correctamente.' });
                            }
                        }
                    );
                }
            }
        );

        return res.status(203).json({ success: true, message: 'No se pudo aprobar la solicitud' });
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

const obtenerReunionesPendientes = async (req, res) => {
    try {
        const updateQuery = `UPDATE reunion SET id_estado=(SELECT id FROM estado_reunion WHERE nombre = 'Completa') WHERE fecha<CURRENT_TIMESTAMP AND id_estado!=(SELECT id FROM estado_reunion WHERE nombre = 'Cancelada')`;
        await pool.query(updateQuery);

        // Obtener reunion actualizadas
        const selectQuery = `SELECT r.id, r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, r.enlace, r.justificacion,
      COALESCE(
          STRING_AGG(DISTINCT
              CASE
                  WHEN ur.id_rol = 1 THEN 'Director'
                  WHEN ur.id_rol = 2 THEN 'Lector'
                  WHEN ur.id_rol = 3 THEN 'Jurado'
              END
              , ', ') || 
          CASE 
              WHEN MAX(CASE WHEN inv.id_cliente IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN ', Cliente' 
              ELSE '' 
          END,
          ''
      ) AS roles_invitados
  FROM reunion r JOIN estado_reunion e ON r.id_estado = e.id LEFT JOIN invitados inv ON inv.id_reunion = r.id LEFT JOIN usuario_rol ur ON inv.id_usuario_rol = ur.id
  WHERE e.nombre = 'Pendiente' GROUP BY r.id, r.nombre, r.fecha, r.enlace ORDER BY fecha ASC;`;
        const result = await pool.query(selectQuery);
        const pendientes = result.rows;

        if (pendientes.length > 0) {
            return res.json({ success: true, pendientes });
        } else {
            return res.status(203).json({ success: true, message: 'No hay reuniones pendientes' });
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerReunionesCompletas = async (req, res) => {
    try {
        const result = await pool.query(`SELECT r.id, r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, r.enlace, r.justificacion, ac.id AS id_acta,
      COALESCE(
          STRING_AGG(DISTINCT
              CASE
                  WHEN ur.id_rol = 1 THEN 'Director'
                  WHEN ur.id_rol = 2 THEN 'Lector'
                  WHEN ur.id_rol = 3 THEN 'Jurado'
              END
              , ', ') || 
          CASE 
              WHEN MAX(CASE WHEN inv.id_cliente IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN ', Cliente' 
              ELSE '' 
          END,
          ''
      ) AS roles_invitados
  FROM reunion r JOIN estado_reunion e ON r.id_estado = e.id LEFT JOIN invitados inv ON inv.id_reunion = r.id LEFT JOIN usuario_rol ur ON inv.id_usuario_rol = ur.id LEFT JOIN acta_reunion ac ON ac.id_reunion = r.id
  WHERE e.nombre = $1 GROUP BY r.id, r.nombre, r.fecha, r.enlace, ac.id ORDER BY fecha ASC;`, ['Completa'])
        const completas = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, completas });
        } else {
            return res.status(203).json({ success: true, message: 'No hay reuniones completas' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerReunionesCanceladas = async (req, res) => {
    try {
        const result = await pool.query(`SELECT r.id, r.nombre, TO_CHAR(r.fecha, 'DD-MM-YYYY HH24:MI') AS fecha, r.enlace, r.justificacion,
      COALESCE(
          STRING_AGG(DISTINCT
              CASE
                  WHEN ur.id_rol = 1 THEN 'Director'
                  WHEN ur.id_rol = 2 THEN 'Lector'
                  WHEN ur.id_rol = 3 THEN 'Jurado'
              END
              , ', ') || 
          CASE 
              WHEN MAX(CASE WHEN inv.id_cliente IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN ', Cliente' 
              ELSE '' 
          END,
          ''
      ) AS roles_invitados
  FROM reunion r JOIN estado_reunion e ON r.id_estado = e.id LEFT JOIN invitados inv ON inv.id_reunion = r.id LEFT JOIN usuario_rol ur ON inv.id_usuario_rol = ur.id
  WHERE e.nombre = $1 GROUP BY r.id, r.nombre, r.fecha, r.enlace ORDER BY fecha ASC;`, ['Cancelada'])
        const canceladas = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, canceladas });
        } else {
            return res.status(203).json({ success: true, message: 'No hay reuniones canceladas' })
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerInvitados = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
      SELECT i.id as id_tabla_invitados, i.id_reunion, i.id_usuario_rol, i.id_asistencia, i.id_cliente, 
      c.id AS id_tabla_cliente, c.nombre_empresa, c.nombre_repr, c.correo_repr,
      u.id AS id_tabla_usuario, u.nombre AS nombre_usuario, u.correo,
      r.id AS id_tabla_rol, r.nombre AS nombre_rol
      FROM invitados i
      LEFT JOIN cliente c ON i.id_cliente = c.id
      LEFT JOIN usuario_rol ur ON i.id_usuario_rol = ur.id
      LEFT JOIN usuario u ON ur.id_usuario = u.id
      LEFT JOIN rol r ON ur.id_rol = r.id
      WHERE i.id_reunion=$1`, [id]);
        const invitados = result.rows;
        if (result.rowCount > 0) {
            return res.json({ success: true, invitados });
        }
    } catch (error) {
        res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

const obtenerSustentacionProyectos = async (req, res) => {
    try {
        await pool.query(
            `SELECT 
                p.id, 
                p.codigo, 
                p.nombre, 
                m.nombre as modalidad, 
                sp.anio,
                sp.periodo,
                sp.fecha_sustentacion as fecha_sustentacion,
                sp.lugar as lugar_sustentacion
            FROM proyecto p 
            JOIN modalidad m ON p.id_modalidad = m.id 
            JOIN sustentacion_proyecto sp ON p.id = sp.id_proyecto`
            , async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error al obtener la fecha de sustentación de los proyectos.' });
                }
                if (result.rowCount > 0) {
                    return res.json({ success: true, sustentacion: result.rows });
                } else if (result.rowCount <= 0) {
                    return res.status(203).json({ success: true, message: 'No se han definido fechas de sustentación.' })
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerProyectosPostulados = async (req, res) => {
    try {
        await pool.query(
            `SELECT 
                pgm.id,
                p.id as id_proyecto, 
                p.codigo, 
                p.nombre, 
                m.id as id_modalidad,
                m.nombre as modalidad, 
                es.nombre as estado_proyecto,
                pgm.fecha_postulacion as fecha_postulacion,
                pgm.anio as anio,
                pgm.periodo as periodo
            FROM proyecto p
            JOIN modalidad m ON p.id_modalidad = m.id 
            JOIN estado es ON p.id_estado = es.id
            JOIN postulacion_grado_meritorio pgm ON p.id = pgm.id_proyecto
            WHERE pgm.estado = true
            ORDER BY pgm.periodo DESC, pgm.anio DESC`
            , async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                }
                if (result.rowCount > 0) {
                    return res.json({ success: true, proyectos: result.rows });
                } else if (result.rowCount <= 0) {
                    return res.status(203).json({ success: true, message: 'No hay proyectos postulados.' })
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerProyectosMeritorios = async (req, res) => {
    try {
        await pool.query(
            `SELECT 
                p.id, 
                p.codigo, 
                p.nombre, 
                m.nombre as modalidad, 
                e.nombre as etapa_proyecto, 
                es.nombre as estado_proyecto,
                pgm.periodo as periodo_eleccion,
                pgm.anio as anio_eleccion
            FROM proyecto p
            JOIN modalidad m ON p.id_modalidad = m.id 
            JOIN historial_etapa he ON p.id = he.id_proyecto
            JOIN etapa e ON he.id_etapa = e.id
            JOIN estado es ON p.id_estado = es.id
            JOIN postulacion_grado_meritorio ppgm ON p.id = ppgm.id_proyecto
            JOIN proyecto_meritorio pgm ON ppgm.id = pgm.id_postulacion
            WHERE he.fecha_cambio = (
                    SELECT MAX(fecha_cambio)
                    FROM historial_etapa
                    WHERE id_proyecto = p.id
                )
            ORDER BY pgm.periodo DESC, pgm.anio DESC`
            , async (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });

                }
                if (result.rowCount > 0) {
                    return res.json({ success: true, proyectos: result.rows });
                } else if (result.rowCount <= 0) {
                    return res.status(203).json({ success: true, message: 'No hay proyectos meritorios' })
                }
            })
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const postularProyectoMeritorio = async (req, res) => {
    try {
        const { id, id_modalidad, anio, periodo } = req.body.postulado;
        await pool.query(
            "INSERT INTO postulacion_grado_meritorio(anio, periodo, id_modalidad, id_proyecto) VALUES ($1, $2, $3, $4)",
            [anio, periodo, id_modalidad, id],
            (error, result) => {
                if (error) {
                    if (error.code === "23505") {
                        return res.status(400).json({ success: false, message: "Este proyecto ya fue postulado." });
                    }
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error al postular el proyecto.' });
                }
                if (result) {
                    return res.json({ success: true, message: 'Proyecto postulado correctamente.' });
                }
            }
        );

        return res.status(203).json({ success: true, message: 'No se pudo elegir el proyecto como meritorio.' });
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const elegirProyectoMeritorio = async (req, res) => {
    try {
        const { id, id_modalidad, anio, periodo } = req.body.postulado;
        await pool.query(
            "INSERT INTO proyecto_meritorio(anio, periodo, id_modalidad, id_postulacion) VALUES ($1, $2, $3, $4)",
            [anio, periodo, id_modalidad, id],
            (error, result) => {
                if (error) {
                    if (error.code === "23505") {
                        return res.status(400).json({ success: false, message: "Ya existe un proyecto meritorio para el año, el periodo y la modalidad de este proyecto." });
                    }
                    return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error al elegir el proyecto como meritorio.' });
                }
                if (result) {
                    return res.json({ success: true, message: 'Proyecto meritorio elegido correctamente.' });
                }
            }
        );

        return res.status(203).json({ success: true, message: 'No se pudo elegir el proyecto como meritorio.' });
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const programarSustentacion = async (req, res) => {
    try {
        const { fecha, lugar, id, anio, periodo } = req.body;

        const insertQuery = `
            INSERT INTO sustentacion_proyecto(fecha_sustentacion, lugar, id_proyecto, anio, periodo)
            VALUES ($1, $2, $3, $4, $5) RETURNING id`;

        const result = await pool.query(insertQuery, [fecha, lugar, id, anio, periodo]);

        if (result.rowCount > 0) {
            const id_sus = result.rows[0].id;
            const selectQuery = 'SELECT id, fecha_sustentacion, lugar, anio, periodo, id_proyecto FROM sustentacion_proyecto WHERE id = $1';
            const sustentacionResult = await pool.query(selectQuery, [id_sus]);
            const sustentacion = sustentacionResult.rows[0];

            if (sustentacion) {
                return res.json({ success: true, sustentacion });
            } else {
                return res.status(404).json({ success: false, message: 'No se encontró la sustentación.' });
            }
        } else {
            return res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error al insertar la fecha.' });
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, inténtelo de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerProyecto,
    obtenerProyectosTerminados,
    obtenerProyectosDesarrollo,
    asignarCodigoProyecto,
    obtenerDirectoresProyectosActivos,
    obtenerDirectoresProyectosCerrados,
    obtenerDirectoresProyectosInactivos,
    obtenerJuradosProyectosActivos,
    obtenerJuradosProyectosCerrados,
    obtenerJuradosProyectosInactivos,
    obtenerLectoresProyectosActivos,
    obtenerLectoresProyectosCerrados,
    obtenerLectoresProyectosInactivos,
    obtenerSolicitudesPendientesComite,
    obtenerSolicitudesAprobadasComite,
    obtenerSolicitudesRechazadasComite,
    obtenerJuradosProyectosCerrados,
    asignarNuevoCodigo,
    asignarNuevoNombre,
    cambiarEtapa,
    verAprobacionesSolicitud,
    verSolicitud,
    agregarAprobacion,
    cambioUsuarioRol,
    removerEstudiante,
    agregarEstudiante,
    asignarFechaGrado,
    cambiarEstado,
    obtenerItemsCumplimiento,
    obtenerReunionesCanceladas,
    obtenerReunionesCompletas,
    obtenerReunionesPendientes,
    obtenerInvitados,
    obtenerProyectosMeritorios,
    obtenerProyectosPostulados,
    obtenerSustentacionProyectos,
    elegirProyectoMeritorio,
    postularProyectoMeritorio,
    programarSustentacion
}