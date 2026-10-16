const API_URL = "https://proyecto-bd-wgm8.onrender.com";

// Elementos del DOM
const listaProductos = document.getElementById("listaProductos");
const formulario = document.getElementById("formularioProducto");
const productoId = document.getElementById("productoId");
const nombreInput = document.getElementById("nombre");
const precioInput = document.getElementById("precio");
const stockInput = document.getElementById("stock");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");

// Elementos del formulario y lista de mensajes de contacto
const formContacto = document.getElementById("formularioContacto");
const nombreContacto = document.getElementById("nombreContacto");
const correoContacto = document.getElementById("correoContacto");
const asuntoContacto = document.getElementById("asuntoContacto");
const mensajeContacto = document.getElementById("mensajeContacto");
const btnEnviarContacto = document.getElementById("btnEnviarContacto");
const listaMensajesContacto = document.getElementById("listaMensajesContacto");
const contadorMensajes = document.getElementById("contadorMensajes");
const btnVaciarMensajes = document.getElementById("btnVaciarMensajes");

// 1. Función para consultar los productos y mostrarlos en el DOM (READ)
async function cargarProductos() {
  if (!listaProductos) return;

  try {
    const respuesta = await fetch(`${API_URL}/productos`);
    const productos = await respuesta.json();

    listaProductos.innerHTML = "";

    if (productos.length === 0) {
      listaProductos.innerHTML = "<p style='color: #64748b;'>No hay productos registrados.</p>";
      return;
    }

    productos.forEach((producto) => {
      const elemento = document.createElement("div");
      elemento.classList.add("producto");

      elemento.innerHTML = `
        <div>
          <h3>${producto.nombre}</h3>
          <p class="producto-precio">Precio: $${producto.precio}</p>
          <p>Stock: ${producto.stock} unidades</p>
        </div>
        <div class="acciones">
          <button class="btn-editar" onclick="cargarEnFormulario(${producto.id}, '${producto.nombre}', ${producto.precio}, ${producto.stock})">Editar</button>
          <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
        </div>
      `;

      listaProductos.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// 2. Cargar datos del producto en el formulario para editar (UPDATE - Paso 1)
function cargarEnFormulario(id, nombre, precio, stock) {
  productoId.value = id;
  nombreInput.value = nombre;
  precioInput.value = precio;
  stockInput.value = stock;

  tituloFormulario.textContent = "Editar Producto";
  btnGuardar.textContent = "Actualizar Producto";
  btnCancelar.style.display = "block";
  nombreInput.focus();
}

// Cancelar edición y restaurar formulario
function cancelarEdicion() {
  formulario.reset();
  productoId.value = "";
  tituloFormulario.textContent = "Registrar Producto";
  btnGuardar.textContent = "Guardar Producto";
  btnCancelar.style.display = "none";
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", cancelarEdicion);
}

// 3. Guardar o Actualizar según si hay un ID seleccionado (CREATE o UPDATE)
if (formulario) {
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evitar que la página se recargue

    const id = productoId.value;
    const nombre = nombreInput.value;
    const precio = precioInput.value;
    const stock = stockInput.value;

    try {
      if (id) {
        // MODO ACTUALIZAR (PUT)
        await fetch(`${API_URL}/productos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, precio, stock }),
        });
      } else {
        // MODO CREAR (POST)
        await fetch(`${API_URL}/productos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, precio, stock }),
        });
      }

      cancelarEdicion(); // Limpiar formulario y restaurar botones
      cargarProductos(); // Refrescar la lista en pantalla
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  });
}

// 4. Eliminar un producto (DELETE)
async function eliminarProducto(id) {
  const confirmar = confirm("¿Deseas eliminar este producto de la base de datos?");
  if (!confirmar) return;

  try {
    await fetch(`${API_URL}/productos/${id}`, {
      method: "DELETE",
    });

    // Si estábamos editando ese mismo producto, cancelamos la edición
    if (productoId.value == id) {
      cancelarEdicion();
    }

    cargarProductos(); // Refrescar la lista en pantalla
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
}

// 5. Formulario de contacto (guardar en base de datos MySQL)
if (formContacto) {
  formContacto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = nombreContacto ? nombreContacto.value.trim() : "";
    const correo = correoContacto ? correoContacto.value.trim() : "";
    const asunto = asuntoContacto ? asuntoContacto.value.trim() : "";
    const mensaje = mensajeContacto ? mensajeContacto.value.trim() : "";

    if (!nombre || !correo || !asunto || !mensaje) {
      alert("Por favor completa todos los campos del formulario.");
      return;
    }

    if (btnEnviarContacto) {
      btnEnviarContacto.disabled = true;
      btnEnviarContacto.textContent = "Enviando...";
    }

    try {
      const respuesta = await fetch(`${API_URL}/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, asunto, mensaje }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al enviar el mensaje");
      }

      const avisoExito = document.getElementById("mensajeExito");
      if (avisoExito) {
        avisoExito.style.display = "block";
        setTimeout(() => {
          avisoExito.style.display = "none";
        }, 5000);
      }

      alert("¡Mensaje enviado y registrado en la base de datos con éxito!");
      formContacto.reset();
      cargarMensajesContacto(); // Refrescar la lista de mensajes inmediatamente
    } catch (error) {
      console.error("Error al enviar el formulario de contacto:", error);
      alert("Hubo un error al registrar el mensaje en la base de datos.");
    } finally {
      if (btnEnviarContacto) {
        btnEnviarContacto.disabled = false;
        btnEnviarContacto.textContent = "Enviar Mensaje";
      }
    }
  });
}

// Función auxiliar para escapar texto y prevenir problemas con caracteres especiales (HTML)
function escaparHTML(texto) {
  if (!texto) return "";
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// 6. Consultar los mensajes de contacto y mostrarlos en el DOM (READ)
async function cargarMensajesContacto() {
  if (!listaMensajesContacto) return;

  try {
    const respuesta = await fetch(`${API_URL}/contacto`);
    if (!respuesta.ok) {
      throw new Error("Error en la respuesta del servidor al consultar mensajes");
    }
    const mensajes = await respuesta.json();

    listaMensajesContacto.innerHTML = "";

    if (contadorMensajes) {
      contadorMensajes.textContent = `${mensajes.length} ${mensajes.length === 1 ? "mensaje" : "mensajes"}`;
    }

    // Mostrar u ocultar el botón de borrar todos los mensajes
    if (btnVaciarMensajes) {
      btnVaciarMensajes.style.display = mensajes.length > 0 ? "inline-flex" : "none";
    }

    if (mensajes.length === 0) {
      listaMensajesContacto.innerHTML = `
        <div class="sin-mensajes">
          <p>No hay mensajes registrados aún. Envía el primero con el formulario de arriba.</p>
        </div>
      `;
      return;
    }

    mensajes.forEach((msg) => {
      const elemento = document.createElement("div");
      elemento.classList.add("mensaje-tarjeta");

      const inicial = msg.nombre ? msg.nombre.trim().charAt(0).toUpperCase() : "?";

      elemento.innerHTML = `
        <div class="mensaje-cabecera">
          <div class="mensaje-autor">
            <div class="mensaje-avatar">${inicial}</div>
            <div class="mensaje-autor-info">
              <h3>${escaparHTML(msg.nombre)}</h3>
              <a href="mailto:${escaparHTML(msg.correo)}" class="mensaje-correo">${escaparHTML(msg.correo)}</a>
            </div>
          </div>
          <div class="mensaje-acciones">
            <span class="mensaje-id">#${msg.id}</span>
            <button class="btn-eliminar-mensaje" onclick="eliminarMensajeContacto(${msg.id})" title="Eliminar este mensaje">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Eliminar
            </button>
          </div>
        </div>
        <div class="mensaje-cuerpo">
          <div class="mensaje-asunto"><strong>Asunto:</strong> ${escaparHTML(msg.asunto)}</div>
          <p class="mensaje-texto">${escaparHTML(msg.mensaje)}</p>
        </div>
      `;

      listaMensajesContacto.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar mensajes de contacto:", error);
    listaMensajesContacto.innerHTML = `
      <div class="sin-mensajes" style="color: #ef4444; border-color: #fca5a5;">
        <p>No fue posible conectar con el servidor para cargar los mensajes.</p>
      </div>
    `;
    if (btnVaciarMensajes) {
      btnVaciarMensajes.style.display = "none";
    }
  }
}

// 7. Eliminar un mensaje de contacto individual (DELETE)
async function eliminarMensajeContacto(id) {
  const confirmar = confirm(`¿Estás seguro de que deseas eliminar el mensaje #${id}?`);
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/contacto/${id}`, {
      method: "DELETE",
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.mensaje || "Error al eliminar el mensaje");
    }

    cargarMensajesContacto(); // Refrescar la lista de mensajes
  } catch (error) {
    console.error("Error al eliminar mensaje:", error);
    alert("Hubo un error al eliminar el mensaje de la base de datos.");
  }
}

// 8. Borrar todos los mensajes de contacto (DELETE ALL)
if (btnVaciarMensajes) {
  btnVaciarMensajes.addEventListener("click", async () => {
    const confirmar = confirm("¿Estás seguro de que deseas borrar TODOS los mensajes de contacto? Esta acción no se puede deshacer.");
    if (!confirmar) return;

    try {
      btnVaciarMensajes.disabled = true;
      btnVaciarMensajes.textContent = "Borrando...";

      const respuesta = await fetch(`${API_URL}/contacto`, {
        method: "DELETE",
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        throw new Error(errorData.mensaje || "Error al vaciar los mensajes");
      }

      cargarMensajesContacto(); // Refrescar la lista de mensajes
    } catch (error) {
      console.error("Error al vaciar los mensajes:", error);
      alert("Hubo un error al eliminar los mensajes.");
    } finally {
      if (btnVaciarMensajes) {
        btnVaciarMensajes.disabled = false;
        btnVaciarMensajes.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Borrar todos
        `;
      }
    }
  });
}

// Llamados iniciales al cargar la página
cargarProductos();
cargarMensajesContacto();