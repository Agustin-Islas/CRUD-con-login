require('dotenv').config();
const Note = require('../models/Notes.js');
const User = require('../models/Users.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const process = require('process');

async function renderIndex(req, res, page) {
  const user = req.user;
  const userNotes = await Note.getAllByUser(user.id) || [];
  res.render(page, { user, userNotes });
}

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(403).send('No hay token');
    }

    try {
      const data = jwt.verify(token, process.env.SESSION_SECRET);
      req.user = data; // Guardar los datos del usuario en req.user
      next();
    } catch (error) {
      return res.status(403).send('Token inválido', error);
    }
  };

// Ruta para iniciar sesión
const login = async (req, res) => {
    const { login_name, login_password } = req.body;
    try {
      const user = await User.getByUserName(login_name);
      if (!user) {
        req.flash('success', 'Usuario no encontrado');
        return res.status(404).redirect('/'); // Usuario no encontrado
      }
      const validPassword = await bcrypt.compare(login_password, user.password);
      if (!validPassword) {
        req.flash('success', 'contraseña incorrecta');
        return res.status(404).redirect('/'); // Contraseña incorrecta
      }
      const token = jwt.sign(
        { id: user.id, user_name: user.user_name },
        process.env.SESSION_SECRET,
        { expiresIn: '1h' }
      );
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 // 1 hora
      });
      req.user = { id: user.id, user_name: user.user_name };
      await renderIndex(req, res, 'index');	
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      res.status(500).send('Error al iniciar sesión');
    }
};

const logout = async (req, res) => {
    res.clearCookie('access_token');
    req.session = null;
    res.redirect('/');
};

const registerUser = async (req, res) => {
    const { user_name, password } = req.body;
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = { user_name, password: passwordHash };
      await User.create(user);
  
      req.flash('success', 'Usuario registrado correctamente');
      res.redirect('/');
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        req.flash('success', 'Este usuario ya existe');
        res.redirect('/');
    }
  };

const backToIndex = async (req, res) => {
    await renderIndex(req, res, 'index');
};

const createNote = async (req, res) => {  
    await renderIndex(req, res, 'createNote');
};

// Ruta para editar una nota
const editNoteId = async (req, res) => {
    try {
      const note = await Note.getById(req.params.id);
      res.render('editNote', { note });
    } catch (error) {
      res.status(500).send('Error al obtener la nota', error);
    }
};

const postNote = async (req, res) => { 
    try {
        const newNote = {
            title: req.body.title,
            content: req.body.content,
            user_id: req.body.user_id
          };
        
        await Note.create(newNote);        
        await renderIndex(req, res, 'index');	
    } catch(error) {
        res.status(500).json({message: 'An error occurred while creating the note', error});
    }
};

const getNotes = async (req, res) => {
    try {
        Note.getAll().then((notes) => {
            res.status(200).json(notes);
        })
    } catch(error) {
        res.status(500).json({message: 'An error occurred while retrieving the notes', error});
    }
};

const getNote = async (req, res) => {
    try {
        const {id} = req.params;
        Note.getById(id).then((note) => {
            res.status(200).json(note);
        })
    } catch(error) {
        res.status(500).json({message: 'An error occurred while retrieving the note', error});
    }
};

const putNote = async (req, res) => {
    try {
        const newNote = {
            title: req.body.title,
            content: req.body.content,
          };
        const {id} = req.params;
        await Note.update(id, newNote);

        await renderIndex(req, res, 'index');
    } catch(error) {
        res.status(500).json({message: 'An error occurred while updating the note', error});
    }
};

const deleteNote = async (req, res) => {
    try {
        const {id} = req.params
        await Note.delete(id);

        await renderIndex(req, res, 'index');
    } catch(error) {
        res.status(500).json({message: 'An error occurred while deleting the note', error});
    }
};

const deleteUser = async (req, res) => {
  try {
      const id = req.user.id;
      await Note.deleteByUser(id);
      await User.delete(id);
      
      res.clearCookie('access_token');
      req.flash('success', 'Cuenta eliminada correctamente');
      res.redirect('/');
      } catch(error) {
      res.status(500).json({message: 'An error occurred while deleting the user', error});
  }
};

module.exports = {
    login,
    logout,
    registerUser,
    backToIndex,
    createNote,
    editNoteId,
    postNote,
    getNotes,
    getNote,
    putNote,
    deleteNote,
    deleteUser,
    authMiddleware
};