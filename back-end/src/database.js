const { database } = require('./config')
const { promisify } = require('util')
const { Pool } = require('pg')

const pool = new Pool(database)

pool.connect((err, client) => {
    if (err) {
        return console.error('Error en la conexión: ', err.stack)
    }

    if (client) client.release();
    console.log('DB conectada');
    return;
})

pool.query = promisify(pool.query)

module.exports = pool