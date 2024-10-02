require('dotenv').config();
const jwt = require('jsonwebtoken');
const { getConnection } = require("../basededatos/mysql");
const UsuarioServicio = require('../servicios/UsuarioServicio')

// Genera un token JWT único para el usuario
const generarTokenUnico = (email) => {
    const secret = process.env.RESET_PASSWORD_SECRET || 'myresetsecretkey';
    const token = jwt.sign({ email }, secret, { expiresIn: '1h' }); // El token expira en 1 hora
    return token;
};

// Genera la URL de recuperación que contiene el token
const generarUrlRecuperacion = (email) => {
    const PORT = process.env.PORT
    const token = generarTokenUnico(email);
    const url = `http://localhost:${PORT}/api/usuarios/recuperar-contrasena/${token}`; // Cambia el host por tu dominio si estás en producción
    return { token, url };
};

// Almacena el token y su expiración en la base de datos
const almacenarTokenEnBD = async (email, token) => {
    const connection = await getConnection();
    const tokenExpiracion = new Date(Date.now() + 60 * 60 * 1000); // Expiración de 1 hora

    // Actualiza el usuario con el token de recuperación y la fecha de expiración
    const query = `
        UPDATE usuarios
        SET token_recuperacion = ?, token_expiracion = ?
        WHERE email = ?
    `;
    await connection.query(query, [token, tokenExpiracion, email]);
};

// Función que genera el token y lo almacena en la base de datos
const procesarRecuperacionContrasena = async (email) => {

    const ValidarExistenciaUsuario = await UsuarioServicio.ObtenerUsuarioPorEmail(email);
    
    // Verificar si el usuario existe
    if (!ValidarExistenciaUsuario || ValidarExistenciaUsuario.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const { token, url } = generarUrlRecuperacion(email);

    // Almacena el token en la base de datos
    await almacenarTokenEnBD(email, token);

    // Aquí puedes enviar el correo con la URL generada
    //console.log(`URL de recuperación generada: ${url}`);

    return url;
};

const validarTokenRecuperacion = async (token) => {

    try {

        const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET || 'myresetsecretkey');
        const email = decoded.email;
        //console.log('email',email)
        const connection = await getConnection();
        const query = `
            SELECT * FROM usuarios 
            WHERE email = ? AND token_recuperacion = ? AND token_expiracion > NOW()
        `;
        const result = await connection.query(query, [email,token]);
        //console.log('result',result)
        if (result.length === 0) {
            throw new Error('Token inválido o expirado.');
        }
        return email; 
        
    } catch (error) {
       // console.log(error);
        throw new Error('Token inválido o expirado.');

    }
};

module.exports = {
    generarTokenUnico,
    generarUrlRecuperacion,
    almacenarTokenEnBD,
    procesarRecuperacionContrasena,
    validarTokenRecuperacion
};
