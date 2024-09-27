const request = require('supertest');
const app = require('../../app');

describe('Testing App Request', () => {
  let Token;

  // Caso de prueba para crear un nuevo usuario
  it("debería crear un nuevo usuario correctamente", async () => {
    // Datos para crear un nuevo usuario
    const NuevoUsuario = {
      nombre: "nuevo usuario",
      email: "nuevousuario5@gmail.com",
      contrasena: "123456",
      rol: "admin",
      estado: "activo"
    };

    // Act - enviar solicitud POST para crear usuario
    const response = await request(app)
      .post("/api/usuarios/")
      .send(NuevoUsuario)
      .set("Accept", "application/json");

    // Assert - verificar si el usuario se creó exitosamente
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data.id");
    expect(response.body.data.nombre).toBe(NuevoUsuario.nombre);
    expect(response.body.data.email).toBe(NuevoUsuario.email);
  });

  // Caso de prueba para iniciar sesión con un usuario existente
  it("Iniciar sesión con un usuario existente", async () => {
    const loginCredentials = {
      email: "nuevousuario5@gmail.com",
      contrasena: "123456",
    };

    // Act - enviar solicitud POST para iniciar sesión
    const response = await request(app)
      .post("/api/usuarios/inicio-sesion")
      .send(loginCredentials)
      .set("Accept", "application/json");

    // Assert - comprobar si el inicio de sesión se ha realizado correctamente
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "OK");
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data.accessToken).toBeTruthy();

    Token = response.body.data.accessToken;
  });

  // Caso de prueba para obtener todos los usuarios
  it("debería obtener todos los usuarios con un token válido", async () => {
    // Act - enviar solicitud GET para obtener usuarios
    const usuariosResponse = await request(app)
      .get("/api/usuarios")
      .set("Authorization", `Bearer ${Token}`)
      .set("Accept", "application/json");

    // Assert - verificar si se obtuvieron los usuarios exitosamente
    expect(usuariosResponse.statusCode).toBe(200);
    expect(usuariosResponse.body).toBeInstanceOf(Array);
    expect(usuariosResponse.body.length).toBeGreaterThan(0); // Asegura que haya al menos un usuario
  });

  // Caso de prueba de credenciales de inicio de sesión incorrectas
  it("Debería de retornar un 401 por credenciales incorrectas", async () => {
    const UsuarioIncorrecto = {
      email: "no_existe@dominio.com",
      password: "223344",
    };

    // Act - enviar solicitud POST para iniciar sesión
    const response = await request(app)
      .post("/api/usuarios/inicio-sesion")
      .send(UsuarioIncorrecto)
      .set("Accept", "application/json");

    // Assert - verificar si el inicio de sesión falló con estado 401
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error", "Contraseña incorrecta o Usuario no encontrado");

    const ContrasenaIncorrecta = {
      email: "wrong@dominio.com",
      password: "112233",
    };

    // Act - enviar solicitud POST para iniciar sesión
    const respuestaContrasenaIncorrecta = await request(app)
      .post("/api/usuarios/inicio-sesion")
      .send(ContrasenaIncorrecta)
      .set("Accept", "application/json");

    // Assert - verificar si el inicio de sesión falló con estado 401
    expect(respuestaContrasenaIncorrecta.statusCode).toBe(401);
    expect(respuestaContrasenaIncorrecta.body).toHaveProperty("error", "Contraseña incorrecta o Usuario no encontrado");
  });

  // Caso de prueba para obtener un usuario por ID
  it("debería obtener un usuario por ID correctamente", async () => {
    const usuarioId = 1;

    const response = await request(app)
      .get(`/api/usuarios/${usuarioId}`)
      .set('Authorization', `Bearer ${Token}`)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    const usuario = response.body[0];

    expect(usuario).toHaveProperty('id_usuario', usuarioId);
    expect(usuario).toHaveProperty('email');
    expect(usuario).toHaveProperty('nombre');
  });

  // Caso cuando el ID del usuario no es encontrado
  it("debería retornar un 404 si el usuario no existe", async () => {
    const usuarioIdInexistente = 901;

    const response = await request(app)
      .get(`/api/usuarios/${usuarioIdInexistente}`)
      .set('Authorization', `Bearer ${Token}`)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'Usuario no encontrado');
  });

  // Caso cuando no se proporciona un token
  it("debería retornar un 401 si no se proporciona un token", async () => {
    const usuarioId = 12;

    const response = await request(app)
      .get(`/api/usuarios/${usuarioId}`)
      .set('Accept', 'application/json'); // No se establece el token

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Token no proporcionado');
  });

  // Caso cuando el ID no es un número entero
  it("debería retornar un 400 si el ID no es un número entero", async () => {
    const usuarioIdInvalido = 'abc';

    const response = await request(app)
      .get(`/api/usuarios/${usuarioIdInvalido}`)
      .set('Authorization', `Bearer ${Token}`)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0]).toHaveProperty('msg', 'El ID debe ser un número entero');
  });

  // Caso de prueba para actualizar información de un usuario
  it("debería actualizar la información de un usuario correctamente", async () => {
    const usuarioId = 1; // Cambia esto al ID del usuario que deseas actualizar

    const usuarioActualizado = {
      email: "holamundo@midominio.com",
      nombre: "Usuario Actualizados",
      contrasena: "09876",
      rol: "admin",
      estado: "inactivo"
    };

    const response = await request(app)
      .put(`/api/usuarios/${usuarioId}`)
      .send(usuarioActualizado)
      .set("Authorization", `Bearer ${Token}`)
      .set("Accept", "application/json");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "OK");
    expect(response.body.data).toHaveProperty("email", usuarioActualizado.email);
    expect(response.body.data).toHaveProperty("nombre", usuarioActualizado.nombre);
  });

  // Caso cuando se intenta actualizar un usuario que no existe
  it("debería retornar un 404 si el usuario a actualizar no existe", async () => {
    const usuarioIdInexistente = 901;

    const usuarioActualizado = {
      email: "noexiste@gmail.com",
      name: "Usuario Inexistente",
      password: "noexiste",
    };

    const response = await request(app)
      .put(`/api/usuarios/${usuarioIdInexistente}`)
      .send(usuarioActualizado)
      .set("Authorization", `Bearer ${Token}`)
      .set("Accept", "application/json");

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Usuario no encontrado");
  });

  // Caso cuando no se proporciona un token al actualizar
  it("debería retornar un 401 si no se proporciona un token al actualizar", async () => {
    const usuarioId = 43;

    const usuarioActualizado = {
      email: "nuevousuario4@gmail.com",
      name: "Usuario Actualizado",
      password: "nuevacontraseña",
    };

    const response = await request(app)
      .put(`/api/usuarios/${usuarioId}`)
      .send(usuarioActualizado)
      .set("Accept", "application/json"); // No se establece el token

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("message", "Token no proporcionado");
  });

  // Caso cuando el ID no es un número entero al actualizar
  it("debería retornar un 400 si el ID no es un número entero al actualizar", async () => {
    const usuarioIdInvalido = 'abc';

    const usuarioActualizado = {
      email: "usuarioactualizado@gmail.com",
      name: "Usuario Actualizado",
      password: "nuevacontraseña",
    };

    const response = await request(app)
      .put(`/api/usuarios/${usuarioIdInvalido}`)
      .send(usuarioActualizado)
      .set("Authorization", `Bearer ${Token}`)
      .set("Accept", "application/json");

    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0]).toHaveProperty("msg", "El ID debe ser un número entero");
  });
});
