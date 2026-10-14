const express = require("express");
const cors = require("cors");
const conexion = require("./db"); // Importamos la conexión creada en db.js

const app = express();

// Middlewares globales
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Habilitar la lectura de datos en formato JSON en el cuerpo (req.body)

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// 1. Obtener todos los productos (READ)
app.get("/productos", (req, res) => {
  const sql = "SELECT * FROM productos";

  conexion.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al consultar:", error);
      return res.status(500).json({ mensaje: "Error al consultar los productos" });
    }
    // Retornamos el array de productos como JSON al cliente
    res.json(resultados);
  });
});

// 2. Crear un nuevo producto (CREATE)
app.post("/productos", (req, res) => {
  const { nombre, precio, stock } = req.body;

  // Consulta parametrizada con '?' para prevenir inyección SQL
  const sql = "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)";
  const valores = [nombre, precio, stock];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al insertar:", error);
      return res.status(500).json({ mensaje: "Error al crear el producto" });
    }

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      id: resultado.insertId,
    });
  });
});

// 3. Actualizar un producto existente (UPDATE)
app.put("/productos/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, precio, stock } = req.body;

  const sql = "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?";
  const valores = [nombre, precio, stock, id];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al actualizar:", error);
      return res.status(500).json({ mensaje: "Error al actualizar el producto" });
    }
    res.json({ mensaje: "Producto actualizado correctamente" });
  });
});

// 4. Eliminar un producto (DELETE)
app.delete("/productos/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM productos WHERE id = ?";

  conexion.query(sql, [id], (error, resultado) => {
    if (error) {
      console.error("Error al eliminar:", error);
      return res.status(500).json({ mensaje: "Error al eliminar el producto" });
    }
    res.json({ mensaje: "Producto eliminado correctamente" });
  });
});

// 5. Guardar un mensaje de contacto (CREATE en formulario)
app.post("/contacto", (req, res) => {
  const { nombre, asunto, correo, mensaje } = req.body;

  if (!nombre || !asunto || !correo || !mensaje) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
  }

  const sql = "INSERT INTO formulario (nombre, asunto, correo, mensaje) VALUES (?, ?, ?, ?)";
  const valores = [nombre, asunto, correo, mensaje];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al guardar mensaje de contacto:", error);
      return res.status(500).json({ mensaje: "Error al guardar el mensaje en la base de datos" });
    }

    res.status(201).json({
      mensaje: "Mensaje de contacto guardado correctamente",
      id: resultado.insertId,
    });
  });
});

// 6. Obtener mensajes de contacto (READ de formulario)
app.get("/contacto", (req, res) => {
  const sql = "SELECT * FROM formulario ORDER BY id DESC";

  conexion.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al consultar mensajes:", error);
      return res.status(500).json({ mensaje: "Error al consultar los mensajes" });
    }
    res.json(resultados);
  });
});

// 7. Eliminar un mensaje de contacto por ID (DELETE de formulario)
app.delete("/contacto/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM formulario WHERE id = ?";

  conexion.query(sql, [id], (error, resultado) => {
    if (error) {
      console.error("Error al eliminar mensaje:", error);
      return res.status(500).json({ mensaje: "Error al eliminar el mensaje" });
    }
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Mensaje no encontrado" });
    }
    res.json({ mensaje: "Mensaje eliminado correctamente" });
  });
});

// 8. Eliminar todos los mensajes de contacto (DELETE ALL de formulario)
app.delete("/contacto", (req, res) => {
  const sql = "DELETE FROM formulario";

  conexion.query(sql, (error, resultado) => {
    if (error) {
      console.error("Error al eliminar todos los mensajes:", error);
      return res.status(500).json({ mensaje: "Error al vaciar los mensajes" });
    }
    res.json({ mensaje: "Todos los mensajes han sido eliminados correctamente" });
  });
});

// Iniciar servidor en el puerto 3000
app.listen(3000, () => {
  console.log(" Servidor ejecutándose en http://localhost:3000");
});