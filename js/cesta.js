// ===== CESTA =====
// Se guarda en localStorage para no perderla al cambiar de página

const ENVIO = 2.95;          // gastos de envío
const ENVIO_GRATIS = 15;     // envío gratis desde 15 €

// Lee la cesta (vacía si no hay nada)
function leerCesta() {
    return JSON.parse(localStorage.getItem('cesta')) || [];
}

// Guarda la cesta y actualiza la navbar
function guardarCesta(cesta) {
    localStorage.setItem('cesta', JSON.stringify(cesta));
    actualizarContador();
}

// 12.9 -> "12,90 €"
function euros(numero) {
    return numero.toFixed(2).replace('.', ',') + ' €';
}

// Cuenta las unidades
function contarUnidades(cesta) {
    let unidades = 0;
    for (const producto of cesta) {
        unidades += producto.cantidad;
    }
    return unidades;
}

// Número de "Mi cesta" en la navbar
function actualizarContador() {
    const contador = document.getElementById('contador-cesta');
    if (contador) {
        contador.textContent = contarUnidades(leerCesta());
    }
}

// Añade un producto (si ya está, suma la cantidad)
function anadirProducto(nombre, precio, cantidad) {
    const cesta = leerCesta();
    const existente = cesta.find(producto => producto.nombre === nombre);

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        cesta.push({ nombre: nombre, precio: precio, cantidad: cantidad });
    }
    guardarCesta(cesta);
}

// ===== BOTONES "AÑADIR" =====
// Cada botón lleva el nombre y el precio en data-
document.querySelectorAll('.btn-anadir').forEach(function (boton) {
    boton.addEventListener('click', function () {
        // En el kit hay campo de cantidad; si no, se añade 1
        const campoCantidad = document.getElementById('cantidad');
        const cantidad = campoCantidad ? Math.max(1, Number(campoCantidad.value) || 1) : 1;

        anadirProducto(boton.dataset.nombre, Number(boton.dataset.precio), cantidad);
        mostrarToast(boton.dataset.nombre);
    });
});

// ===== TOAST "AÑADIDO A LA CESTA" =====
// El HTML se crea aquí para no repetirlo en cada página
function mostrarToast(nombre) {
    let toast = document.getElementById('toastCesta');

    if (!toast) {
        const contenedor = document.createElement('div');
        contenedor.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        contenedor.innerHTML = `
            <div id="toastCesta" class="toast" role="status" aria-live="polite" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">Mi cesta</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Cerrar"></button>
                </div>
                <div class="toast-body">
                    <p id="toast-texto" class="mb-2"></p>
                    <a href="pago.html" class="btn btn-primary btn-sm">Ir a pagar</a>
                </div>
            </div>`;
        document.body.appendChild(contenedor);
        toast = document.getElementById('toastCesta');
    }

    document.getElementById('toast-texto').textContent = nombre + ' añadido a la cesta.';
    bootstrap.Toast.getOrCreateInstance(toast).show();
}

// ===== PÁGINA DE PAGO =====
const lista = document.getElementById('lista-cesta');

function pintarCesta() {
    const cesta = leerCesta();
    lista.innerHTML = '';

    if (cesta.length === 0) {
        lista.innerHTML = '<li class="list-group-item text-center py-4">Tu cesta está vacía. <a href="tienda.html" class="link-primary fw-bold">Ir a la tienda</a></li>';
    }

    let subtotal = 0;

    cesta.forEach(function (producto, indice) {
        subtotal += producto.precio * producto.cantidad;

        const fila = document.createElement('li');
        fila.className = 'list-group-item';
        fila.innerHTML = `
            <div class="d-flex justify-content-between gap-2">
                <div>
                    <h3 class="fs-6 fw-bold">${producto.nombre}</h3>
                    <small>${euros(producto.precio)} / unidad</small>
                </div>
                <strong>${euros(producto.precio * producto.cantidad)}</strong>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <div class="btn-group btn-group-sm" role="group" aria-label="Cantidad">
                    <button type="button" class="btn btn-outline-primary" data-accion="restar" data-indice="${indice}" aria-label="Quitar uno">−</button>
                    <span class="btn btn-outline-primary disabled cantidad-cesta">${producto.cantidad}</span>
                    <button type="button" class="btn btn-outline-primary" data-accion="sumar" data-indice="${indice}" aria-label="Añadir uno">+</button>
                </div>
                <button type="button" class="btn btn-sm btn-link link-danger" data-accion="quitar" data-indice="${indice}">Quitar</button>
            </div>`;
        lista.appendChild(fila);
    });

    // Envío gratis desde 15 € o con la cesta vacía
    const envio = (subtotal >= ENVIO_GRATIS || subtotal === 0) ? 0 : ENVIO;
    const total = subtotal + envio;

    document.getElementById('cesta-unidades').textContent = contarUnidades(cesta);
    document.getElementById('cesta-envio').textContent = envio === 0 ? 'Gratis' : euros(envio);
    document.getElementById('cesta-total').textContent = euros(total);

    // Botón de confirmar con el total (desactivado si no hay nada)
    const confirmar = document.getElementById('boton-confirmar');
    confirmar.textContent = 'Confirmar pedido · ' + euros(total);
    confirmar.disabled = cesta.length === 0;
    document.getElementById('vaciar-cesta').disabled = cesta.length === 0;
}

if (lista) {
    // Botones + / − / quitar
    lista.addEventListener('click', function (evento) {
        const boton = evento.target.closest('button');
        if (!boton) return;

        const cesta = leerCesta();
        const indice = Number(boton.dataset.indice);

        if (boton.dataset.accion === 'sumar') {
            cesta[indice].cantidad++;
        } else if (boton.dataset.accion === 'restar') {
            cesta[indice].cantidad--;
            if (cesta[indice].cantidad === 0) {
                cesta.splice(indice, 1); // si llega a 0, se quita
            }
        } else if (boton.dataset.accion === 'quitar') {
            cesta.splice(indice, 1);
        }

        guardarCesta(cesta);
        pintarCesta();
    });

    // Vaciar cesta
    document.getElementById('vaciar-cesta').addEventListener('click', function () {
        if (confirm('¿Seguro que quieres vaciar la cesta?')) {
            guardarCesta([]);
            pintarCesta();
        }
    });

    // Al confirmar el pedido se vacía la cesta
    document.querySelector('.form-aviso').addEventListener('submit', function () {
        guardarCesta([]);
        pintarCesta();
    });

    pintarCesta();
}

// Número de la navbar al cargar la página
actualizarContador();
