# API de patas perdidas

**Descripción general**

Esta API RESTful proporciona un conjunto de endpoints para gestionar usuarios, animales, ubicaciones y fotos de animales. Las principales funcionalidades incluyen:

- **Usuarios:** Creación, edición, eliminación y listado de usuarios.
- **Animales:** Creación, edición, eliminación y listado de animales.

_Requisitos previos_

- **Node.js:** Versión 20.17.0 o superior.
- **npm:** Versión 10.8.3 o superior.

**Variables de entorno** Para que la API funcione correctamente, es necesario configurar las siguientes variables de entorno. Crea un archivo .env en la raíz del proyecto y define las variables de la siguiente manera:

- **PORT:** El puerto en el que la API escuchará las solicitudes.
- **MYSQL_HOST:** El host de la base de datos MySQL.
- **MYSQL_USER:** El nombre de usuario para la base de datos MySQL.
- **MYSQL_PASSWORD:** La contraseña para el usuario de la base de datos MySQL.
- **MYSQL_DB:** El nombre de la base de datos MySQL a utilizar.
- **ACCESS_TOKEN_SECRET:** Clave secreta utilizada para firmar los tokens de acceso.
- **REFRESH_TOKEN_SECRET:** Clave secreta utilizada para firmar los tokens de refresco.
- **MAPBOX_ACCESS_TOKEN:** Token de acceso para el servicio de Mapbox.
- **URL_BASE_IMAGENES:** Url en donde estan guardadas las imagenes para poder acceder a ellas por url.
- **RESET_PASSWORD_SECRET:** Clave secreta utilizada para firmar los tokens de recuperar constraseña.

**Instalación y configuración**

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/alejandrorndev/patas-perdidas-back
   ```

2. **Instalar las dependencias:** Este comando descargará e instalará todas las librerías y paquetes necesarios para que la aplicación funcione correctamente.

   ```bash
   npm install

3. **Ejecutar el servidor:** Este comando iniciará el servidor de desarrollo en modo de escucha.

   ```bash
   npm run dev

4. **Ejecutar prueba:** Este comando iniciará la ejecucion de pruebas declaradas para el proyecto..

   ```bash
   npm run test
