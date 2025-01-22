const express = require('express');
//const pool = require('./config/database');
const routes = require('./routes/routes');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const app = express();

// Configurar motor de plantillas
app.set('view engine', 'ejs');
app.set('views', './src/views'); // Ruta a la carpeta de vistas

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src/public'));
app.use(methodOverride('_method'));
app.use(cookieParser());

/*
app.use((req, res, next) => { 
  const token = req.cookies.access_token;
  req.session = null;
  if(!token) { return res.status(403).send('No hay token'); }
  
  try {
      const data = jwt.verify(token, process.env.SESSION_SECRET);
      req.session.user = data;
  } catch (error) { return res.status(403).send('Token inválido', error); }

  next();
});
*/

// Rutas de la API
app.use('/api', routes);

// Ruta principal
app.get('/', async (req, res) => {
  try {
    res.render('login');
  } catch (error) {
    res.status(500).send('Error al obtener las notas', error);
  }
});

module.exports = app;
