const Animalservicio = require('../servicios/AnimalServicio');


const RegistrarAnimal = async (req, res) => {
    try {
      const id_usuario = req.id_usuario;
  
      const imagenes = req.files.map(file => file.filename);

     // console.log('imagenes controlador',imagenes);
      const result = await Animalservicio.RegistrarAnimal(req.body, id_usuario, imagenes);

      res.status(200).json({ status: 'OK', data: result });
    } catch (e) {
     // console.error(e); // Agregar esto para ver el error en la consola
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  const ObtenerAnimales = async (req,res) => {
    
    try{
        const result = await Animalservicio.ObtenerAnimales();
        res.status(200).json({ status: 'OK', data: result });
    } catch (error){
        res.status(500);
        res.send(error.message)
    }

};

const ObtenerAnimal = async (req,res) => {

  try {
    const { animalId } = req.params;
    const result = await Animalservicio.ObtenerAnimal(animalId);

    // Si el usuario no fue encontrado, devolver un 404
    if (!result) {
      return res.status(404).json({
        message: "Animal no encontrado",
      });
    }

    // Si el usuario fue encontrado, devolver los datos
    res.status(200).json({ status: 'OK', data: result });

  } catch (error) {
    // Manejar cualquier error inesperado
    res.status(500).json({
      message: error.message || "Error interno del servidor",
    });
  }
   
};

const ActualizarAnimal = async (req, res) => {
  
 // const id_usuario = req.id_usuario;
  const { animalId } = req.params; 

  //console.log('id_usuario',id_usuario)

  if (!animalId) {
    return res.status(400).send({ message: "El ID del animal es requerido." });
  }

  const imagenes = req.files.map(file => file.filename);

  try {
    const result = await Animalservicio.ActualizarAnimal(animalId, req.body,imagenes);
    res.status(200).json({ status: 'OK', data: result });
  } catch (error) {
    if (error.message === "Animal no encontrado") {
      return res.status(404).send({ message: "Animal no encontrado" });
    }
   //console.log(error);
    return res.status(500).send({ message: "Error interno del servidor" });
  }
};

const EliminarAnimal = async (req, res) => {
  try {
    //const id_usuario = req.id_usuario;
    const nombre = req.nombre;
    //console.log('nombre',nombre)
    const result = await Animalservicio.EliminarAnimal(req.params.animalId,nombre);
    //console.log(result)
    res.status(200).json({ status: 'OK', data: result });

  } catch (e) {
    if (e.message.includes('No se pudo verificar la existencia del animal')) {
      res.status(500).json({ error: 'Error interno del servidor' });
    } else if (e.message.includes('Animal con ID')) {
      res.status(404).json({ error: e.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};


module.exports = {
  RegistrarAnimal,
  ObtenerAnimales,
  ObtenerAnimal,
  ActualizarAnimal,
  EliminarAnimal
};
