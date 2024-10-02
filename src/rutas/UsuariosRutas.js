const express = require("express");
const router = express.Router();
const Autenticacion = require("../configuracion/Autenticacion");
const usuarioControlador = require('../controladores/UsuarioControlador');
const { ObtenerUsuarioAutenticado } = require('../servicios/AnimalServicio');
const {
    validardorRegistroUsuario,
    validardorInicioSesion,
    validardorUsuarioId,
    validardorActualizacionUsuario
} = require('../validaciones/validacionUsuarios');

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario
 *                 example: holamundo@midominio.com
 *               nombre:
 *                 type: string
 *                 description: El nombre del usuario
 *                 example: usuario4
 *               contrasena:
 *                 type: string
 *                 description: La contraseña del usuario
 *                 example: 12345
 *               rol:
 *                 type: string
 *                 description: El rol del usuario (admin o usuario)
 *                 example: admin
 *               estado:
 *                 type: string
 *                 description: El estado del usuario (activo o inactivo)
 *                 example: inactivo
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID del usuario registrado
 *                       example: 4
 *                     email:
 *                       type: string
 *                       description: Correo electrónico del usuario registrado
 *                       example: holamundo4@midominio.com
 *                     nombre:
 *                       type: string
 *                       description: Nombre del usuario registrado
 *                       example: usuario4
 *                     rol:
 *                       type: string
 *                       description: Rol del usuario registrado
 *                       example: admin
 *                     estado:
 *                       type: string
 *                       description: Estado del usuario registrado
 *                       example: inactivo
 *                     contrasena:
 *                       type: string
 *                       description: Contraseña cifrada del usuario
 *                       example: $2a$10$3vhjQ5As1ZlvE4Qrp3FIi.MxCF/f3OgX45t2SsDNwI1BpPIlXeVaW
 *                     fecha_registro:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha y hora de registro del usuario
 *                       example: 2024-09-27T05:08:08.940Z
 *       400:
 *         description: Error en la validación de los datos. Por ejemplo, si el email no es válido, la contraseña es muy corta o el nombre está vacío.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Mensaje de error correspondiente a la validación fallida
 *                         examples:
 *                           email:
 *                             value: Debe ser un correo válido
 *                           contrasena:
 *                             value: La contraseña debe tener al menos 4 caracteres
 *                           nombre:
 *                             value: El nombre es obligatorio
 *                       param:
 *                         type: string
 *                         description: El parámetro que falló la validación
 *                         examples:
 *                           email:
 *                             value: email
 *                           contrasena:
 *                             value: contrasena
 *                           nombre:
 *                             value: nombre
 *                       location:
 *                         type: string
 *                         description: Donde se encontró el error (por ejemplo, en el cuerpo de la solicitud)
 *                         example: body
 *       500:
 *         description: Error interno del servidor
 */

router.post("/",validardorRegistroUsuario,usuarioControlador.RegistrarUsuario);

/**
 * @swagger
 * /api/usuarios/inicio-sesion:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario
 *                 example: holamundo@midominio.com
 *               contrasena:
 *                 type: string
 *                 description: La contraseña del usuario
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: Token JWT de acceso generado para el usuario
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mjc0MTQyMTEsImV4cCI6MTcyNzQxNzgxMX0.TRjYdrM3tfvn19gcgRH8CQjSxm0nN_lBn-v71UJnWi4"
 *                     refreshToken:
 *                       type: string
 *                       description: Token JWT de refresco generado para el usuario
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mjc0MTQyMTF9.EEBsw2b5QPPeBYsQhRIVLTyjsZcro7KjNiaQ1A3Yo9o"
 *       400:
 *         description: Error en la validación de los datos. Por ejemplo, si el email no es válido o la contraseña está vacía.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Mensaje de error correspondiente a la validación fallida
 *                         examples:
 *                           email:
 *                             value: Debe ser un correo válido
 *                           contrasena:
 *                             value: La contraseña es obligatoria
 *                       param:
 *                         type: string
 *                         description: El parámetro que falló la validación
 *                         examples:
 *                           email:
 *                             value: email
 *                           contrasena:
 *                             value: contrasena
 *                       location:
 *                         type: string
 *                         description: Donde se encontró el error (por ejemplo, en el cuerpo de la solicitud)
 *                         example: body
 *       401:
 *         description: El usuario no existe en la base de datos o las credenciales son incorrectas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error indicando que el usuario no existe o las credenciales no son válidas
 *                   example: "Credenciales incorrectas o el usuario no existe"
 *       500:
 *         description: Error interno del servidor
 */

router.post("/inicio-sesion",validardorInicioSesion,usuarioControlador.InicioDeSesion);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: Token JWT para la autenticación
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     description: ID del usuario
 *                     example: 2
 *                   email:
 *                     type: string
 *                     description: Correo electrónico del usuario
 *                     example: alejo1@gmail.com
 *                   name:
 *                     type: string
 *                     description: Nombre del usuario
 *                     example: alejooo actualizado
 *                   password:
 *                     type: string
 *                     description: Contraseña cifrada del usuario
 *                     example: $2a$10$otJuIStD8tvBpu/F2mxzG.6MpVoQZsp6T0uPIKj1JiTHA48tl8iem
 *                   registration_date:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha y hora de registro del usuario
 *                     example: 2024-09-14T03:40:50.000Z
 *       401:
 *         description: No autorizado. El token es inválido o no fue proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *                   example: "Token no proporcionado o inválido"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", Autenticacion, usuarioControlador.ObtenerUsuarios);

/**
 * @swagger
 * /api/usuarios/{usuarioId}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a obtener
 *         example: 4
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: Token JWT para la autenticación
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_usuario:
 *                     type: integer
 *                     description: ID del usuario
 *                     example: 4
 *                   nombre:
 *                     type: string
 *                     description: Nombre del usuario
 *                     example: "usuario4"
 *                   email:
 *                     type: string
 *                     description: Correo electrónico del usuario
 *                     example: "holamundo4@midominio.com"
 *                   contrasena:
 *                     type: string
 *                     description: Contraseña cifrada del usuario
 *                     example: "$2a$10$3vhjQ5As1ZlvE4Qrp3FIi.MxCF/f3OgX45t2SsDNwI1BpPIlXeVaW"
 *                   rol:
 *                     type: string
 *                     description: Rol del usuario
 *                     example: "admin"
 *                   estado:
 *                     type: string
 *                     description: Estado del usuario
 *                     example: "inactivo"
 *                   fecha_registro:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha y hora de registro del usuario
 *                     example: "2024-09-27T05:08:08.000Z"
 *       400:
 *         description: Error en el parámetro de ID. El ID debe ser un número entero.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Mensaje de error correspondiente a la validación fallida
 *                         example: El ID debe ser un número entero
 *                       param:
 *                         type: string
 *                         description: El parámetro que falló la validación
 *                         example: usuarioId
 *                       location:
 *                         type: string
 *                         description: Donde se encontró el error (por ejemplo, en la ruta)
 *                         example: path
 *       401:
 *         description: No autorizado. El token es inválido o no fue proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *                   example: "Token no proporcionado o inválido"
 *       404:
 *         description: Usuario no encontrado. El ID proporcionado no corresponde a ningún usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 */

router.get("/:usuarioId",validardorUsuarioId,Autenticacion,usuarioControlador.ObtenerUsuario);

/**
 * @swagger
 * /api/usuarios/{usuarioId}:
 *   put:
 *     summary: Actualizar los detalles de un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *         example: 4
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: Token JWT para la autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 description: ID del usuario
 *                 example: 4
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: "cambios el nombre"
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *                 example: "holamundo4@midominio.com"
 *               contrasena:
 *                 type: string
 *                 description: Nueva contraseña del usuario (opcional)
 *                 example: "112233"
 *               rol:
 *                 type: string
 *                 description: Rol del usuario
 *                 example: "usuario"
 *               estado:
 *                 type: string
 *                 description: Estado del usuario
 *                 example: "inactivo"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_usuario:
 *                       type: integer
 *                       description: ID del usuario
 *                       example: 4
 *                     nombre:
 *                       type: string
 *                       description: Nombre del usuario actualizado
 *                       example: "cambios el nombre"
 *                     email:
 *                       type: string
 *                       description: Correo electrónico actualizado del usuario
 *                       example: "holamundo4@midominio.com"
 *                     contrasena:
 *                       type: string
 *                       description: Contraseña actualizada del usuario (cifrada)
 *                       example: "112233"
 *                     rol:
 *                       type: string
 *                       description: Rol actualizado del usuario
 *                       example: "usuario"
 *                     estado:
 *                       type: string
 *                       description: Estado actualizado del usuario
 *                       example: "inactivo"
 *       400:
 *         description: Error en los datos de entrada. Por ejemplo, el ID no es un número entero o los datos del cuerpo no son válidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Mensaje de error correspondiente a la validación fallida
 *                         example: El ID debe ser un número entero
 *                       param:
 *                         type: string
 *                         description: El parámetro que falló la validación
 *                         example: usuarioId
 *                       location:
 *                         type: string
 *                         description: Donde se encontró el error (por ejemplo, en la ruta o en el cuerpo de la solicitud)
 *                         example: path o body
 *       401:
 *         description: No autorizado. El token es inválido o no fue proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *                   example: "Token no proporcionado o inválido"
 *       404:
 *         description: Usuario no encontrado. El ID proporcionado no corresponde a ningún usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 */

router.put("/:usuarioId",validardorActualizacionUsuario,Autenticacion,usuarioControlador.ActualizarUsuario);

/**
 * @swagger
 * /api/usuarios/{usuarioId}:
 *   delete:
 *     summary: Eliminar un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *         example: 12
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: Token JWT para la autenticación
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: string
 *                   description: Mensaje de confirmación de eliminación
 *                   example: Usuario eliminado exitosamente
 *       400:
 *         description: Error en los datos de entrada. Por ejemplo, el ID no es un número entero o hay datos inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Mensaje de error correspondiente a la validación fallida
 *                         example: El ID debe ser un número entero
 *                       param:
 *                         type: string
 *                         description: El parámetro que falló la validación
 *                         example: usuarioId
 *                       location:
 *                         type: string
 *                         description: Donde se encontró el error (por ejemplo, en la ruta)
 *                         example: path
 *       401:
 *         description: No autorizado. El token es inválido o no fue proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *                   example: "Token no proporcionado o inválido"
 *       404:
 *         description: Usuario no encontrado. El ID proporcionado no corresponde a ningún usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *                   example: "Usuario con ID 12 no encontrado"
 *       500:
 *         description: Error interno del servidor, como fallos al verificar la existencia del usuario o al realizar la eliminación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *                   example: "Error al eliminar el usuario: No se pudo verificar la existencia del usuario con ID 200"
 */

router.delete("/:usuarioId",validardorUsuarioId,Autenticacion,ObtenerUsuarioAutenticado,usuarioControlador.EliminarUsuario);

router.post("/restablecer-contrasena",usuarioControlador.RestablecerContrasena);

router.post("/recuperar-contrasena/:token",usuarioControlador.RecuperarContrasena);



module.exports = router;

