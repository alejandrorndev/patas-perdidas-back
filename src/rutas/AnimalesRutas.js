const express = require('express');
const router = express.Router();
const Autenticacion = require("../configuracion/Autenticacion");
const AnimalControlador = require('../controladores/AnimalControlador');
const { ObtenerUsuarioAutenticado } = require('../servicios/AnimalServicio');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/imagenes_animales');
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

router.get('/lista-animles',Autenticacion,AnimalControlador.ObtenerAnimales)


module.exports = router;