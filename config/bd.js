require('dotenv').config();
const mysql = require('mysql2');

// Conexión única envuelta en promesas, usando variables de entorno
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'PW'
});

// Manejo de errores de conexión
connection.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.stack);
    return;
  }
  console.log('Conectado a la base de datos como id', connection.threadId);
});

module.exports = connection.promise();