const swaggerJSdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Documentación Técnica",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        Bearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        Bearer: [],
      },
    ],
  },
  apis: ["src/rutas/UsuariosRutas.js"],
};


  
const swaggerSpec = swaggerJSdoc(options);

const swaggerDocs = (app, port) => {
    app.use('/api/documentacion', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api/documentacion.json', (req,res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    })
    console.log( `Documentacion disponible en http://localhost:${process.env.PORT}/api/documentacion`)
}

module.exports = {
    swaggerDocs
};