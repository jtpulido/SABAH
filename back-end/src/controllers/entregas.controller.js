const pool = require('../database')
const message = 'Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.'

const crearItem = async (req, res) => {
    try {
        const { nombre } = req.body;
        const query = 'INSERT INTO item (nombre) VALUES ($1) RETURNING id';
        const values = [nombre];
        pool.query(query, values, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            const item_id = result.rows[0].id;
            return res.status(200).json({ success: true, message: 'Item creado correctamente', item_id });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};

const modificarItem = async (req, res) => {
    try {
        const { item_id, nombre } = req.body;

        const query = 'UPDATE item SET nombre = $1 WHERE id = $2';
        const values = [nombre, item_id];
        pool.query(query, values, (error) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            return res.status(200).json({ success: true, message: 'Item modificado correctamente' });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};

const obtenerItems = async (req, res) => {
    try {
        const query = 'SELECT * FROM item';
        pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message });
            }
            const items = result.rows;
            if (items.length === 0) {
                return res.status(203).json({ success: true, message: 'No hay items disponibles' });
            }
            return res.status(200).json({ success: true, message: 'Items obtenidos correctamente', items });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message });
    }
};


const eliminarItem = async (req, res) => {
    try {
        const item_id = req.params.itemId;
        const query = 'DELETE FROM item WHERE id = $1';
        const values = [item_id];

        pool.query(query, values, (error) => {
            if (error) {
                if (error.code == '23503') {
                    return res.status(502).json({ success: false, message: "No se puede eliminar un item que esta siendo utilizado por una rubrica." });
                }
                return res.status(502).json({ success: false, message });
            }
            return res.status(200).json({ success: true, message: 'Item eliminado correctamente' });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Error en el servidor' });
    }
};

const obtenerItemPorId = async (req, res) => {
    try {
        const { item_id } = req.params;

        const query = 'SELECT * FROM item WHERE id = $1';
        const values = [item_id];
        pool.query(query, values, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: error });
            }
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'No se encontró el item' });
            }
            const item = result.rows[0];
            return res.status(200).json({ success: true, message: 'Item obtenido correctamente', item });
        });
    } catch (error) {
        return res.status(502).json({ success: false, message: error });
    }
};


const crearRubrica = async (req, res) => {
    try {
        const { nombre, descripcion, items } = req.body;
        await pool.query('BEGIN');
        const rubricaQuery = 'INSERT INTO rubrica (nombre, descripcion) VALUES ($1, $2) RETURNING id';
        const rubricaValues = [nombre, descripcion];
        const rubricaResult = await pool.query(rubricaQuery, rubricaValues);
        const rubricaId = rubricaResult.rows[0].id;

        const itemRubricaQuery = 'INSERT INTO rubrica_item (rubrica_id, item_id, puntaje) VALUES ($1, $2, $3)';

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemRubricaValues = [rubricaId, item.id, item.puntaje];
            await pool.query(itemRubricaQuery, itemRubricaValues);
        }

        await pool.query('COMMIT');
        return res.status(200).json({ success: true, message: 'Rubrica creada exitosamente' });
    } catch (error) {
        console.log(error)
        await pool.query('ROLLBACK');
        return res.status(502).json({ success: false, message: 'Error al crear la rubrica' });
    }
};

const obtenerRubricasConItems = async (req, res) => {
    try {
        const query = `
        SELECT r.id AS rubrica_id, r.nombre AS rubrica_nombre, r.descripcion AS rubrica_descripcion,
               i.id AS item_id, i.nombre AS item_nombre, ri.puntaje AS item_puntaje
        FROM rubrica AS r
        LEFT JOIN rubrica_item AS ri ON r.id = ri.rubrica_id
        LEFT JOIN item AS i ON ri.item_id = i.id
      `;

        const result = await pool.query(query);

        const groupedRows = new Map();
        result.rows.forEach((row) => {
            if (!groupedRows.has(row.rubrica_id)) {
                groupedRows.set(row.rubrica_id, {
                    rubrica_id: row.rubrica_id,
                    rubrica_nombre: row.rubrica_nombre,
                    rubrica_descripcion: row.rubrica_descripcion,
                    items: [],
                });
            }
            if (row.item_id) {
                groupedRows.get(row.rubrica_id).items.push({
                    item_id: row.item_id,
                    item_nombre: row.item_nombre,
                    item_puntaje: row.item_puntaje,
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


module.exports = {
    crearItem, eliminarItem, modificarItem, obtenerItems, obtenerItemPorId, crearRubrica, obtenerRubricasConItems
}