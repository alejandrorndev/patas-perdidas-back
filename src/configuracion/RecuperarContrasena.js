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

    try {
        const query = `
        UPDATE usuarios
        SET token_recuperacion = ?, token_expiracion = ?
        WHERE email = ? `;

    await connection.query(query, [token, tokenExpiracion, email]);

    } catch (error) {
      return { error: 'Error interno del servidor' };  
    }
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
        // Verificar el token y extraer el email
        const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET || 'myresetsecretkey');
        const email = decoded.email;

        const connection = await getConnection();
        const query = `
            SELECT * FROM usuarios 
            WHERE email = ? AND token_recuperacion = ? AND token_expiracion > NOW()
        `;
        
        const result = await connection.query(query, [email, token]);

        console.log('result',result);
        console.log('result typeof', typeof result);


        // Si no hay resultados, el token es inválido o ha expirado
        if (!result || result.length === 0) {
            // Limpiar el token y la expiración de la base de datos
            await UsuarioServicio.LimpiarTokenRecuperacion(email);

            // Enviar un mensaje claro al usuario indicando que el token ha expirado
            return {
                error: true,
                message: 'El token ha expirado. Por favor, solicita un nuevo enlace de recuperación de contraseña.'
            };
        }

        // Si el token es válido, devolver el email
        return { email, error: false };

    } catch (error) {
        // Detectar si el error es porque el token ha expirado
        if (error.name === 'TokenExpiredError') {
            return {
                error: true,
                message: 'El token ha expirado. Por favor, solicita un nuevo enlace de recuperación de contraseña.'
            };
        }

        // Manejar errores como token inválido o mal formado
        return {
            error: true,
            message: 'El token es inválido o está mal formado. Por favor, solicita un nuevo enlace.'
        };
    }
};

module.exports = {
    generarTokenUnico,
    generarUrlRecuperacion,
    almacenarTokenEnBD,
    procesarRecuperacionContrasena,
    validarTokenRecuperacion
};
