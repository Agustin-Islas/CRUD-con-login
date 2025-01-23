const express = require('express');
const router = express.Router();
const { login,
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
      } = require('../controllers/handlerRequest');

// Ruta para iniciar sesión
router.post('/login', login);

router.post('/logout', logout);

router.post('/register', registerUser);

router.post('/backToIndex', authMiddleware, backToIndex);

router.get('/createNote', authMiddleware, createNote);

// Ruta para editar una nota
router.get('/edit/:id', authMiddleware, editNoteId);

router.post('/notes', authMiddleware, postNote);

router.get('/notes', getNotes);

router.get('/notes:id', getNote);

router.put('/notes/:id', authMiddleware, putNote);

router.delete('/notes/:id', authMiddleware, deleteNote)

router.delete('/user', authMiddleware, deleteUser);

module.exports = router;