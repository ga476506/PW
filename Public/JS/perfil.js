// Obtener el parámetro 'usuario' de la URL
const urlParams = new URLSearchParams(window.location.search);
const nombreUsuario = urlParams.get('usuario');

document.addEventListener('DOMContentLoaded', function () {
    if (nombreUsuario) {
        // Realizar una solicitud al servidor para obtener los datos del usuario
        fetch(`/perfil/${nombreUsuario}`) // Cambiar de /usuarios a /perfil
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
                    if (data.foto) {
                        document.getElementById('foto').src = data.foto; // Usa directamente el valor de data.foto si ya tiene la ruta completa
                    }                       
                } else {
                    alert('Usuario no encontrado');
                }
            })
            .catch(error => {
                console.error('Error al cargar los datos del usuario:', error);
                alert('Hubo un error al cargar los datos del usuario');
            });
    } else {
        alert('Usuario no válido');
    }

    // Enviar el formulario cuando se haga clic en el botón de guardar cambios
    const form = document.getElementById('edit-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Evitar el envío del formulario

        // Obtener los datos del formulario
        const usuarioEditado = {
            direccion: document.getElementById('direccion').value,
            correo: document.getElementById('correo').value,
            sexo: document.getElementById('sexo').value,
            pais: document.getElementById('pais').value,
            cp: document.getElementById('cp').value,
            ciudad: document.getElementById('ciudad').value,
            estado: document.getElementById('estado').value
        };

        // Enviar los datos al servidor para actualizar el usuario
        fetch(`/perfil/${nombreUsuario}`, {  // Cambiar de /usuarios a /perfil
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioEditado)
        })
            .then(response => response.json())
            .then(data => {
                alert('Usuario actualizado correctamente');
                window.location.href = '/'; // Redirigir a la página de inicio
            })
            .catch(error => {
                console.error('Error al actualizar el usuario:', error);
                alert('Hubo un error al actualizar el usuario');
            });
    });
});