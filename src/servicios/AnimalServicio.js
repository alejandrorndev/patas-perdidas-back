const { getConnection } = require("../basededatos/mysql");
const bcrypt = require("../configuracion/CifrarContrasena");
const jwt = require("jsonwebtoken");


const RegistrarAnimal = async (animal, id_usuario,imagen) => {
    
const rutaImagen = imagen.path; 

  const {
    nombre_animal,
    especie,
    raza,
    color,
    descripcion,
    fecha_perdida,
    estado
  } = animal;

  const date = Date.now();
  const date_time = new Date(date);

  const AnimalaRegistrar = {
    nombre_animal,
    especie,
    raza,
    color,
    descripcion,
    fecha_perdida,
    estado,
    id_usuario,
    fecha_reporte: date_time
  }

  try {
    
    // Registrar el animal en la base de datos, asociando el id_usuario
    const query = `INSERT INTO animales_perdidos SET ? `;

    const connection = await getConnection();

    const resultado = await connection.query(query, AnimalaRegistrar);

    const id_Animal_autogenerado = resultado.insertId;

    const AnimalaRegistrarFoto = {
        id_animal:id_Animal_autogenerado,
        url_foto:rutaImagen,
        fecha_subida: date_time
      }

    const queryFoto = `INSERT INTO fotos_animales SET ? `;

    const resultadoFoto = await connection.query(queryFoto, AnimalaRegistrarFoto);
    
    return { message: "Animal registrado exitosamente", 
            nombre: AnimalaRegistrar.nombre,
            especie:AnimalaRegistrar.especie,
            raza:AnimalaRegistrar.raza,
            color:AnimalaRegistrar.color,
            descripcion:AnimalaRegistrar.descripcion,
            fecha_perdida:AnimalaRegistrar.fecha_perdida,
            imagen_subida:imagen.filename
     };
  } catch (error) {
   // console.error("Error al registrar el animal:", error);
    throw error;
  }
};

// Obtener el usuario autenticado
const obtenerUsuarioAutenticado = (req, res, next) => {
  try {
    // Obtener el token del header de autorización
    const token = req.headers.authorization.split(' ')[1]; // Bearer token
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Obtener el id_usuario del token decodificado
    req.id_usuario = decoded.id_usuario;
   // console.log('decoded.id_usuario',decoded.nombre)

    // Pasar al siguiente middleware
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido' });
  }
};

module.exports = { obtenerUsuarioAutenticado, RegistrarAnimal };
