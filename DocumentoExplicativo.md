# Guía de Configuración y Ejecución - SaludPlus

Este documento explica paso a paso cómo preparar el entorno para ejecutar este proyecto, ya sea en **Windows** o **Linux (Ubuntu/Debian)**.

---

## 1. Requisitos Previos (Herramientas a Descargar)

Para que el proyecto funcione, necesitas instalar estas tres herramientas básicas:

1.  **Node.js (v18 o superior)**: Es el entorno que ejecuta el código JavaScript en el servidor.
    *   *Windows*: Descarga el instalador `.msi` desde [nodejs.org](https://nodejs.org/).
    *   *Linux*: Ejecuta `sudo apt update && sudo apt install nodejs npm`.
2.  **MySQL**: Base de datos relacional para la información oficial.
    *   *Windows*: Puedes usar MySQL Installer o XAMPP.
    *   *Linux*: `sudo apt install mysql-server`.
3.  **MongoDB**: Base de datos NoSQL para las historias clínicas.
    *   *Windows*: Descarga MongoDB Community Server.
    *   *Linux*: Sigue la guía oficial de MongoDB para tu distribución.

---

## 2. Instalación del Proyecto

Una vez tengas las herramientas, sigue estos pasos en la terminal (PowerShell o Bash):

1.  **Entrar a la carpeta**:
    ```bash
    cd ruta/a/tu/proyecto/simulacro
    ```
2.  **Instalar las Dependencias**:
    Este comando descargará automáticamente las herramientas que mencionaste (Express, Nodemon, CSV-Parser, etc.):
    ```bash
    npm install
    ```
    *Esto instalará:*
    - `express`: El framework para el servidor web.
    - `nodemon`: Para que el servidor se reinicie solo al hacer cambios.
    - `csv-parser`: Para leer el archivo de migración.
    - `mysql2`: Conector para MySQL.
    - `mongoose`: Conector para MongoDB.
    - `dotenv`: Para manejar variables de entorno.

---

## 3. Configuración de Bases de Datos

### MySQL (Relacional)
1. Abre tu cliente de MySQL (clic derecho en XAMPP o terminal).
2. Crea la base de datos y las tablas usando el archivo que está en el proyecto:
   ```bash
   # Puedes copiar y pegar el contenido de:
   # SQL/sql_tables.sql
   ```

### MongoDB (NoSQL)
Asegúrate de que el servicio de MongoDB esté corriendo. Por defecto, el proyecto se conectará a una base de datos llamada `saludplus`.

### Variables de Entorno (`.env`)
Crea un archivo llamado `.env` en la raíz (si no existe) y asegúrate de que tenga tus credenciales:
```env
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=salud_plus
MONGO_URI=mongodb://localhost:27017/saludplus
```

---

## 4. Cómo Ejecutar el Proyecto

Tienes dos formas de iniciarlo:

*   **Modo Desarrollo (Recomendado)**: Usa `nodemon` para que el servidor se actualice al editar código.
    ```bash
    npm run dev
    ```
*   **Modo Producción**: Ejecución normal.
    ```bash
    npm start
    ```

---

## 5. Cómo Probar el Funcionamiento

1.  **Frontend**: Abre tu navegador en `http://localhost:3000`. Verás la interfaz sencilla que creamos.
2.  **Migración (Importar Datos)**:
    Si quieres cargar los datos del CSV inicial:
    ```bash
    # En el navegador o con Postman:
    GET http://localhost:3000/api/migration
    ```
3.  **CRUD de Doctores**: Usa los botones en la página web o los comandos `curl` que están detallados en el archivo `walkthrough.md`.

---

## Tips para Linux 🐧
- Si tienes errores de permisos al instalar, usa `sudo`.
- Para ver si MySQL está corriendo: `sudo systemctl status mysql`.
- Para ver si MongoDB está corriendo: `sudo systemctl status mongod`.
