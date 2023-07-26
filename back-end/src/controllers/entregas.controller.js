const pool = require('../database')
const moment = require('moment');
const message = 'Lo siento, ha ocurrido un error en el la conexión con la base de datos. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.'

const crearAspecto = async (req, res) => {
    try {
        const { nombre } = req.body;
        const query = 'INSERT INTO aspecto (nombre) VALUES ($1) RETURNING id';
        const values = [nombre];
        await pool.query(query, values, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }

            if (result.rowCount > 0) {
                return res.status(200).json({ success: true, message: 'Aspecto creado correctamente.' });

            } else {
                return res.status(203).json({ success: true, message: 'No se creo el aspecto.' })
            }
        });
    } catch (error) {

        return res.status(502).json({ success: false, message });
    }
};

const modificarAspecto = async (req, res) => {
    try {
        const { aspectoId } = req.params;
        const { nombre } = req.body;

        const query = 'UPDATE aspecto SET nombre = $1 WHERE id = $2';
        const values = [nombre, aspectoId];
        await pool.query(query, values, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            if (result.rowCount > 0) {
                return res.status(200).json({ success: true, message: 'Aspecto modificado correctamente.' });

            } else {
                return res.status(203).json({ success: true, message: 'No se ha modificado ningun aspecto.' })
            }
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};

const obtenerAspectos = async (req, res) => {
    try {
        const query = 'SELECT * FROM aspecto';
        await pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            const aspectos = result.rows;
            if (aspectos.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay aspectos disponibles' });
            }
            return res.status(200).json({ success: true, message: 'aspectos obtenidos correctamente', aspectos });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};

const eliminarAspecto = async (req, res) => {
    try {
        const id_aspecto = req.params.aspectoId;
        const query = 'DELETE FROM aspecto WHERE id = $1';
        const values = [id_aspecto];

        await pool.query(query, values, (error) => {
            if (error) {
                if (error.code === '23503') {
                    return res.status(502).json({ success: false, message: "No se puede eliminar un aspecto que esta siendo utilizado por una rubrica." });
                }
                return res.status(502).json({ success: false, message });
            }
            return res.status(200).json({ success: true, message: 'aspecto eliminado correctamente' });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Error en el servidor' });
    }
};

const obtenerAspectoPorId = async (req, res) => {
    try {
        const { id_aspecto } = req.params;

        const query = 'SELECT * FROM aspecto WHERE id = $1';
        const values = [id_aspecto];
        await pool.query(query, values, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            if (result.rows.length === 0) {
                return res.status(203).json({ success: false, message: 'No se encontró el aspecto' });
            }
            const aspecto = result.rows[0];
            return res.status(200).json({ success: true, message: 'aspecto obtenido correctamente', aspecto });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message: error });
    }
};

const crearRubrica = async (req, res) => {
    try {
        const { nombre, descripcion, aspectos } = req.body;
        await pool.query('BEGIN');
        const rubricaQuery = 'INSERT INTO rubrica (nombre, descripcion) VALUES ($1, $2) RETURNING id';
        const rubricaValues = [nombre, descripcion];
        const rubricaResult = await pool.query(rubricaQuery, rubricaValues);
        const rubricaId = rubricaResult.rows[0].id;

        const aspectoRubricaQuery = 'INSERT INTO rubrica_aspecto (id_rubrica, id_aspecto, puntaje) VALUES ($1, $2, $3)';

        for (let i = 0; i < aspectos.length; i++) {
            const aspecto = aspectos[i];
            const aspectoRubricaValues = [rubricaId, aspecto.id, aspecto.puntaje];
            await pool.query(aspectoRubricaQuery, aspectoRubricaValues);
        }

        await pool.query('COMMIT');
        return res.status(200).json({ success: true, message: 'Rubrica creada exitosamente' });
    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(502).json({ success: false, message: 'Error al crear la rubrica' });
    }
};
const eliminarRubrica = async (req, res) => {
    try {
        const rubrica_id = req.params.rubrica_id;
        const values = [rubrica_id];

        await pool.query('SELECT COUNT(*) FROM espacio_entrega WHERE id_rubrica = $1', values, async (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            if (parseInt(result.rows[0].count) === 0) {
                const query = 'DELETE FROM rubrica WHERE id = $1 RETURNING *';
                await pool.query(query, values, (error, result) => {
                    if (error) {
                        if (error.code === '23503') {

                            return res.status(502).json({ success: false, message: "No se puede eliminar una rubrica que esta siendo utilizada en un espacio." });
                        }
                        return res.status(502).json({ success: false, message });
                    }
                    if (result.rows.length === 0) {
                        return res.status(203).json({ success: false, message: 'No se pudo encontrar la rubrica a eliminar.' });
                    }
                    return res.status(200).json({ success: true, message: 'Rubrica eliminada correctamente.' });
                });
            } else {
                return res.status(502).json({ success: false, message: "No se puede eliminar una rubrica que esta siendo utilizada en un espacio." });
            }
        })
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const validarModificarRubrica = async (req, res) => {
    try {
        const rubrica_id = req.params.rubrica_id;
        const values = [rubrica_id];

        await pool.query('SELECT COUNT(*) FROM calificacion c JOIN documento_entrega de ON c.id_doc_entrega = de.id JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id JOIN rubrica r ON ee.id_rubrica = r.id WHERE r.id = $1', values, async (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            if (parseInt(result.rows[0].count) === 0) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(203).json({ success: false, message: 'La rubrica no se puede modificar porque ya se califico por lo menos una entrega.' });
            }
        })
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};

const modificarRubrica = async (req, res) => {
    try {
        const rubrica_id = req.params.rubrica_id;
        const { nombre, descripcion, aspectos } = req.body;
        await pool.query('BEGIN');

        const rubricaQuery = 'UPDATE rubrica SET nombre = $1, descripcion = $2 WHERE id = $3';
        const rubricaValues = [nombre, descripcion, rubrica_id];
        await pool.query(rubricaQuery, rubricaValues);

        const borrarAspectosQuery = 'DELETE FROM rubrica_aspecto WHERE id_rubrica = $1';
        await pool.query(borrarAspectosQuery, [rubrica_id]);

        const aspectoRubricaQuery = 'INSERT INTO rubrica_aspecto (id_rubrica, id_aspecto, puntaje) VALUES ($1, $2, $3)';
        for (let i = 0; i < aspectos.length; i++) {
            const aspecto = aspectos[i];
            const aspectoRubricaValues = [rubrica_id, aspecto.id, aspecto.puntaje];
            await pool.query(aspectoRubricaQuery, aspectoRubricaValues);
        }

        await pool.query('COMMIT');
        return res.status(200).json({ success: true, message: 'Rúbrica modificada exitosamente' });
    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(502).json({ success: false, message: 'Error al modificar la rúbrica' });
    }
};

const obtenerRubricasConAspectos = async (req, res) => {
    try {
        const query = `SELECT r.id, r.nombre AS rubrica_nombre, r.descripcion AS rubrica_descripcion,
               i.id AS id_aspecto, i.nombre AS aspecto_nombre, ri.puntaje AS aspecto_puntaje
        FROM rubrica AS r
        LEFT JOIN rubrica_aspecto AS ri ON r.id = ri.id_rubrica
        LEFT JOIN aspecto AS i ON ri.id_aspecto = i.id
      `;

        const result = await pool.query(query);
        const groupedRows = new Map();
        result.rows.forEach((row) => {
            if (!groupedRows.has(row.id)) {
                groupedRows.set(row.id, {
                    id: row.id,
                    rubrica_nombre: row.rubrica_nombre,
                    rubrica_descripcion: row.rubrica_descripcion,
                    aspectos: [],
                });
            }
            if (row.id_aspecto) {
                groupedRows.get(row.id).aspectos.push({
                    id: row.id_aspecto,
                    aspecto_nombre: row.aspecto_nombre,
                    aspecto_puntaje: row.aspecto_puntaje,
                });
            }
        });

        const rubricas = Array.from(groupedRows.values());
        return res
            .status(200)
            .json({ success: true, message: 'Rubricas obtenidas correctamente', rubricas });
    } catch (error) {
        return res
            .status(502)
            .json({ success: false, message: 'Error al obtener las rubricas', error: message });
    }
};

const crearEspacio = async (req, res) => {
    try {
        const { nombre, descripcion, fecha_apertura, fecha_cierre, id_rol, id_modalidad, id_etapa, id_rubrica } = req.body;

        const fechaAperturaFormatted = moment(fecha_apertura, "DD/MM/YYYY hh:mm A").format("YYYY-MM-DD HH:mm:ss");
        const fechaCierreFormatted = moment(fecha_cierre, "DD/MM/YYYY hh:mm A").format("YYYY-MM-DD HH:mm:ss");


        const query = 'INSERT INTO espacio_entrega (nombre, descripcion, fecha_apertura, fecha_cierre, id_rol, id_modalidad, id_etapa, id_rubrica) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
        const values = [nombre, descripcion, fechaAperturaFormatted, fechaCierreFormatted, id_rol, id_modalidad, id_etapa, id_rubrica];

        await pool.query(query, values, (error) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al crear el espacio. Por favor, intente de nuevo más tarde.' });
            }
            return res.status(200).json({ success: true, message: 'Espacio de entrega creado correctamente' });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const validarModificarEspacio = async (req, res) => {
    try {
        const { espacio_id } = req.params;
        const values = [espacio_id];

        await pool.query('SELECT COUNT(*) FROM calificacion c JOIN documento_entrega de ON c.id_doc_entrega = de.id JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id WHERE ee.id = $1', values, async (error, result) => {
            if (error) {
                console.log(error)
                return res.status(502).json({ success: false, message });
            }
            if (parseInt(result.rows[0].count) === 0) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(203).json({ success: false, message: 'El espacio no se puede modificar porque ya se califico por lo menos una entrega.' });
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(502).json({ success: false, message });
    }
};
const modificarEspacio = async (req, res) => {
    try {
        const { espacio_id } = req.params;
        const { nombre, descripcion, fecha_apertura, fecha_cierre, id_rol, id_modalidad, id_etapa, id_rubrica } = req.body;

        const entregasQuery = 'SELECT id FROM documento_entrega WHERE id_espacio_entrega = $1 LIMIT 1';
        const entregasValues = [espacio_id];
        const entregasResult = await pool.query(entregasQuery, entregasValues);

        if (entregasResult.rows.length > 0) {
            const query = `UPDATE espacio_entrega
                SET nombre = $1, descripcion = $2, fecha_apertura = $3, fecha_cierre = $4, id_rol = $5, id_rubrica = $6
                WHERE id = $7`;
            const values = [nombre, descripcion, fecha_apertura, fecha_cierre, id_rol, id_rubrica, espacio_id];

            await pool.query(query, values, (error, result) => {
                if (error) {
                    console.log(error);
                    return res.status(502).json({ success: false, message: 'Ha ocurrido un error al modificar el espacio. Por favor, intente de nuevo más tarde.' });
                }
                if (result.rowCount === 0) {
                    return res.status(203).json({ success: true, message: 'No se pudo encontrar el espacio de entrega' });
                }
                return res.status(200).json({ success: true, message: 'Espacio modificado correctamente (Modalidad y Etapa no se modificaron debido a entregas relacionadas).' });
            });
        } else {
            const query = `UPDATE espacio_entrega
                SET nombre = $1, descripcion = $2, fecha_apertura = $3, fecha_cierre = $4, id_rol = $5, id_modalidad = $6, id_etapa = $7, id_rubrica = $8
                WHERE id = $9`;
            const values = [nombre, descripcion, fecha_apertura, fecha_cierre, id_rol, id_modalidad, id_etapa, id_rubrica, espacio_id];

            await pool.query(query, values, (error, result) => {
                if (error) {
                    return res.status(502).json({ success: false, message: 'Ha ocurrido un error al modificar el espacio. Por favor, intente de nuevo más tarde.' });
                }
                if (result.rowCount === 0) {
                    return res.status(203).json({ success: true, message: 'No se pudo encontrar el espacio de entrega' });
                }
                return res.status(200).json({ success: true, message: 'Espacio modificado correctamente' });
            });
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Ha ocurrido un error al modificar el espacio. Por favor, intente de nuevo más tarde.' });
    }
};

const obtenerEspacio = async (req, res) => {
    try {
        const query = `
        SELECT e.id, e.nombre, e.descripcion, e.fecha_apertura, e.fecha_cierre, e.fecha_creacion,
               r.nombre AS nombre_rol, m.nombre AS nombre_modalidad, et.nombre AS nombre_etapa, rb.nombre AS nombre_rubrica
        FROM espacio_entrega e
        INNER JOIN rol r ON e.id_rol = r.id
        INNER JOIN modalidad m ON e.id_modalidad = m.id
        INNER JOIN etapa et ON e.id_etapa = et.id
        INNER JOIN rubrica rb ON e.id_rubrica = rb.id
      `;
        await pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
            }
            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay espacios creados.' });
            }
            return res.status(200).json({ success: true, espacios: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};

const eliminarEspacio = async (req, res) => {
    try {
        const espacio_id = req.params.espacio_id;
        const query = 'DELETE FROM espacio_entrega WHERE id = $1 RETURNING *';
        const values = [espacio_id];

        await pool.query(query, values, (error, result) => {
            if (error) {
                if (error.code === '23503') {
                    return res.status(502).json({ success: false, message: "No se puede eliminar un espacio en el que ya se realizaron entregas." });
                }
                return res.status(502).json({ success: false, message });
            }
            if (result.rows.length === 0) {
                return res.status(203).json({ success: false, message: 'No se pudo encontrar el espacio a eliminar' });
            }
            return res.status(200).json({ success: true, message: 'Espacio eliminado correctamente' });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};

const obtenerEspacioPorId = async (req, res) => {
    try {
        const { espacio_id } = req.params;

        const query = `
        SELECT e.id, e.nombre, e.descripcion, e.fecha_apertura, e.fecha_cierre, e.fecha_creacion,
        r.id AS id_rol,m.id AS id_modalidad, et.id AS id_etapa, rb.id AS id_rubrica 
        FROM espacio_entrega e
        INNER JOIN rol r ON e.id_rol = r.id
        INNER JOIN modalidad m ON e.id_modalidad = m.id
        INNER JOIN etapa et ON e.id_etapa = et.id
        INNER JOIN rubrica rb ON e.id_rubrica = rb.id WHERE e.id=$1
      `;
        const values = [espacio_id];
        pool.query(query, values, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            if (result.rows.length === 0) {
                return res.status(203).json({ success: false, message: 'No se encontró el espacio' });
            }
            const espacio = result.rows[0];
            return res.status(200).json({ success: true, message: 'Espacio obtenido correctamente', espacio });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const obtenerRubricas = async (req, res) => {
    try {
        const query = `
        SELECT id,nombre
        FROM rubrica`;
        await pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de las rubricas. Por favor, intente de nuevo más tarde.' });
            }
            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay rubricas creados.' });
            }
            return res.status(200).json({ success: true, rubricas: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};

const obtenerRoles = async (req, res) => {
    try {
        const query = `
        SELECT id,nombre
        FROM rol`;
        await pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los roles. Por favor, intente de nuevo más tarde.' });
            }
            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay roles creados.' });
            }
            return res.status(200).json({ success: true, roles: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const obtenerModalidades = async (req, res) => {
    try {
        const query = `
        SELECT id,nombre
        FROM modalidad`;
        await pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de las modalidades. Por favor, intente de nuevo más tarde.' });
            }
            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay modalidades creados.' });
            }
            return res.status(200).json({ success: true, modalidades: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const obtenerEtapas = async (req, res) => {
    try {
        const query = `
        SELECT id,nombre
        FROM etapa`;
        await pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de las etapa. Por favor, intente de nuevo más tarde.' });
            }
            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay etapas creados.' });
            }
            return res.status(200).json({ success: true, etapas: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};


const verEntregasPendientesProyecto = async (req, res) => {
    try {
        const proyecto_id = req.params.proyecto_id;

        const query = `SELECT e.id, e.nombre, e.descripcion, e.fecha_apertura, e.fecha_cierre, r.nombre AS nombre_rol, p.id AS id_proyecto
        FROM espacio_entrega e
        INNER JOIN rol r ON e.id_rol = r.id
        LEFT JOIN documento_entrega d ON e.id = d.id_espacio_entrega
        JOIN proyecto p ON p.id_modalidad = e.id_modalidad AND p.id_etapa = e.id_etapa
        WHERE d.id_proyecto IS NULL AND p.id = $1
        `;

        await pool.query(query, [proyecto_id], (error, result) => {

            if (error) {

                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
            }
            if (result.rows.length === 0) {

                return res.status(203).json({ success: true, message: 'No hay entregas pendientes' });
            }
            return res.status(200).json({ success: true, espacios: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};

const verEntregasRealizadasProyecto = async (req, res) => {
    try {
        const proyecto_id = req.params.proyecto_id;

        const query = `SELECT e.id, e.nombre, e.descripcion, e.fecha_apertura, e.fecha_cierre, d.fecha_entrega, r.nombre AS nombre_rol
        FROM espacio_entrega e
        INNER JOIN rol r ON e.id_rol = r.id
        INNER JOIN documento_entrega d ON e.id = d.id_espacio_entrega
        JOIN proyecto p ON p.id_modalidad = e.id_modalidad AND p.id_etapa = e.id_etapa
        WHERE p.id = $1        
        `;

        await pool.query(query, [proyecto_id], (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
            }

            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No se han realizado entregas.' });
            }
            return res.status(200).json({ success: true, espacios: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const verEntregasPendientes = async (req, res) => {
    try {
        const query =
            `SELECT 
            ROW_NUMBER() OVER (ORDER BY ee.id) AS id,
            ee.id AS id_espacio_entrega,
            ee.nombre AS nombre_espacio_entrega,
            p.id AS id_proyecto,
            p.nombre AS nombre_proyecto,
            r.nombre AS nombre_rol,
            ee.fecha_apertura,
            ee.fecha_cierre
                FROM 
            proyecto p
            INNER JOIN espacio_entrega ee ON p.id_modalidad = ee.id_modalidad AND p.id_etapa = ee.id_etapa
            INNER JOIN rol r ON ee.id_rol = r.id
                WHERE 
            NOT EXISTS (
                SELECT 1
                FROM documento_entrega de
                WHERE de.id_proyecto = p.id AND de.id_espacio_entrega = ee.id
            )
                ORDER BY 
            ee.fecha_cierre;
        `;

        await pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
            }

            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay entregas pendientes por realizar' });
            }
            return res.status(200).json({ success: true, entregas: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const verEntregasRealizadasSinCalificar = async (req, res) => {
    try {
        const query =
            `SELECT 
            ROW_NUMBER() OVER (ORDER BY ee.id) AS id,
        de.id AS id_doc_entrega,
        ee.id AS id_espacio_entrega,
        ee.nombre AS nombre_espacio_entrega,
        r.nombre AS nombre_rol,
        ee.fecha_apertura,
        ee.fecha_cierre,
        p.nombre AS nombre_proyecto,
        ur.id AS id_usuario_rol,
        u.nombre AS evaluador,
        de.fecha_entrega
            FROM 
        documento_entrega de
        INNER JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id
        INNER JOIN proyecto p ON de.id_proyecto = p.id
        INNER JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ee.id_rol = ur.id_rol
        INNER JOIN usuario u ON ur.id_usuario = u.id
        INNER JOIN rol r ON ur.id_rol = r.id
            WHERE 
        de.id NOT IN (SELECT id_doc_entrega FROM calificacion)
            ORDER BY 
        de.fecha_entrega`;

        await pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
            }

            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay entregas pendientes por calificar' });
            }
            return res.status(200).json({ success: true, entregas: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const verEntregasRealizadasCalificadas = async (req, res) => {
    try {
        const query =
            `SELECT 
        c.id,
        ee.nombre AS nombre_espacio_entrega,
        ee.fecha_apertura,
        ee.fecha_cierre,
        r.nombre AS nombre_rol,
        p.nombre AS nombre_proyecto,
        u.nombre AS evaluador,
        de.fecha_entrega,
        c.fecha_evaluacion,
        c.nota_final
    FROM 
        documento_entrega de
        INNER JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id
        INNER JOIN proyecto p ON de.id_proyecto = p.id
        INNER JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ee.id_rol = ur.id_rol
        INNER JOIN usuario u ON ur.id_usuario = u.id
        INNER JOIN rol r ON ur.id_rol = r.id
        INNER JOIN calificacion c ON de.id = c.id_doc_entrega AND ur.id = c.id_usuario_rol
    ORDER BY 
        de.fecha_entrega;
    `;

        await pool.query(query, (error, result) => {
            if (error) {

                console.log(error)
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
            }

            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay entregas calificadas' });
            }
            return res.status(200).json({ success: true, entregas: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const verInfoDocEntregado = async (req, res) => {
    try {

        const id = req.params.id_doc_entrega;
        const query =
            `SELECT 
            de.id,
            d.nombre AS nombre_documento,
            d.id AS id_doc,
            d.uuid,
            de.fecha_entrega
        FROM 
            documento_entrega de
            INNER JOIN documento d ON de.id_documento = d.id
        WHERE de.id = $1  
    `;
        await pool.query(query, [id], (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
            }

            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No se encontro el documento entregado.' });
            }
            return res.status(200).json({ success: true, documento: result.rows[0] });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const verAspectosEspacio = async (req, res) => {
    try {
        const id = req.params.id_esp_entrega;
        const query =
            `SELECT 
            i.id AS id_aspecto, 
            i.nombre AS aspecto_nombre, 
            ri.puntaje AS aspecto_puntaje,
            ri.id AS id_rubrica_aspecto
         FROM 
            espacio_entrega ee 
         INNER JOIN rubrica r ON ee.id_rubrica = r.id
         LEFT JOIN rubrica_aspecto AS ri ON r.id = ri.id_rubrica
         LEFT JOIN aspecto AS i ON ri.id_aspecto = i.id
         WHERE ee.id = $1  
    `;
        await pool.query(query, [id], (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
            }

            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No se encontro el documento entregado.' });
            }
            return res.status(200).json({ success: true, aspectos: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const verCalificacionAspectos = async (req, res) => {
    try {
        const id = req.params.id_calificacion;
        const query =
            `SELECT ca.id, a.nombre AS nombre_aspecto,
            ca.puntaje AS puntaje_aspecto,
            ca.comentario AS comentario_aspecto
     FROM calificacion_aspecto ca
     JOIN rubrica_aspecto ra ON ca.id_rubrica_aspecto = ra.id
     JOIN aspecto a ON ra.id_aspecto = a.id
     WHERE ca.id_calificacion = $1  
    `;
        await pool.query(query, [id], (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
            }

            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No se encontro el documento entregado.' });
            }
            return res.status(200).json({ success: true, aspectos: result.rows });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};
const guardarCalificacion = async (req, res) => {
    try {
        const { id_doc_entrega, id_usuario_rol, calificacion_aspecto } = req.body;
        await pool.query('BEGIN');
        const insertCal = 'INSERT INTO calificacion (id_doc_entrega, id_usuario_rol) VALUES ($1) RETURNING id';
        const calResult = await pool.query(insertCal, [id_doc_entrega, id_usuario_rol]);
        const id_calificacion = calResult.rows[0].id;

        let puntaje = 0;
        const calAspRubricaQuery = 'INSERT INTO calificacion_aspecto (id_calificacion, id_rubrica_aspecto, puntaje, comentario) VALUES ($1, $2, $3, $4)';
        for (let i = 0; i < calificacion_aspecto.length; i++) {
            const calificacion = calificacion_aspecto[i];
            puntaje = puntaje + Number(calificacion.puntaje)
            const valuesCalificacion = [id_calificacion, calificacion.id_rubrica_aspecto, calificacion.puntaje, calificacion.comentario];
            await pool.query(calAspRubricaQuery, valuesCalificacion);
        }
        const nota_final = (puntaje * 5) / 100
        const query = 'UPDATE calificacion SET nota_final = $1 WHERE id = $2';
        await pool.query(query, [nota_final, id_calificacion]);

        await pool.query('COMMIT');
        return res.status(200).json({ success: true, message: 'Calificación guardada correctamente' });
    } catch (error) {
        await pool.query('ROLLBACK');
        return res.status(502).json({ success: false, message: 'Error guardar la calificación' });
    }
};

module.exports = {
    crearAspecto, eliminarAspecto, modificarAspecto, obtenerAspectos, obtenerAspectoPorId,
    crearRubrica, obtenerRubricasConAspectos, eliminarRubrica, modificarRubrica,
    crearEspacio, eliminarEspacio, modificarEspacio, obtenerEspacio, obtenerEspacioPorId,
    obtenerEtapas, obtenerModalidades, obtenerRoles, obtenerRubricas, validarModificarRubrica,
    verEntregasPendientesProyecto, verEntregasRealizadasProyecto, validarModificarEspacio,
    verEntregasPendientes, verEntregasRealizadasSinCalificar, verEntregasRealizadasCalificadas,
    verInfoDocEntregado, verAspectosEspacio, guardarCalificacion, verCalificacionAspectos
}