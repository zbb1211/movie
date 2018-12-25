const mysql = require('mysql')
const config = require('../config').mysql

var pool = null

function initMysqlPool() {
  pool = mysql.createPool({
    connectionLimit: 50,
    database: config.db,
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.pass
  });
}

module.exports = {
  query(sql, sqlParam, connection) {
    return new Promise((resolve, reject) => {
      if (connection) {
        connection.query(sql, sqlParam, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
        })
      } else {
        if (!pool) {
          initMysqlPool()
        }

        pool.getConnection((err, connection) => {
          if (err) {
            reject(err)
          } else {
            connection.query(sql, sqlParam, (err, rows) => {
              connection.release()
              if (err) {
                reject(err)
              } else {
                resolve(rows)
              }
            })
          }
        })
      }
    })
  },
}