const { getConnection } = require("../basededatos/mysql");
require('dotenv').config();
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
    direccion,
    telefono_contacto,
    telefono_contacto_opcional,
    recompensa
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
    estado:0,
    id_usuario,
    fecha_reporte: date_time,
    telefono_contacto:animal.telefono_contacto,
    telefono_contacto_opcional:animal.telefono_contacto_opcional = animal.telefono_contacto_opcional ? animal.telefono_contacto_opcional : 0,
    recompensa
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
            id_animal:id_Animal_autogenerado, 
            nombre: AnimalaRegistrar.nombre_animal,
            especie:AnimalaRegistrar.especie,
            raza:AnimalaRegistrar.raza,
            color:AnimalaRegistrar.color,
            descripcion:AnimalaRegistrar.descripcion,
            fecha_perdida:AnimalaRegistrar.fecha_perdida,
            direccion:AnmaleRegistrarUbicacion.direccion,
            telefono_contacto_principal:animal.telefono_contacto,
            telefono_contacto_secundario:animal.telefono_contacto_opcional = animal.telefono_contacto_opcional ? animal.telefono_contacto_opcional : "No se registro el segundo numero de contacto",
            recompensa:animal.recompensa,
            imagenes_subidas:rutaImagen,
            message: "Animal registrado exitosamente"
     };
  } catch (error) {
    //console.error("Error al registrar el animal:", error);
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

const ObtenerAnimales= async () => {
    const connection = await getConnection();
    const query = `
            SELECT 
            ap.id_animal,
            ap.nombre_animal,
            ap.especie,
            ap.raza,
            ap.color,
            ap.descripcion,
            CASE
                WHEN ap.estado = 1 THEN 'encontrado'
                WHEN ap.estado = 0 THEN 'perdido'
              END AS estado,
            ub.direccion AS direccion,
            ap.fecha_perdida,
            u.nombre AS nombre_usuario,
            ap.telefono_contacto AS telefono_contacto_principal,
            ap.telefono_contacto_opcional AS telefono_contacto_secundario,
            ap.recompensa AS recompensa,
            GROUP_CONCAT(f.url_foto) AS fotos_asociadas
            FROM 
                animales_perdidos ap 
            JOIN 
                usuarios u ON ap.id_usuario = u.id_usuario
            LEFT JOIN 
                fotos_animales f ON ap.id_animal = f.id_animal
            LEFT JOIN 
                ubicaciones ub ON ap.id_animal = ub.id_animal
            GROUP BY 
                ap.id_animal, u.nombre 
            ORDER BY
                  ap.id_animal DESC`;

const result = await connection.query(query);

const baseUrl = process.env.URL_BASE_IMAGENES;

const animales = result.map((animal) => {
  return {
    ...animal,
    fotos_asociadas: animal.fotos_asociadas
      ? animal.fotos_asociadas.split(",").map((url) => baseUrl + url)
      : [],
  };
});

return animales;
};

const ObtenerAnimal = async (animalId) => {
  try {
    const connection = await getConnection();

    const queryXanimal = `
              SELECT 
            ap.id_animal,
            ap.nombre_animal,
            ap.especie,
            ap.raza,
            ap.color,
            ap.descripcion,
            CASE
                WHEN ap.estado = 1 THEN 'encontrado'
                WHEN ap.estado = 0 THEN 'perdido'
              END AS estado,
            ub.direccion AS direccion,
            ap.fecha_perdida,
            u.nombre AS nombre_usuario,
            ap.telefono_contacto AS telefono_contacto_principal,
            ap.telefono_contacto_opcional AS telefono_contacto_secundario,
            ap.recompensa AS recompensa,
            GROUP_CONCAT(f.url_foto) AS fotos_asociadas
            FROM 
                animales_perdidos ap 
            JOIN 
                usuarios u ON ap.id_usuario = u.id_usuario
            LEFT JOIN 
                fotos_animales f ON ap.id_animal = f.id_animal
            LEFT JOIN 
                ubicaciones ub ON ap.id_animal = ub.id_animal
            WHERE 
                ap.id_animal = ?
            GROUP BY 
                ap.id_animal, u.nombre
            `;  

    const result = await connection.query(queryXanimal,[animalId]);


    if (result.length === 0) {
      return null;
    }
  
const baseUrl = process.env.URL_BASE_IMAGENES;

const animalXid = result.map((animal) => {
  return {
    ...animal,
    fotos_asociadas: animal.fotos_asociadas
      ? animal.fotos_asociadas.split(",").map((url) => baseUrl + url)
      : [],
  };
});

return animalXid;

  } catch (error) {
    throw new Error(error.message || 'Error al obtener el animal');
  }
};

const ActualizarAnimal = async (animalId, animal,imagenes) => {

  const rutaImagen = imagenes; 

  const {
    nombre_animal,
    especie,
    raza,
    color,
    descripcion,
    direccion,
    telefono_contacto,
    telefono_contacto_opcional,
    recompensa
  } = animal;


  const AnimalaActualizar = {
    nombre_animal:animal.nombre_animal,
    especie:animal.especie,
    raza:animal.raza,
    color:animal.color,
    descripcion:animal.descripcion,
    telefono_contacto:animal.telefono_contacto,
    telefono_contacto_opcional:animal.telefono_contacto_opcional = animal.telefono_contacto_opcional ? animal.telefono_contacto_opcional : 0,
    recompensa
  }
  try {
    
    const ValidarExistenciaAnimal = await ObtenerAnimal(animalId);


    if (!ValidarExistenciaAnimal || ValidarExistenciaAnimal.length === 0) {
      throw new Error("Animal no encontrado");
    }

  const sql = `UPDATE animales_perdidos SET ? WHERE id_animal = ?`;
  const connection = await getConnection();
  const result = await connection.query(sql, [AnimalaActualizar, animalId]);

  const date = Date.now();
  const date_time = new Date(date);

  if (rutaImagen && rutaImagen.length > 0) {
    // Eliminar las imágenes existentes del animal solo si se recibieron nuevas imágenes
    const queryEliminarFotos = `DELETE FROM fotos_animales WHERE id_animal = ?`;
    await connection.query(queryEliminarFotos, [animalId]);

    // Insertar las nuevas imágenes
    for (const imagen of rutaImagen) {
      const AnimalaRegistrarFoto = {
        id_animal: animalId,
        url_foto: imagen,
        fecha_subida: date_time,
      };

      const queryInsertarFoto = `INSERT INTO fotos_animales SET ?`;
      await connection.query(queryInsertarFoto, AnimalaRegistrarFoto);
    }
  }

  if (direccion && direccion.trim() !== '') {
    
    const coordenadas = await ObtenerCoordenadas(direccion)


      const AnmaleRegistrarUbicacion = {
        id_animal:animalId,
        latitud:coordenadas[1],
        longitud:coordenadas[0],
        direccion:animal.direccion
      }

      const queryEliminarUbicacion = `DELETE FROM ubicaciones WHERE id_animal = ?`;
      await connection.query(queryEliminarUbicacion, [animalId]);

      const queryUbicacion = `INSERT INTO ubicaciones SET ?`;
      await connection.query(queryUbicacion, AnmaleRegistrarUbicacion);

  }

  return { 
    id_animal:animalId, 
    nombre: animal.nombre_animal,
    especie:AnimalaActualizar.especie,
    raza:AnimalaActualizar.raza,
    color:AnimalaActualizar.color,
    descripcion:AnimalaActualizar.descripcion,
    direccion:animal.direccion = animal.direccion ? animal.direccion : "No se actualizó la dirección",
    telefono_contacto_principal:animal.telefono_contacto,
    telefono_contacto_secundario:animal.telefono_contacto_opcional = animal.telefono_contacto_opcional ? animal.telefono_contacto_opcional : "No se actualizó el segundo numero de contacto",
    recompensa:animal.recompensa,
    imagenes_subidas:rutaImagen,
    message: "Animal actualizado exitosamente"
};

  } catch (error) {
       console.error("Error al actualizar el animal:", error);
       throw error;
  }

};

module.exports = { ObtenerUsuarioAutenticado, RegistrarAnimal, ObtenerAnimales, ObtenerAnimal, ActualizarAnimal };
