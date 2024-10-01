const services = require('../servicios/UsuarioServicio')




const RegistrarUsuario = async (req,res) => {

    try {
        
        const userRegistered = await services.RegistrarUsuario(req.body)
        res.send( { status: 'OK', data: userRegistered})

      } catch (e) {
        console.log(e)
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    
};

const InicioDeSesion = async (req, res) => {
    try {
      const token = await services.InicioDeSesion(req.body);
      res.send({ status: 'OK', data: token });
    } catch (e) {
      if (e.message === 'Usuario no encontrado' || e.message === 'Contraseña incorrecta') {
        return res.status(401).json({ error: "Contraseña incorrecta o Usuario no encontrado" });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const ObtenerUsuarios = async (req,res) => {
    
    try{
        const result = await services.ObtenerUsuarios();
        res.status(200).json({ status: 'OK', data: result });
    } catch (error){
        res.status(500);
        res.send(error.message)
    }

};

const ObtenerUsuario = async (req,res) => {

    try {
      const { usuarioId } = req.params;
      const result = await services.ObtenerUsuario(usuarioId);
  
      // Si el usuario no fue encontrado, devolver un 404
      if (!result) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }
  
      // Si el usuario fue encontrado, devolver los datos
      return res.status(200).json(result);
  
    } catch (error) {
      // Manejar cualquier error inesperado
      res.status(500).json({
        message: error.message || "Error interno del servidor",
      });
    }
     
};

const ActualizarUsuario = async (req, res) => {
    const { usuarioId } = req.params; 
  
    if (!usuarioId) {
      return res.status(400).send({ message: "El ID de usuario es requerido." });
    }
  
    try {
      const result = await services.ActualizarUsuario(usuarioId, req.body); // Espera la llamada asíncrona
      res.status(200).json({ status: 'OK', data: result });
    } catch (error) {
      if (error.message === "Usuario no encontrado") {
        return res.status(404).send({ message: "Usuario no encontrado" });
      }
      console.log(error);
      return res.status(500).send({ message: "Error interno del servidor" });
    }
};

const EliminarUsuario = async (req, res) => {
    try {
      const result = await services.EliminarUsuario(req.params.usuarioId);
      //console.log(result)
      res.status(200).json(result);
  
    } catch (e) {
      if (e.message.includes('No se pudo verificar la existencia del usuario')) {
        res.status(500).json({ error: 'Error interno del servidor' });
      } else if (e.message.includes('Usuario con ID')) {
        res.status(404).json({ error: e.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  };

module.exports = {
    ObtenerUsuarios,
    ObtenerUsuario,
    RegistrarUsuario,
    ActualizarUsuario,
    EliminarUsuario,
    InicioDeSesion
}