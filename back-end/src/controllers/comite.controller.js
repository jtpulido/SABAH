const pool = require('../database')
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
            await pool.query('UPDATE usuario_rol SET estado=false WHERE id_proyecto=$1 AND id_usuario=$2 AND id_rol=$3', [id_proyecto, id_usuario_anterior, id_rol]);
            await pool.query('INSERT INTO usuario_rol(estado, id_usuario, id_rol, id_proyecto) VALUES (true, $1, $2, $3)', [id_usuario_nuevo, id_rol, id_proyecto]);
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
            'SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE es.id=1', async (error, result) => {
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
            'SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.acronimo as modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE es.id <> 1', async (error, result) => {
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
        const error = "No se puedo encontrar toda la información relacionada al proyecto. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda."
        const result = await pool.query('SELECT p.id, p.codigo, p.nombre, p.anio, p.periodo, m.nombre as modalidad, m.acronimo as acronimo, e.nombre as etapa, es.nombre as estado FROM proyecto p JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE p.id = $1', [id])
        const proyecto = result.rows
        if (result.rowCount === 1) {
            const result_director = await pool.query("SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, u.id AS id_usuario, ur.id_proyecto, u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('director') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const usuario_director = result_director.rows[0]
            const result_lector = await pool.query("SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, u.id AS id_usuario, ur.id_proyecto, u.nombre FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('lector') AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const info_lector = result_lector.rowCount > 0 ? { "existe_lector": true, "lector": result_lector.rows[0] } : { "existe_lector": false };
            const result_jurado = await pool.query("SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, u.id AS id_usuario, ur.id_proyecto, u.nombre, u.id FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.id_usuario INNER JOIN rol r ON ur.id_rol = r.id WHERE UPPER(r.nombre)=UPPER('jurado')AND ur.id_proyecto = $1 AND ur.estado = TRUE", [id])
            const info_jurado = result_jurado.rowCount > 0 ? { "existe_jurado": true, "jurados": result_jurado.rows } : { "existe_jurado": false };
            const result_estudiantes = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ep.id) AS id, ep.id AS id_estudiante_proyecto, e.id AS id_estudiante, ep.id_proyecto, e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = true', [id])

            return res.json({ success: true, proyecto: proyecto[0], director: usuario_director, jurados: info_jurado, lector: info_lector, estudiantes: result_estudiantes.rows });

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
        await pool.query(
            "UPDATE proyecto SET nombre = $1 WHERE id = $2",
            [nombre, id], async (error, result) => {
                if (error) {
                    return res.status(500).json({ success: false, message: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                }
                if (result) {
                    return res.json({ success: true })
                }

            })
    } catch (error) {
        return false;

    }
};
const asignarNuevoCodigo = async (req, res) => {
    try {
        const { id, codigo } = req.body;
        await pool.query(
            "UPDATE proyecto SET codigo = $1, id_etapa = 2 WHERE id = $2 RETURNING (SELECT nombre FROM etapa WHERE id = 2)",
            [codigo, id], async (error, result) => {
                if (error) {
                    if (error.code === "23505" && error.constraint === "proyecto_codigo_key") {
                        return res.status(203).json({ success: false, message: "El código ya está en uso." });
                    } else {
                        return res.status(500).json({ success: false, message: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                    }
                }
                if (result) {
                    etapa = result.rows[0].nombre;
                    return res.json({ success: true, codigo, etapa })
                }

            })
    } catch (error) {
        return false;

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
                    try {
                        const result = await pool.query(
                            "UPDATE proyecto SET codigo = $1, id_etapa = 2 WHERE id = $2 RETURNING (SELECT nombre FROM etapa WHERE id = 2)",
                            [codigo, id]
                        );
                        r = result.rows[0].nombre;
                    } catch (error) {
                        r = false;
                    }
                    return r === false ? res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' }) : res.json({ success: true, codigo, etapa: r })
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
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, u.id AS id_usuario, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, m.acronimo AS modalidad,e.nombre as etapa, es.nombre as estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 1 AND ur.estado JOIN modalidad m ON p.id_modalidad = m.id JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE es.id=1 ORDER BY u.nombre ASC')
        const directores = result.rows
        if (result.rowCount > 0) {
            return res.json({ success: true, directores });
        } else {
            return res.status(203).json({ success: true, message: 'No hay directores activos asignados en proyectos actualmente' })
        }
    } catch (error) {
        console.log(error)
        return res.status(502).json({ success: false, message: 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.' });
    }
};
const obtenerDirectoresProyectosCerrados = async (req, res) => {
    try {
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol,p.id AS id_proyecto, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre as etapa, es.nombre as estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 1 AND ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN modalidad m ON p.id_modalidad = m.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE es.id<>1 ORDER BY u.nombre ASC')
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
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_usuario, p.codigo, u.nombre AS nombre_director, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN modalidad m ON p.id_modalidad = m.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 1 AND NOT ur.estado')
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
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, u.id AS id_usuario, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre AS etapa, es.nombre AS estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 3 AND ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN modalidad m ON p.id_modalidad = m.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE p.id_modalidad <> 3 AND es.id=1 ORDER BY u.nombre ASC')
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
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre AS etapa, es.nombre AS estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 3 AND ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN modalidad m ON p.id_modalidad = m.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE p.id_modalidad <> 3 AND es.id<>1 ORDER BY u.nombre ASC')
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
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_usuario, p.codigo, u.nombre AS nombre_jurado, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN modalidad m ON p.id_modalidad = m.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 3 AND NOT ur.estado ORDER BY u.nombre ASC')
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
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_lector, u.id AS id_usuario, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre AS etapa, es.nombre AS estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 2 AND  ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN modalidad m ON p.id_modalidad = m.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE p.id_modalidad <> 3 AND es.id=1 ORDER BY u.nombre ASC')
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
        const result = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ur.id) AS id, ur.id AS id_usuario_rol, p.id AS id_proyecto, p.codigo, u.nombre AS nombre_lector, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre AS etapa, es.nombre AS estado FROM proyecto p LEFT JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ur.id_rol = 2 AND  ur.estado JOIN etapa e ON p.id_etapa = e.id JOIN modalidad m ON p.id_modalidad = m.id JOIN estado es ON p.id_estado = es.id LEFT JOIN usuario u ON u.id = ur.id_usuario WHERE p.id_modalidad <> 3 AND es.id<>1 ORDER BY u.nombre ASC')
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
        const result = await pool.query('SELECT ur.id,p.id AS id_proyecto, u.id AS id_usuario, p.codigo, u.nombre AS nombre_lector, ur.fecha_asignacion, m.acronimo AS modalidad, e.nombre as etapa, es.nombre as estado FROM usuario_rol ur JOIN proyecto p ON p.id = ur.id_proyecto JOIN etapa e ON p.id_etapa = e.id JOIN modalidad m ON p.id_modalidad = m.id JOIN estado es ON p.id_estado = es.id JOIN usuario u ON u.id = ur.id_usuario WHERE ur.id_rol = 2 AND NOT ur.estado')
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
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE ad.aprobado = true AND ac.id IS NULL 
        UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE s.creado_proyecto = false AND ac.id IS NULL`)
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
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE ad.aprobado = true AND ac.aprobado = true 
        UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE s.creado_proyecto = false AND ac.aprobado = true`)
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
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        JOIN aprobado_solicitud_director ad ON s.id = ad.id_solicitud 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE ad.aprobado = true AND ac.aprobado = false 
        UNION 
        SELECT s.id,s.creado_proyecto AS creado_por, ts.nombre AS tipo_solicitud, s.fecha AS fecha_solicitud, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, es.nombre as estado, p.id AS id_proyecto, NULL AS fecha_aprobado_director, TO_CHAR(ac.fecha, 'DD/MM/YYYY') AS fecha_aprobado_comite 
        FROM solicitud s 
        JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id 
        JOIN proyecto p ON s.id_proyecto = p.id 
        JOIN etapa e ON p.id_etapa = e.id 
        JOIN estado es ON p.id_estado = es.id 
        LEFT JOIN aprobado_solicitud_comite ac ON s.id = ac.id_solicitud 
        WHERE s.creado_proyecto = false AND ac.aprobado = false`)
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
            "SELECT s.id, p.codigo AS codigo_proyecto, e.nombre AS etapa_proyecto, s.creado_proyecto AS creado_por_proyecto, s.justificacion, s.finalizado, ts.nombre AS tipo_solicitud, TO_CHAR(s.fecha, 'DD/MM/YYYY') AS fecha_solicitud, p.id AS id_proyecto, u.nombre AS nombre_director FROM solicitud s JOIN tipo_solicitud ts ON s.id_tipo_solicitud = ts.id JOIN proyecto p ON s.id_proyecto = p.id JOIN usuario_rol ur ON p.id = ur.id_proyecto JOIN usuario u ON ur.id_usuario = u.id JOIN rol r ON ur.id_rol = r.id AND r.id = 1 JOIN etapa e ON p.id_etapa = e.id JOIN estado es ON p.id_estado = es.id WHERE s.id = $1 AND ur.estado = TRUE",
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

        await pool.query(query, values, async (error) => {
            if (error) {
                return res.status(502).json({ success: false, message: "Error al retirar el estudiante." });
            }
            await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ep.id) AS id, ep.id AS id_estudiante_proyecto, e.id AS id_estudiante, ep.id_proyecto, e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = true', [id_proyecto], (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: "Error al obtener los estudiantes." });

                } else if (result) {
                    return res.status(200).json({ success: true, message: 'El estudiantes ha sido retirado correctamente del proyecto.', estudiantes: result.rows });
                }
            })
        });
    } catch (error) {
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
                await pool.query('COMMIT');
            }
        } else {
            const insertEstudianteResult = await pool.query('INSERT INTO estudiante(nombre, num_identificacion, correo) VALUES ($1, $2, $3) RETURNING id', [nombre, num_identificacion, correo]);
            const nuevoEstudianteId = insertEstudianteResult.rows[0].id;
            await pool.query('INSERT INTO estudiante_proyecto(id_proyecto, id_estudiante) VALUES ($1, $2)', [id_proyecto, nuevoEstudianteId]);
            await pool.query('COMMIT');
        }

        const estudiantes = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY ep.id) AS id, ep.id AS id_estudiante_proyecto, e.id AS id_estudiante, ep.id_proyecto, e.nombre, e.correo, e.num_identificacion FROM estudiante e INNER JOIN estudiante_proyecto ep ON e.id = ep.id_estudiante WHERE ep.id_proyecto = $1 AND ep.estado = true', [id_proyecto])
        return res.status(200).json({ success: true, message: 'Se ha creado un nuevo estudiante y asignado al proyecto.', estudiantes: estudiantes.rows });

    } catch (error) {
        await pool.query('ROLLBACK');
        if (error.code === "23505" && (error.constraint === "estudiante_correo_key" || error.constraint === "estudiante_num_identificacion_key")) {
            return res.status(400).json({ success: false, message: "La información del estudiante ya existe en otro proyecto." });
        }
        return res.status(500).json({ success: false, message: 'Ha ocurrido un error al registrar el estudiante. Por favor inténtelo más tarde.' });
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
    verAprobacionesSolicitud,
    verSolicitud,
    agregarAprobacion,
    cambioUsuarioRol,
    removerEstudiante,
    agregarEstudiante
}