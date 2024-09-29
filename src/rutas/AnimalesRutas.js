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
      cb(null, `${Date.now()}-${file.originalname}`); // Renombrar el archivo
    },
  });
  
  const upload = multer({ storage });

/**
 * @swagger
 * /api/animales/registrar-animal:
 *   post:
 *     summary: Registrar un animal perdido
 *     description: Permite a un usuario autenticado registrar un animal perdido, proporcionando la información del animal y asociándolo al usuario autenticado.
 *     tags:
 *       - Animales
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_animal
 *               - especie
 *               - raza
 *               - color
 *               - descripcion
 *               - fecha_perdida
 *             properties:
 *               nombre_animal:
 *                 type: string
 *                 description: El nombre del animal.
 *                 example: "Max"
 *               especie:
 *                 type: string
 *                 description: La especie del animal.
 *                 example: "Perro"
 *               raza:
 *                 type: string
 *                 description: La raza del animal.
 *                 example: "Golden Retriever"
 *               color:
 *                 type: string
 *                 description: El color del animal.
 *                 example: "Dorado"
 *               descripcion:
 *                 type: string
 *                 description: Descripción adicional sobre el animal.
 *                 example: "Lleva un collar rojo y tiene una cicatriz en la pata."
 *               fecha_perdida:
 *                 type: string
 *                 format: date
 *                 description: Fecha en la que el animal fue reportado como perdido.
 *                 example: "2024-09-26"
 *               estado:
 *                 type: string
 *                 description: Estado actual del animal, por defecto 'perdido'.
 *                 example: "perdido"
 *             example:
 *               nombre_animal: "Max"
 *               especie: "Perro"
 *               raza: "Golden Retriever"
 *               color: "Dorado"
 *               descripcion: "Lleva un collar rojo y tiene una cicatriz en la pata."
 *               fecha_perdida: "2024-09-26"
 *               estado: "perdido"
 *     responses:
 *       200:
 *         description: Animal registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Animal registrado exitosamente"
 *                 result:
 *                   type: object
 *                   description: Detalles de la operación en la base de datos.
 *       400:
 *         description: Error en los datos proporcionados o solicitud inválida.
 *       401:
 *         description: Token no proporcionado o no válido.
 *       500:
 *         description: Error interno del servidor.
 */

router.post('/registrar-animal',Autenticacion,ObtenerUsuarioAutenticado,upload.array('imagenes', 5), AnimalControlador.RegistrarAnimal);


module.exports = router;