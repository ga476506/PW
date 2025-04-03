// Obtener el parámetro 'id' de la URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', function () {
    // Cargar los datos del usuario cuando se cargue la página
    if (userId) {
        fetch(`/usuarios/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    // Rellenar el formulario con los datos del usuario
                    document.getElementById('nombre').value = data.nombre;
                    document.getElementById('paterno').value = data.paterno;
                    document.getElementById('materno').value = data.materno;
                    document.getElementById('direccion').value = data.direccion;
                    document.getElementById('correo').value = data.correo;
                    document.getElementById('sexo').value = data.sexo;
                    document.getElementById('pais').value = data.pais;
                    document.getElementById('cp').value = data.cp;
                    document.getElementById('ciudad').value = data.ciudad;
                    document.getElementById('estado').value = data.estado;
                } else {
                    alert('Usuario no encontrado');
                }
            })
            .catch(error => {
                console.error('Error al cargar los datos del usuario:', error);
                alert('Hubo un error al cargar los datos del usuario');
            });
    } else {
        alert('ID de usuario no válido');
    }

    // Enviar el formulario cuando se haga clic en el botón de guardar cambios
    const form = document.getElementById('edit-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Evitar el envío del formulario

        // Obtener los datos del formulario
        const usuarioEditado = {
            nombre: document.getElementById('nombre').value,
            paterno: document.getElementById('paterno').value,
            materno: document.getElementById('materno').value,
            direccion: document.getElementById('direccion').value,
            correo: document.getElementById('correo').value,
            sexo: document.getElementById('sexo').value,
            pais: document.getElementById('pais').value,
            cp: document.getElementById('cp').value,
            ciudad: document.getElementById('ciudad').value,
            estado: document.getElementById('estado').value
        };

        // Enviar los datos al servidor para actualizar el usuario
        fetch(`/usuarios/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioEditado)
        })
            .then(response => response.json())
            .then(data => {
                alert('Usuario actualizado correctamente');
                window.location.href = 'registros'; // Redirigir a la lista de usuarios
            })
            .catch(error => {
                console.error('Error al actualizar el usuario:', error);
                alert('Hubo un error al actualizar el usuario');
            });
    });
});