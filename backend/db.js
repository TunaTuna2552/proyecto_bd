require("dotenv").config();
const mysql = require("mysql2");

//Configuración de la conexión de la BD (soporta prefijos DB_ y BD_)
const host = (process.env.DB_HOST || process.env.BD_HOST || "localhost").trim();
const port = Number(process.env.DB_PORT || process.env.BD_PORT) || 3307;
const user = (process.env.DB_USER || process.env.BD_USER || "root").trim();
const password = (process.env.DB_PASSWORD || process.env.BD_PASSWORD || "").trim();
const database = (process.env.DB_NAME || process.env.BD_NAME || "tienda").trim();

//Opciones de configuración
const configuracion = {
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
};


// Si el host es remoto (TiDB Cloud), habilitar el SSL automática
if (host !== "localhost" && host !== "127.0.0.1") {
    configuracion.ssl = {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
    };
}

//Crear el pool de conexión con MySQL o TiDB Cloud
const conexion = mysql.createPool(configuracion);

//Comprobamos si la conexión fue exitosa
conexion.getConnection((error, conn) => {
    if (error) {
        console.error("❌Error al conectar con la base de datos", error.message);
        return;
    }
    console.log(`✅Conexión exitosa con la base de datos (${host}):(${port})/${database}`);
    conn.release();
});

//Exportar la conexión para reutilizarla en la rutas del servidor
module.exports = conexion;