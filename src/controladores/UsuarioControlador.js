const services = require('../servicios/UsuarioServicio')
const ServicioRecuperarContrasena = require("../configuracion/RecuperarContrasena");

const RegistrarUsuario = async (req, res) => {
  try {
    const userRegistered = await services.RegistrarUsuario(req.body);
    res.status(201).json({ status: 'success', data: userRegistered });
  } catch (e) {
    if (e.message === 'El usuario ya existe') {
      res.status(409).json({ status: 'error', message: e.message });
    } else {
      console.error(e);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
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
      const nombre = req.nombre;
     // console.log('nombre',nombre)
      const result = await services.EliminarUsuario(req.params.usuarioId,nombre);
      //console.log(result)
      res.status(200).json({ status: 'OK', data: result });
  
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


const RestablecerContrasena = async (req,res) => {

    try {

      const { email } = req.body;


      if (!email) {
          return res.status(400).json({ error: 'El email es requerido.' });
      }

      const urlRecuperacion = await ServicioRecuperarContrasena.procesarRecuperacionContrasena(email);

      res.status(200).json({ status: 'OK', url: urlRecuperacion });

    } catch (error) {
      if (error.message === "Usuario no encontrado") {
        return res.status(404).send({ message: "Usuario no encontrado" });
      }
        console.log(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }

  };
  
  const RecuperarContrasena = async (req, res) => {
    const { token } = req.params;
    const { nuevaContrasena } = req.body;

    try {
        // Validar el token de recuperación
        const { email, error, message } = await ServicioRecuperarContrasena.validarTokenRecuperacion(token);

        // Si hay un error, devolver la respuesta adecuada
        if (error) {
            return res.status(400).json({ error: message });
        }

        // Si el token es válido, actualizar la contraseña
        const resultadoActualizacion = await services.ActualizarContrasena(email, nuevaContrasena);

        // Limpiar el token de recuperación de la base de datos
        await services.LimpiarTokenRecuperacion(email);

        // Responder con éxito
        return res.status(200).json({ status: 'OK', data: resultadoActualizacion });

    } catch (e) {
        console.error(e);

        // Si ocurre un error inesperado, responder con un error 500
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};



module.exports = {
    ObtenerUsuarios,
    ObtenerUsuario,
    RegistrarUsuario,
    ActualizarUsuario,
    EliminarUsuario,
    InicioDeSesion,
    RecuperarContrasena,
    RestablecerContrasena
}