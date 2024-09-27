require('dotenv').config();
const express = require("express");
const UsuariosRutas = require('./rutas/UsuariosRutas');
const { swaggerDocs } = require('./swagger');




const app = express();

// Middleware
app.use(express.json());

app.use("/api/usuarios", UsuariosRutas);


if (process.env.NODE_ENV !== 'test') {
    swaggerDocs(app);
}

module.exports = app;