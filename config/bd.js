const mysql = require('mysql2');

// Configura la conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // tu usuario de MySQL
  password: '230904',  // tu contraseña de MySQL
  database: 'PW'  // nombre de tu base de datos
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conectado a la base de datos MySQL con ID: ' + db.threadId);
});

module.exports = db;
