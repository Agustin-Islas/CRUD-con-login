const pool = require('../config/database');

const User = {
  getAll: async () => {
    const query = 'SELECT * FROM users';
    const [rows] = await pool.query(query);
    return rows;
  },

  getById: async (id) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  },

  getByUserName: async (user_name) => {
    const query = 'SELECT * FROM users WHERE user_name = ?';
    const [rows] = await pool.query(query, [user_name]);
    return rows[0];
  },

  create: async (user) => {
    const query = 'INSERT INTO users (user_name, password) VALUES (?, ?)';
    const [result] = await pool.query(query, [user.user_name, user.password]);
    return result.insertId;
  },

  update: async (id, user) => {
    const query = 'UPDATE users SET user_name = ?, password = ? WHERE id = ?';
    const [result] = await pool.query(query, [user.user_name, id]);
    return result.affectedRows;
  },

  delete: async (id) => {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
  },
};

module.exports = User;
