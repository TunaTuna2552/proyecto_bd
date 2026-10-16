require("dotenv").config();
const mysql = require("mysql2");

//Configuración de la conexión de la BD
const host = process.env.DB_HOST || "localhost";
const port = Number(process.env.DB_PORT) || 3307;
const user = process.env.DB_USER || "root"
const password = process.env.DB_PASSWORD ||  ""
const database = process.env.DB_NAME || "tienda"

//Opcionessde configuración
const configuracion = {
    host,
    port,
    user,
    password,
    database,
};


// Si el host es remoto (TiDB Cloud), habilitar el SSL automática
if (host !== "localhost" && host !== "127.0.0.1") {
    configuracion.ssl = {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
    };
}

//Crear la conexión con MySQL o TiDB Cloud
const conexion = mysql.createConexion(configuracion)

//Comprobamos si la conexió fue exitosa
conexion.connect((error) => {
    if (error) {
        console.error("❌Error al conectar con la base de datos", error.message);
        return;
    }
    console.log(`✅Conexión exitosa con la base de datos (${host}):(${port})`)
});

//Exportar la conexión para reutilizarla en la rutas del servidor
module.exports = conexion;