const express = require('express');
const initDb = require('./utils/initDB');
const app = require('./app');
const port = 3000;

app.use(express.json());

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('No se pudo conectar a la base de datos:', err);
});