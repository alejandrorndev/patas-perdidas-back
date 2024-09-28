const { body, param , validationResult } = require('express-validator');

const validador = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validardorRegistroUsuario = [
    body('email').isEmail().withMessage('Debe ser un correo válido'),
    body('contrasena').isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres'),
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('rol').notEmpty().withMessage('El rol es obligatorio'),
    body('estado').notEmpty().withMessage('El estado es obligatorio'),validador
];

const validardorInicioSesion = [
    body('email').isEmail().withMessage('Debe ser un correo válido'),
    body('contrasena').notEmpty().withMessage('La contraseña es obligatoria'),validador
];

const validardorUsuarioId = [
    param('usuarioId').isInt().withMessage('El ID debe ser un número entero'),validador
];

const validardorActualizacionUsuario = [
    param('usuarioId').isInt().withMessage('El ID debe ser un número entero'),
    body('email').optional().isEmail().withMessage('Debe ser un correo válido'),
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),validador
];

module.exports = {
    validardorRegistroUsuario,
    validardorInicioSesion,
    validardorUsuarioId,
    validardorActualizacionUsuario
};
