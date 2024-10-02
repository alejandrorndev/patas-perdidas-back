const { body, param , validationResult } = require('express-validator');

const validador = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


const validadorRegistroAnimal = [
    body('nombre_animal')
        .notEmpty().withMessage('El nombre del animal es obligatorio'),
    body('especie')
        .notEmpty().withMessage('La especie es obligatoria'),
    body('raza')
        .notEmpty().withMessage('La raza es obligatoria'),
    body('color')
        .notEmpty().withMessage('El color es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria'),
    body('fecha_perdida')
        .isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
    body('direccion')
        .notEmpty().withMessage('La dirección es obligatoria'),
    body('telefono_contacto')
        .isMobilePhone('any', { strict: false }).withMessage('El teléfono de contacto debe ser un número de teléfono válido'),
    body('telefono_contacto2')
        .optional()
        .isMobilePhone('any', { strict: false }).withMessage('El segundo teléfono de contacto debe ser un número de teléfono válido'),
    body('imagenes')
        .isArray({ min: 1 }).withMessage('Se debe proporcionar al menos una imagen'),
    body('recompensa')
        .optional()
        .isNumeric().withMessage('La recompensa debe ser un valor numérico válido')

];

const validardorAnimalId = [
    param('animalId').isInt().withMessage('El ID debe ser un número entero'),validador
];


const validadorActualizarAnimal = [
    param('animalId')
        .isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo'),
    body('nombre_animal')
        .optional()
        .notEmpty().withMessage('El nombre del animal no puede estar vacío'),
    body('especie')
        .optional()
        .notEmpty().withMessage('La especie no puede estar vacía'),
    body('raza')
        .optional()
        .notEmpty().withMessage('La raza no puede estar vacía'),
    body('color')
        .optional()
        .notEmpty().withMessage('El color no puede estar vacío'),
    body('descripcion')
        .optional()
        .notEmpty().withMessage('La descripción no puede estar vacía'),
    body('direccion')
        .optional()
        .notEmpty().withMessage('La dirección no puede estar vacía'),
    body('telefono_contacto')
        .optional()
        .isMobilePhone('any', { strict: false }).withMessage('El teléfono de contacto debe ser un número de teléfono válido'),
    body('telefono_contacto_opcional')
        .optional()
        .isMobilePhone('any', { strict: false }).withMessage('El teléfono de contacto opcional debe ser un número de teléfono válido'),
    body('imagenes')
        .optional()
        .isArray({ min: 1 }).withMessage('Se debe proporcionar al menos una imagen, si se incluye el campo'),       
    body('recompensa')
        .optional()
        .isNumeric().withMessage('La recompensa debe ser un valor numérico válido')
];

module.exports = {
    validadorRegistroAnimal,
    validardorAnimalId,
    validadorActualizarAnimal
};