const pool = require('../database')
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
            const id_aspecto = result.rows[0].id;
            return res.status(200).json({ success: true, message: 'aspecto creado correctamente', id_aspecto });
        });
    } catch (error) {

        return res.status(502).json({ success: false, message });
    }
};

const modificarAspecto = async (req, res) => {
    try {
        const { id_aspecto, nombre } = req.body;

        const query = 'UPDATE aspecto SET nombre = $1 WHERE id = $2';
        const values = [nombre, id_aspecto];
        await pool.query(query, values, (error) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            return res.status(200).json({ success: true, message: 'aspecto modificado correctamente' });
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
                if (error.code == '23503') {
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
        console.log(error)
        return res.status(502).json({ success: false, message: 'Error al crear la rubrica' });
    }
};

const obtenerRubricasConAspectos = async (req, res) => {
    try {
        const query = `
        SELECT r.id AS id_rubrica, r.nombre AS rubrica_nombre, r.descripcion AS rubrica_descripcion,
               i.id AS id_aspecto, i.nombre AS aspecto_nombre, ri.puntaje AS aspecto_puntaje
        FROM rubrica AS r
        LEFT JOIN rubrica_aspecto AS ri ON r.id = ri.id_rubrica
        LEFT JOIN aspecto AS i ON ri.id_aspecto = i.id
      `;

        const result = await pool.query(query);

        const groupedRows = new Map();
        result.rows.forEach((row) => {
            if (!groupedRows.has(row.id_rubrica)) {
                groupedRows.set(row.id_rubrica, {
                    id_rubrica: row.id_rubrica,
                    rubrica_nombre: row.rubrica_nombre,
                    rubrica_descripcion: row.rubrica_descripcion,
                    aspectos: [],
                });
            }
            if (row.id_aspecto) {
                groupedRows.get(row.id_rubrica).aspectos.push({
                    id_aspecto: row.id_aspecto,
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

        const query = 'INSERT INTO espacio_entrega (nombre, descripcion, fecha_apertura, fecha_cierre, id_rol, id_modalidad, id_etapa, id_rubrica) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
        const values = [nombre, descripcion, fecha_apertura, fecha_cierre, id_rol, id_modalidad, id_etapa, id_rubrica];
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

const modificarEspacio = async (req, res) => {
    try {
        const { espacio_id } = req.params;
        const { nombre, descripcion, fecha_apertura, fecha_cierre, id_rol, id_modalidad, id_etapa, id_rubrica } = req.body;

        const query = `UPDATE espacio_entrega
        SET nombre = $1, descripcion = $2, fecha_apertura = $3, fecha_cierre = $4, id_rol = $5, id_modalidad = $6, id_etapa = $7, id_rubrica = $8
        WHERE id = $9
        RETURNING *`
        const values = [nombre, descripcion, fecha_apertura, fecha_cierre, id_rol, id_modalidad, id_etapa, id_rubrica, espacio_id];

        await pool.query(query, values, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al modificar el espacio. Por favor, intente de nuevo más tarde.' });
            }
            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No se pudo encontrar el espacio de entrega' });
            }
            return res.status(200).json({ success: true, message: 'Rubrica modificada correctamente' });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
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
                console.log(error);
                if (error.code == '23503') {
                    console.log("Hola----------------------------------------");
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
               r.nombre AS nombre_rol, m.nombre AS nombre_modalidad, et.nombre AS nombre_etapa, rb.nombre AS nombre_rubrica
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
        console.log(error)
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

        const query = `SELECT e.id, e.nombre, e.descripcion, e.fecha_apertura, e.fecha_cierre, r.nombre AS nombre_rol
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
        ee.nombre AS nombre_espacio_entrega,
        de.fecha_entrega,
        p.nombre AS nombre_proyecto,
        r.nombre AS nombre_rol,
        u.nombre AS evaluador
    FROM 
        documento_entrega de
        INNER JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id
        INNER JOIN proyecto p ON de.id_proyecto = p.id
        INNER JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ee.id_rol = ur.id_rol
        INNER JOIN usuario u ON ur.id_usuario = u.id
        INNER JOIN rol r ON ur.id_rol = r.id
    WHERE 
        de.id NOT IN (SELECT id_documento_entrega FROM calificacion)
    ORDER BY 
        de.fecha_entrega`;

        await pool.query(query, (error, result) => {
            if (error) {
                console.log(error)
                return res.status(502).json({ success: false, message: 'Ha ocurrido un error al obtener la información de los espacios creados. Por favor, intente de nuevo más tarde.' });
            }

            if (result.rows.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay entregas pendientes' });
            }
            return res.status(200).json({ success: true, espacios: result.rows });
        });
    } catch (error) {
        console.log(error)
        return res.status(502).json({ success: false, message });
    }
};

module.exports = {
    crearAspecto, eliminarAspecto, modificarAspecto, obtenerAspectos, obtenerAspectoPorId,
    crearRubrica, obtenerRubricasConAspectos,
    crearEspacio, eliminarEspacio, modificarEspacio, obtenerEspacio, obtenerEspacioPorId,
    obtenerEtapas, obtenerModalidades, obtenerRoles, obtenerRubricas,
    verEntregasPendientesProyecto, verEntregasRealizadasProyecto,
    verEntregasPendientes
}