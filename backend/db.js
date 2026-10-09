const mysql = require("mysql2");

//Configuración de la conexión a MySQL
const conexion = mysql.createConnection({
    port: 3307,
    host: "localhost",      //Servidor local
    user: "root",       //Usuario dde MySQL (por defecto en XAMPP)
    database: "tienda"      //Nombre de nuestra BD
});

//Comprobar si la conexión fue exitosa

conexion.connect((error) => {
    if (error) {
        console.error("❌ Error al conectar con MySQL:" + error);
        return;
    }
    console.log("✅ Conexión exitosa con MySQL")
});

//Exportar la conexión para reutilizarla en la rutas del servidor
module.exports = conexion;