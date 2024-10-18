require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { getConnection } = require("../basededatos/mysql");
const UsuarioServicio = require('../servicios/UsuarioServicio');

// Configuramos el transporte con Mailjet
const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 587, // Puerto SMTP de Mailjet
    secure: false, // false para STARTTLS
    auth: {
        user: process.env.MAILJET_API_KEY, // Tu Mailjet API Key
        pass: process.env.MAILJET_SECRET_KEY, // Tu Mailjet Secret Key
    },
});

// Función para enviar el correo de recuperación de contraseña
const enviarCorreoRecuperacion = async (emailDestino, urlRecuperacion) => {
    const mensaje = `
        <h1>Recuperación de contraseña</h1>
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${urlRecuperacion}">Restablecer mi contraseña</a>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <p>Gracias,</p>
        <p>El equipo de tu aplicación</p>
    `;

    const mailOptions = {
        from: 'alejandrorn.dev@gmail.com',
        to: emailDestino, // Correo del destinatario
        subject: 'Recuperación de contraseña',
        html: mensaje // Contenido del correo en formato HTML
    };

    try {
        const info = await transporter.sendMail(mailOptions);
       //e.log('Correo enviado: ', info.response);
    } catch (error) {
       // console.error('Error enviando correo: ', error);
        throw new Error('Error enviando el correo de recuperación.');
    }
};

// Genera un token JWT único para el usuario
const generarTokenUnico = (email) => {
    const secret = process.env.RESET_PASSWORD_SECRET || 'myresetsecretkey';
    const token = jwt.sign({ email }, secret, { expiresIn: '2h' }); // El token expira en 2 horas
    return token;
};

// Genera la URL de recuperación que contiene el token
const generarUrlRecuperacion = (email) => {
    const PORT = process.env.PORT || 3000;
    const token = generarTokenUnico(email);
    const url = `http://localhost:3000/restablecer-contrasena/token=${token}`;
    return { token, url };
};

// Almacena el token y su expiración en la base de datos
const almacenarTokenEnBD = async (email, token) => {
    const connection = await getConnection();
    const tokenExpiracion = new Date(Date.now() + 2 * 60 * 60 * 1000); // Expiración de 2 horas

    try {
        const query = `
            UPDATE usuarios
            SET token_recuperacion = ?, token_expiracion = ?
            WHERE email = ? 
        `;

        await connection.query(query, [token, tokenExpiracion, email]);

    } catch (error) {
        return { error: 'Error interno del servidor' };
    }
};

// Función que genera el token, lo almacena y envía el correo de recuperación
const procesarRecuperacionContrasena = async (email) => {
    const ValidarExistenciaUsuario = await UsuarioServicio.ObtenerUsuarioPorEmail(email);
    
    // Verificar si el usuario existe
    if (!ValidarExistenciaUsuario || ValidarExistenciaUsuario.length === 0) {
        throw new Error("Usuario no encontrado");
    }

    const { token, url } = generarUrlRecuperacion(email);

    // Almacena el token en la base de datos
    await almacenarTokenEnBD(email, token);

    // Enviar el correo de recuperación
    await enviarCorreoRecuperacion(email, url);

    return { message: 'Correo de recuperación enviado.' };
};

const validarTokenRecuperacion = async (token) => {
    try {
        // Verificar el token JWT y extraer el email
        const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET || 'myresetsecretkey');
        const email = decoded.email;

        // Conectar a la base de datos y buscar el token y el email
        const connection = await getConnection();
        const query = `
            SELECT * FROM usuarios 
            WHERE email = ? AND token_recuperacion = ? AND token_expiracion > NOW()
        `;
        const [result] = await connection.query(query, [email, token]);

        // Si no se encuentra el token o ya ha expirado en la base de datos
        if (!result || result.length === 0) {
            // Limpiar el token en la base de datos para mayor seguridad
            await UsuarioServicio.LimpiarTokenRecuperacion(email);

            return {
                error: true,
                message: 'El token ha expirado o no es válido en la base de datos. Solicita un nuevo enlace de recuperación.'
            };
        }

        // Si el token es válido, devolver el email asociado
        return { email, error: false };

    } catch (error) {
        // Manejar el caso en que el token ha expirado según JWT
        if (error.name === 'TokenExpiredError') {
            return {
                error: true,
                message: 'El token ha expirado. Por favor, solicita un nuevo enlace de recuperación de contraseña.'
            };
        }

        // Manejar el caso en que el token es inválido o mal formado
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
    enviarCorreoRecuperacion,
    procesarRecuperacionContrasena,
    validarTokenRecuperacion
};
