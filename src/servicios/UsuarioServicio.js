const { getConnection } = require("../basededatos/mysql");
const bcrypt = require("../configuracion/CifrarContrasena");
const jwt = require("jsonwebtoken");


const ObtenerUsuarioPorEmail = async (email) => {
    const connection = await getConnection();
    const result = await connection.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);
    return result;
};

const RegistrarUsuario = async (user) => {
    const { email, contrasena, nombre, rol, estado  } = user;
  
    const date = Date.now();
    const date_time = new Date(date);
  
    const userExist = await ObtenerUsuarioPorEmail(email);
  
    if (userExist.length === 0) {
      const userRegistered = {
        nombre,
        email,
        contrasena: await bcrypt.encrypt(contrasena),
        rol,
        estado,
        fecha_registro: date_time,
      };
  
      const sql = `INSERT INTO usuarios SET ?`;
      const connection = await getConnection();
      const result = await connection.query(sql, userRegistered); // Espera la consulta y captura el resultado
  
      const RolRegistrado = (rol == 1) ? 'admin' : 'usuario';

      const EstadoRegistrado = (estado == 1) ? 'activo' : 'inactivo';

      return {
        id_usuario: result.insertId,
        email: userRegistered.email,
        nombre: userRegistered.nombre,
        rol: RolRegistrado,
        estado:EstadoRegistrado,
        contrasena: userRegistered.contrasena,
        fecha_registro: userRegistered.fecha_registro,
      };
    }
    return "El usuario ya existe";
};

const InicioDeSesion = async (user) => {
    const { email, contrasena } = user;

    const databaseUser = await ObtenerUsuarioPorEmail(email);

    if (!databaseUser || databaseUser.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const validPassword = await bcrypt.compare(
      contrasena,
      databaseUser[0].contrasena
    );

    if (!validPassword) {
      throw new Error("Contraseña incorrecta");
    }

    const accessToken = jwt.sign(
      {
        nombre: databaseUser[0].nombre,
        id_usuario: databaseUser[0].id_usuario,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60m" }
    );

    const refreshToken = jwt.sign(
      {
        nombre: databaseUser[0].nombre,
        id_usuario: databaseUser[0].id_usuario,
      },
      process.env.REFRESH_TOKEN_SECRET
    );

    return { accessToken, refreshToken };
};

const ObtenerUsuarios = async () => {
    const connection = await getConnection();
    const query = `
                SELECT
                  u.id_usuario,
                  u.nombre,
                  u.email AS correo,
                  u.contrasena AS contraseña,
                  CASE
                    WHEN u.rol = 1 THEN 'admin'
                    WHEN u.rol = 2 THEN 'usuario'
                  END AS perfil,
                  CASE
                    WHEN u.estado = 1 THEN 'activo'
                    WHEN u.estado = 0 THEN 'inactivo'
                  END AS estado,
                  u.fecha_registro
                FROM
                  usuarios u
                ORDER BY
                  u.id_usuario DESC
              `;  
    const result = await connection.query(query);
    return result;
};

const ObtenerUsuario = async (usuarioId) => {
    try {
      const connection = await getConnection();

      const queryXusurio =`
                SELECT
                  u.id_usuario,
                  u.nombre,
                  u.email AS correo,
                  u.contrasena AS contraseña,
                  CASE
                    WHEN u.rol = 1 THEN 'admin'
                    WHEN u.rol = 2 THEN 'usuario'
                  END AS perfil,
                  CASE
                    WHEN u.estado = 1 THEN 'activo'
                    WHEN u.estado = 0 THEN 'inactivo'
                  END AS estado,
                  u.fecha_registro
                FROM
                  usuarios u

                WHERE id_usuario = ?
              `;  
  
      const result = await connection.query(queryXusurio,[usuarioId]
      );
      if (result.length === 0) {
        return null;
      }
    
      return result;
  
    } catch (error) {
      throw new Error(error.message || 'Error al obtener el usuario');
    }
};

const ActualizarUsuario = async (usuarioId, user) => {
    const databaseUser = await ObtenerUsuarioPorEmail(user.email);
    
    // Verificar si el usuario existe
    if (!databaseUser || databaseUser.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const date = Date.now();
    const date_time = new Date(date);
  
    const userRegistered = {
      id_usuario: usuarioId,
      email: user.email,
      contrasena: await bcrypt.encrypt(user.contrasena),
      nombre: user.nombre,
      rol: user.rol,
      estado: user.estado,
      fecha_registro: date_time,
    };

    const RolRegistrado = (user.rol == 1) ? 'admin' : 'usuario';

    const EstadoRegistrado = (user.estado == 1) ? 'activo' : 'inactivo';
  
    const sql = `UPDATE usuarios SET ? WHERE id_usuario = ?`;
    const connection = await getConnection();
    const result = await connection.query(sql, [userRegistered, usuarioId]);
    
    return {
      id_usuario: userRegistered.id_usuario,
      correo: userRegistered.email,
      nombre: userRegistered.nombre,
      perfil: RolRegistrado,
      estado:EstadoRegistrado,
      contrasena: userRegistered.contrasena,
      fecha_registro: userRegistered.fecha_registro,
      message: "Usuario actualizado exitosamente"
    };
};

const EliminarUsuario = async (usuarioId) => {
    const connection = await getConnection();
  
    try {
      // Paso 1: Verificar si el usuario existe
      const verificarUsuarioSql = `SELECT COUNT(*) AS count FROM usuarios WHERE id_usuario = ?`;
      const resultadoVerificacion = await connection.query(verificarUsuarioSql, [usuarioId]);
     // console.log("resultadoVerificacion",resultadoVerificacion)
      if (!Array.isArray(resultadoVerificacion) || resultadoVerificacion.length === 0 || resultadoVerificacion[0].count === undefined || resultadoVerificacion[0].count === 0) {
        return { error: `No se pudo verificar la existencia del usuario con ID ${usuarioId}` };
      }
      
  
      const count  = resultadoVerificacion[0];
      if (count === 0) {
        return { error: `Usuario con ID ${usuarioId} no encontrado` };
      }
  
      // Paso 2: Eliminar el usuario si existe
      const eliminarUsuarioSql = `DELETE FROM usuarios WHERE id_usuario = ?`;
      await connection.query(eliminarUsuarioSql, [usuarioId]);
  
      return { status: "OK", message: "Usuario eliminado exitosamente" };
  
    } catch (error) {
      // Manejar el error sin lanzarlo, devolviendo un mensaje adecuado
      return { error: 'Error interno del servidor' };
    }
  };

  module.exports = {
    ObtenerUsuarios,
    ObtenerUsuarioPorEmail,
    ObtenerUsuario,
    RegistrarUsuario,
    ActualizarUsuario,
    EliminarUsuario,
    InicioDeSesion,
  };