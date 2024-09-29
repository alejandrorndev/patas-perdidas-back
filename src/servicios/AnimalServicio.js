const { getConnection } = require("../basededatos/mysql");
const bcrypt = require("../configuracion/CifrarContrasena");
const jwt = require("jsonwebtoken");
const axios = require('axios');


const RegistrarAnimal = async (animal, id_usuario,imagenes) => {
    
const rutaImagen = imagenes; 

  const {
    nombre_animal,
    especie,
    raza,
    color,
    descripcion,
    fecha_perdida,
    direccion
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
    estado:'perdido',
    id_usuario,
    fecha_reporte: date_time
  }

  try {
    
    // Registrar el animal en la base de datos, asociando el id_usuario
    const query = `INSERT INTO animales_perdidos SET ? `;

    const connection = await getConnection();

    const resultado = await connection.query(query, AnimalaRegistrar);

    const id_Animal_autogenerado = resultado.insertId;

    for (const imagen of rutaImagen) {
        const AnimalaRegistrarFoto = {
          id_animal: id_Animal_autogenerado,
          url_foto: imagen,
          fecha_subida: date_time
        };
  
        const queryFoto = `INSERT INTO fotos_animales SET ?`;
        await connection.query(queryFoto, AnimalaRegistrarFoto);
      }


      const coordenadas = await ObtenerCoordenadas(direccion)

      //console.log('coordenadas',coordenadas)

      const AnmaleRegistrarUbicacion = {
        id_animal:id_Animal_autogenerado,
        latitud:coordenadas[1],
        longitud:coordenadas[0],
        direccion,
        fecha_visto:fecha_perdida
      }

      const queryUbicacion = `INSERT INTO ubicaciones SET ?`;
      await connection.query(queryUbicacion, AnmaleRegistrarUbicacion);


      
    return { 
            id:id_Animal_autogenerado, 
            nombre: AnimalaRegistrar.nombre,
            especie:AnimalaRegistrar.especie,
            raza:AnimalaRegistrar.raza,
            color:AnimalaRegistrar.color,
            descripcion:AnimalaRegistrar.descripcion,
            fecha_perdida:AnimalaRegistrar.fecha_perdida,
            direccion:AnmaleRegistrarUbicacion.direccion,
            imagenes_subidas:rutaImagen,
            message: "Animal registrado exitosamente"
     };
  } catch (error) {
   // console.error("Error al registrar el animal:", error);
    throw error;
  }
};


const ObtenerUsuarioAutenticado = (req, res, next) => {
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

const ObtenerCoordenadas = async (direccion) => {

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(direccion)}.json`;
    const params = {
        access_token: process.env.MAPBOX_ACCESS_TOKEN
    };

    try {
        const response = await axios.get(url, { params });
        const lugar = response.data.features[0];
        return lugar.center;
    } catch (error) {
        console.error(error);
    }

}

module.exports = { ObtenerUsuarioAutenticado, RegistrarAnimal };
