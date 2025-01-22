require('dotenv').config(); // Carga las variables de entorno
const process = require('process');
const mysql = require('mysql2/promise');

// Crear la conexión con MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Cambiar según tu configuración
  user: process.env.DB_USER, // Usuario de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña del usuario
  //database: process.env.DB_NAME, // Nombre de tu base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
