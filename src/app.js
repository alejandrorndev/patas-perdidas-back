require('dotenv').config();
const express = require("express");
const UsuariosRutas = require('./rutas/UsuariosRutas');
const AnimalesRutas = require('./rutas/AnimalesRutas');
const { swaggerDocs } = require('./swagger');
const path = require('path');
const cors = require('cors');



const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));


// Middleware
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')));


app.use("/api/usuarios", UsuariosRutas);
app.use("/api/animales", AnimalesRutas);


if (process.env.NODE_ENV !== 'test') {
    swaggerDocs(app);
}

module.exports = app;