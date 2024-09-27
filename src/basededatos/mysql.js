const mysql = require('promise-mysql')
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
  });
  
  // Conexión a la base de datos
  const getConnection = () => {
    return connection;
  }

  module.exports = {
    getConnection
  }