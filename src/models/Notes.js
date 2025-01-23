const pool = require('../config/database');

const Note = {
  getAll: async () => {
    const query = 'SELECT * FROM notes';
    const [rows] = await pool.query(query);
    return rows;
  },

  getById: async (id) => {
    const query = 'SELECT * FROM notes WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  },

  getAllByUser: async (user_id) => {
    const query = 'SELECT * FROM notes WHERE user_id = ?';
    const [rows] = await pool.query(query, [user_id]);
    return rows;
  },

  create: async (note) => {
    const query = 'INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)';
    const [result] = await pool.query(query, [note.title, note.content, note.user_id]);
    return result.insertId;
  },

  update: async (id, note) => {
    const query = 'UPDATE notes SET title = ?, content = ? WHERE id = ?';
    const [result] = await pool.query(query, [note.title, note.content, id]);
    return result.affectedRows;
  },

  delete: async (id) => {
    const query = 'DELETE FROM notes WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
  },

  deleteByUser: async (user_id) => {
    const query = 'DELETE FROM notes WHERE user_id = ?';
    const [result] = await pool.query(query, [user_id]);
    return result.affectedRows;
  }
};

module.exports = Note;
