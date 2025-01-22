const pool = require('../config/database');
const process = require('process');

const initDb = async () => {
  try {
    const connection = await pool.getConnection();

    // Crear base de datos si no existe
    const createDatabaseQuery = `
      CREATE DATABASE IF NOT EXISTS blogdb;
    `;
    await connection.query(createDatabaseQuery);

    // Usar la base de datos creada
    await connection.query(`USE blogdb;`);

    // Crear tabla `users` si no existe
    const createTableQueryUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    await connection.query(createTableQueryUsers);

    // Crear tabla `notes` si no existe
    const createTableQueryNotes = `
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        user_id INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    await connection.query(createTableQueryNotes);
    /*
    // Agregar claves foráneas después de crear las tablas
    const addForeignKeysQuery = `
      ALTER TABLE notes
      ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `;
    await connection.query(addForeignKeysQuery);
    */
    console.log('Base de datos "blogdb" y tablas creadas o ya existentes.');

    connection.release();
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1); // Finalizar la aplicación en caso de fallo
  }
};

module.exports = initDb;
