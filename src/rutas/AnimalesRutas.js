const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Autenticacion = require("../configuracion/Autenticacion");
const AnimalControlador = require('../controladores/AnimalControlador');
const { ObtenerUsuarioAutenticado } = require('../servicios/AnimalServicio');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/imagenes_animales');
    },
    filename: (req, file, cb) => {
        const extension = file.originalname.split('.').pop(); // Obtiene la extensión del archivo
        cb(null, `imagen-${Date.now()}.${extension}`); // Renombrar el archivo con solo el timestamp y la extensión
    },
});

  
  const upload = multer({ storage });

/**
 * @swagger
 * /api/animales/registrar-animal:
 *   post:
 *     summary: Registrar un animal perdido
 *     description: Permite a un usuario autenticado registrar un animal perdido, proporcionando la información del animal, la dirección y las imágenes asociadas.
 *     tags:
 *       - Animales
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_animal
 *               - especie
 *               - raza
 *               - color
 *               - descripcion
 *               - fecha_perdida
 *               - direccion
 *               - imagenes
 *             properties:
 *               nombre_animal:
 *                 type: string
 *                 description: El nombre del animal.
 *                 example: "Lola"
 *               especie:
 *                 type: string
 *                 description: La especie del animal.
 *                 example: "Gato"
 *               raza:
 *                 type: string
 *                 description: La raza del animal.
 *                 example: "Criollo"
 *               color:
 *                 type: string
 *                 description: El color del animal.
 *                 example: "Blanco"
 *               descripcion:
 *                 type: string
 *                 description: Descripción adicional sobre el animal.
 *                 example: "Lleva un collar rojo y tiene una cicatriz en la pata."
 *               fecha_perdida:
 *                 type: string
 *                 format: date
 *                 description: Fecha en la que el animal fue reportado como perdido.
 *                 example: "2024-09-26"
 *               direccion:
 *                 type: string
 *                 description: La dirección donde se perdió el animal.
 *                 example: "calle 52 #20-05, El Vergel, Medellín"
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Lista de imágenes del animal.
 *             example:
 *               nombre_animal: "Lola"
 *               especie: "Gato"
 *               raza: "Criollo"
 *               color: "Blanco"
 *               descripcion: "Lleva un collar rojo y tiene una cicatriz en la pata."
 *               fecha_perdida: "2024-09-26"
 *               direccion: "calle 52 #20-05, El Vergel, Medellín"
 *     responses:
 *       200:
 *         description: Animal registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 41
 *                     especie:
 *                       type: string
 *                       example: "Gato"
 *                     raza:
 *                       type: string
 *                       example: "Criollo"
 *                     color:
 *                       type: string
 *                       example: "Blanco"
 *                     descripcion:
 *                       type: string
 *                       example: "Lleva un collar rojo y tiene una cicatriz en la pata."
 *                     fecha_perdida:
 *                       type: string
 *                       format: date
 *                       example: "2024-09-26"
 *                     direccion:
 *                       type: string
 *                       example: "calle 52 #20-05, El Vergel, Medellín"
 *                     imagenes_subidas:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [
 *                         "1727585576256-pj11.png",
 *                         "1727585576264-pj10.jpg",
 *                         "1727585576269-WhatsApp Image 2024-09-15 at 6.28.28 PM.jpeg",
 *                         "1727585576270-WhatsApp Image 2024-09-24 at 11.07.17 AM.jpeg"
 *                       ]
 *                     message:
 *                       type: string
 *                       example: "Animal registrado exitosamente"
 *       400:
 *         description: Error en los datos proporcionados o solicitud inválida.
 *       401:
 *         description: Token no proporcionado o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token no proporcionado o inválido"
 *       500:
 *         description: Error interno del servidor.
 */

router.post('/registrar-animal',Autenticacion,ObtenerUsuarioAutenticado,upload.array('imagenes', 5), AnimalControlador.RegistrarAnimal);

/**
 * @swagger
 * /api/animales/lista-animales:
 *   get:
 *     summary: Obtener la lista de animales.
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de animales encontrados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_animal:
 *                         type: integer
 *                         example: 4
 *                       nombre_animal:
 *                         type: string
 *                         example: carlota
 *                       especie:
 *                         type: string
 *                         example: gato
 *                       raza:
 *                         type: string
 *                         example: egipcio
 *                       color:
 *                         type: string
 *                         example: negro
 *                       descripcion:
 *                         type: string
 *                         example: Lleva un collar rojo y tiene una cicatriz en la pata.
 *                       estado:
 *                         type: string
 *                         enum: [encontrado, perdido]
 *                         example: perdido
 *                       direccion:
 *                         type: string
 *                         example: calle 52 #20-05, El Vergel, Medellín
 *                       fecha_perdida:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-09-26T05:00:00.000Z
 *                       nombre_usuario:
 *                         type: string
 *                         example: admin
 *                       fotos_asociadas:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: http://localhost:5002/public/imagenes_animales/imagen-1727644411054.png
 *                   example:
 *                     - id_animal: 4
 *                       nombre_animal: carlota
 *                       especie: gato
 *                       raza: egipcio
 *                       color: negro
 *                       descripcion: Lleva un collar rojo y tiene una cicatriz en la pata.
 *                       estado: perdido
 *                       direccion: calle 52 #20-05, El Vergel, Medellín
 *                       fecha_perdida: 2024-09-26T05:00:00.000Z
 *                       nombre_usuario: admin
 *                       fotos_asociadas:
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727644411054.png
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727644411065.jpeg
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727644411061.jpg
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727644411065.jpeg
 *                     - id_animal: 3
 *                       nombre_animal: carlota
 *                       especie: gato
 *                       raza: egipcio
 *                       color: negro
 *                       descripcion: Lleva un collar rojo y tiene una cicatriz en la pata.
 *                       estado: encontrado
 *                       direccion: calle 52 #20-05, El Vergel, Medellín
 *                       fecha_perdida: 2024-09-26T05:00:00.000Z
 *                       nombre_usuario: admin
 *                       fotos_asociadas:
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727640122579.jpg
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727640122582.jpeg
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727640122570.png
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727640122583.jpeg
 *                     - id_animal: 2
 *                       nombre_animal: Lola
 *                       especie: gato
 *                       raza: criollo
 *                       color: blanco
 *                       descripcion: Lleva un collar rojo y tiene una cicatriz en la pata.
 *                       estado: perdido
 *                       direccion: calle 52 #20-05, El Vergel, Medellín
 *                       fecha_perdida: 2024-09-26T05:00:00.000Z
 *                       nombre_usuario: admin
 *                       fotos_asociadas:
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727639693110.jpeg
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727639693088.png
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727639693112.jpeg
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727639693099.jpg
 *                     - id_animal: 1
 *                       nombre_animal: Lola
 *                       especie: gato
 *                       raza: criollo
 *                       color: blanco
 *                       descripcion: Lleva un collar rojo y tiene una cicatriz en la pata.
 *                       estado: perdido
 *                       direccion: calle 52 #20-05, El Vergel, Medellín
 *                       fecha_perdida: 2024-09-26T05:00:00.000Z
 *                       nombre_usuario: admin
 *                       fotos_asociadas:
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727639666316.png
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727639666365.jpeg
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727639666352.jpg
 *                         - http://localhost:5002/public/imagenes_animales/imagen-1727639666362.jpeg
 *       401:
 *         description: Token no proporcionado o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token no proporcionado o inválido"
 *       500:
 *         description: Error en el servidor.
 */

router.get('/lista-animles',Autenticacion,AnimalControlador.ObtenerAnimales);

/**
 * @swagger
 * /api/animales/obtener-animal/{animalId}:
 *   get:
 *     summary: Obtener un animal por su ID.
 *     tags: [Animales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: animalId
 *         in: path
 *         required: true
 *         description: ID del animal a buscar.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Animal encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_animal:
 *                         type: integer
 *                         example: 1
 *                       nombre_animal:
 *                         type: string
 *                         example: Lola
 *                       especie:
 *                         type: string
 *                         example: gato
 *                       raza:
 *                         type: string
 *                         example: criollo
 *                       color:
 *                         type: string
 *                         example: blanco
 *                       descripcion:
 *                         type: string
 *                         example: Lleva un collar rojo y tiene una cicatriz en la pata.
 *                       estado:
 *                         type: string
 *                         enum: [encontrado, perdido]
 *                         example: perdido
 *                       direccion:
 *                         type: string
 *                         example: calle 52 #20-05, El Vergel, Medellín
 *                       fecha_perdida:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-09-26T05:00:00.000Z
 *                       nombre_usuario:
 *                         type: string
 *                         example: admin
 *                       fotos_asociadas:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: http://localhost:5002/public/imagenes_animales/imagen-1727639666316.png
 *       404:
 *         description: Animal no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Animal no encontrado
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No autorizado
 *       500:
 *         description: Error en el servidor.
 */

router.get('/obtener-animal/:animalId',Autenticacion,AnimalControlador.ObtenerAnimal);

/**
 * @swagger
 * /api/animales/actualizar-animal/{animalId}:
 *   put:
 *     summary: Actualiza la información de un animal
 *     description: Actualiza los datos de un animal existente, incluyendo la posibilidad de subir hasta 5 imágenes.
 *     tags:
 *       - Animales
 *     parameters:
 *       - in: path
 *         name: animalId
 *         required: true
 *         description: ID del animal a actualizar
 *         schema:
 *           type: integer
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Token de autenticación JWT en formato `Bearer {token}`
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imágenes asociadas al animal (máximo 5)
 *               nombre_animal:
 *                 type: string
 *                 description: Nombre del animal
 *               especie:
 *                 type: string
 *                 description: Especie del animal (ejemplo perro, gato)
 *               raza:
 *                 type: string
 *                 description: Raza del animal
 *               color:
 *                 type: string
 *                 description: Color del animal
 *               descripcion:
 *                 type: string
 *                 description: Descripción del animal (ejemplo detalles, cicatrices)
 *               direccion:
 *                 type: string
 *                 description: Dirección donde se encontró o se perdió el animal
 *     responses:
 *       200:
 *         description: Animal actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_animal:
 *                       type: integer
 *                       example: 14
 *                     nombre:
 *                       type: string
 *                       example: "manchas cambiando nombre v1"
 *                     especie:
 *                       type: string
 *                       example: "gato"
 *                     raza:
 *                       type: string
 *                       example: "mencon"
 *                     color:
 *                       type: string
 *                       example: "blanco y negro"
 *                     descripcion:
 *                       type: string
 *                       example: "Lleva un collar marron y tiene una cicatriz en la pata."
 *                     direccion:
 *                       type: string
 *                       example: "calle 50 #20-20, Medellín"
 *                     imagenes_subidas:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "imagen-1727811569441.jpeg"
 *                     message:
 *                       type: string
 *                       example: "Animal actualizado exitosamente"
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El ID del animal es requerido."
 *       401:
 *         description: Token no válido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token no valido"
 *       404:
 *         description: Animal no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Animal no encontrado"
 *       500:
 *         description: Error interno del servidor
 */

router.put("/actualizar-animal/:animalId",Autenticacion,ObtenerUsuarioAutenticado,upload.array('imagenes', 5),AnimalControlador.ActualizarAnimal);


module.exports = router;