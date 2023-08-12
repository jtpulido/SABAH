const pool = require('../database')

const obtenerVistasDisponibles = async (req, res) => {
    try {
        const query = `SELECT VIEWNAME,
        OBJ_DESCRIPTION(PG_CLASS.OID,
    
            'pg_class') AS COMMENT
    FROM PG_CATALOG.PG_VIEWS
    JOIN PG_CATALOG.PG_CLASS ON PG_VIEWS.VIEWNAME = PG_CLASS.RELNAME
    WHERE SCHEMANAME = 'public';`;

        await pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: "Error en la base de datos" });
            }
            if (result.rowCount > 0) {
                return res.status(200).json({ success: true, vistas: result.rows });
            } else {
                return res.status(203).json({ success: true, message: 'No hay vistas' })
            }
        });
    } catch (error) {
        return res.status(502).json({ success: false, message: "Error en el servidor" });
    }
};
const obtenerColumnasDisponibles = async (req, res) => {
    try {
        const { vista } = req.params;
        const query = `SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = $1
            AND TABLE_SCHEMA = 'public'`;

        await pool.query(query, [vista], (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: "Error en la base de datos" });
            }
            if (result.rowCount > 0) {
                return res.status(200).json({ success: true, columnas: result.rows });
            } else {
                return res.status(203).json({ success: true, message: 'No hay vistas' })
            }
        });
    } catch (error) {
        return res.status(502).json({ success: false, message: "Error en el servidor" });
    }
};
const generarReporte = async (req, res) => {
    try {
        const { vista, columnas, filtros } = req.body;
        let query = `SELECT id, ${columnas.join(', ')} FROM ${vista}`;

        if (filtros && filtros.length > 0) {
            const condiciones = construirCondiciones(filtros);
            if (condiciones) {
                query += ` WHERE ${condiciones}`;
            }
        }

        await pool.query(query, (error, result) => {
            if (error) {
                return res.status(502).json({ success: false, message: "Error en la consulta, por favor revise los filtros." });
            }
            if (result.rowCount > 0) {
                return res.status(200).json({ success: true, info: result.rows });
            } else {
                return res.status(203).json({ success: true, message: 'No hay vistas' })
            }
        });
    } catch (error) {
        return res.status(502).json({ success: false, message: "Error en el servidor" });
    }
};
const construirCondiciones = (filtros) => {
    const condiciones = [];

    for (const filtro of filtros) {
        const { columna, operador, valor } = filtro;

        if (columna && operador) {
            if (operador === 'LIKE' || operador === 'NOT LIKE') {
                condiciones.push(`${columna} ${operador} '%${valor}%'`);
            } else if (operador === 'IS NULL' || operador === 'IS NOT NULL') {
                condiciones.push(`${columna} ${operador}`);
            } else if (valor !== '') {
                condiciones.push(`${columna} ${operador} '${valor}'`);
            }
        }
    }
    return condiciones.join(' AND ');
};


module.exports = {
    obtenerVistasDisponibles, obtenerColumnasDisponibles, generarReporte
};


