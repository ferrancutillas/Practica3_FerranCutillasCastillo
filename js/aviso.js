// Al enviar el formulario se muestra el modal de aviso
const formulario = document.querySelector('.form-aviso');

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault(); // para que no se recargue la página
    bootstrap.Modal.getOrCreateInstance('#modalAviso').show();
});
