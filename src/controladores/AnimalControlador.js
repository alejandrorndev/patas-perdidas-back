const Animalservicio = require('../servicios/AnimalServicio');


const RegistrarAnimal = async (req, res) => {
    try {
      const id_usuario = req.id_usuario;
  
      const imagenes = req.files.map(file => file.filename);

     // console.log('imagenes controlador',imagenes);


      // Invocar el servicio para registrar el animal, pasando los datos del animal, el id_usuario y la imagen
      const result = await Animalservicio.RegistrarAnimal(req.body, id_usuario, imagenes);
  
    
      
      res.status(200).json({ status: 'OK', data: result });
    } catch (e) {
      //console.error(e); // Agregar esto para ver el error en la consola
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

module.exports = {
  RegistrarAnimal,
  ObtenerAnimales
};
