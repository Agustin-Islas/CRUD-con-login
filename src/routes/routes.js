require('dotenv').config();
const express = require('express');
const Note = require('../models/Notes.js');
const User = require('../models/Users.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const process = require('process');
const router = express.Router();

async function renderIndex(req, res, page) {
    const token = req.cookies.access_token;

    if(!token) { return res.status(403).send('No hay token'); }
    
    try {
        const data = jwt.verify(token, process.env.SESSION_SECRET);
        const allNotes = await Note.getAll();
        const userNotes = await allNotes.filter(note => note.user_id === data.id) || [];
        res.render(page, { data, userNotes });
    } catch (error) {  
        res.status(401).send('Token inválido', error);
    }
}

router.post('/login', async (req, res) => {
    const { login_name, login_password } = req.body;
    const user = await User.getByUserName(login_name);
    
    if (!user) { return res.status(404).send('Usuario no encontrado'); }
    const validPassword = await bcrypt.compare(login_password, user.password);
    if (!validPassword) { return res.status(401).send('Contraseña incorrecta'); }
    
    const token = jwt.sign(
        { id: user.id, user_name: user.user_name },
        process.env.SESSION_SECRET,
        { expiresIn: '1h' });

    res.cookie('access_token', token,
        { httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 });
    
    await renderIndex(req, res, 'index');
});

router.post('/logout', async (req, res) => {
    res.clearCookie('access_token');
    res.redirect('/');
});

router.post('/register', async (req, res) => {
    const { user_name, password } = req.body;
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = { user_name, password: passwordHash };
      await User.create(user);
  
      res.redirect('/');    
    } catch (error) {
      res.status(500).send('Error al registrar el usuario', error);
    }
  });

router.post('/backToIndex', async (req, res) => {
    await renderIndex(req, res, 'index');
});

router.get('/createNote', async (req, res) => {  
    await renderIndex(req, res, 'createNote');
});

// Ruta para editar una nota
router.get('/edit/:id', async (req, res) => {
    try {
      const note = await Note.getById(req.params.id);
      res.render('editNote', { note });
    } catch (error) {
      res.status(500).send('Error al obtener la nota', error);
    }
  });

router.post('/notes', async (req, res) => { 
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

router.put('/notes/:id', async (req, res) => {
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

router.delete('/notes/:id', async (req, res) => {
    try {
        const {id} = req.params
        await Note.delete(id);

        await renderIndex(req, res, 'index');
    } catch(error) {
        res.status(500).json({message: 'An error occurred while deleting the note', error});
    }
})

module.exports = router;