require('dotenv').config();
const express = require('express');
const Note = require('../models/Notes.js');
const User = require('../models/Users.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const process = require('process');
const router = express.Router();

async function renderIndex(req, res, page) {
    const data = req.user;
    console.log(req.user);
  console.log(data.id, data.user_name);
  const allNotes = await Note.getAll();
  const userNotes = allNotes.filter(note => note.user_id === data.id) || [];
  res.render(page, { data, userNotes });
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
router.post('/login', async (req, res) => {
    const { login_name, login_password } = req.body;
    try {
      const user = await User.getByUserName(login_name);
      if (!user) {
        return res.status(404).send('Usuario no encontrado');
      }
      const validPassword = await bcrypt.compare(login_password, user.password);
      if (!validPassword) {
        return res.status(401).send('Contraseña incorrecta');
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
    } catch (error) {
      res.status(500).send('Error al iniciar sesión');
    }
});

router.post('/logout', async (req, res) => {
    res.clearCookie('access_token');
    req.session = null;
    res.redirect('/');
});

router.post('/register', async (req, res) => {
    const { user_name, password } = req.body;
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = { user_name, password: passwordHash };
      await User.create(user);
  
      req.flash('success', 'Usuario registrado correctamente');
      res.redirect('/');
    } catch (error) {
        req.flash('success', 'Este usuario ya existe');
        res.redirect('/');
    }
  });

router.post('/backToIndex', authMiddleware, async (req, res) => {
    await renderIndex(req, res, 'index');
});

router.get('/createNote', authMiddleware, async (req, res) => {  
    await renderIndex(req, res, 'createNote');
});

// Ruta para editar una nota
router.get('/edit/:id', authMiddleware, async (req, res) => {
    try {
      const note = await Note.getById(req.params.id);
      res.render('editNote', { note });
    } catch (error) {
      res.status(500).send('Error al obtener la nota', error);
    }
  });

router.post('/notes', authMiddleware, async (req, res) => { 
    try {
        const newNote = {
            title: req.body.title,
            content: req.body.content,
            user_id: req.body.user_id
          };
        
        await Note.create(newNote);
        console.log(newNote);
        
        await renderIndex(req, res, 'index');	
    } catch(error) {
        res.status(500).json({message: 'An error occurred while creating the note', error});
    }
});

router.get('/notes', async (req, res) => {
    try {
        Note.getAll().then((notes) => {
            res.status(200).json(notes);
        })
    } catch(error) {
        res.status(500).json({message: 'An error occurred while retrieving the notes', error});
    }
});

router.get('/notes:id', async (req, res) => {
    try {
        const {id} = req.params;
        Note.getById(id).then((note) => {
            res.status(200).json(note);
        })
    } catch(error) {
        res.status(500).json({message: 'An error occurred while retrieving the note', error});
    }
})

router.put('/notes/:id', authMiddleware, async (req, res) => {
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
})

router.delete('/notes/:id', authMiddleware, async (req, res) => {
    try {
        const {id} = req.params
        await Note.delete(id);

        await renderIndex(req, res, 'index');
    } catch(error) {
        res.status(500).json({message: 'An error occurred while deleting the note', error});
    }
})

module.exports = router;