console.log('Cargando usuarios...');
document.addEventListener('DOMContentLoaded', function () {
    fetch('/usuarios')
        .then(response => response.json())  // Convertir respuesta en JSON
        .then(data => {
            console.log(data);  // Agregar esto para verificar qué datos se están recibiendo

            // Ordenar los usuarios por su ID de forma ascendente
            data.sort((a, b) => a.id - b.id);

            const tableBody = document.querySelector('#usuarios-table tbody');
            if (data && data.length > 0) {
                // Limpiar la tabla antes de agregar nuevos registros
                tableBody.innerHTML = '';

                data.forEach((usuario, index) => {
                    const tr = document.createElement('tr');

                    // Asignar un nuevo ID consecutivo para mostrar en la tabla
                    const idConsecutivo = index + 1;

                    tr.innerHTML = `
                        <td>${idConsecutivo}</td>
                        <td>${usuario.nombre}</td>
                        <td>${usuario.paterno}</td>
                        <td>${usuario.materno}</td>
                        <td>${usuario.direccion}</td>
                        <td>${usuario.correo}</td>
                        <td>${usuario.sexo}</td>
                        <td>${usuario.pais}</td>
                        <td>${usuario.cp}</td>
                        <td>${usuario.ciudad}</td>
                        <td>${usuario.estado}</td>
                    `;

                    // Crear la celda de "Acciones"
                    const accionesCell = document.createElement('td');

                    // Crear el botón de editar
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Editar';
                    editButton.classList.add('edit-button'); // Agregar clases si deseas estilizar

                    // Lógica para redirigir al usuario a la página de edición
                    editButton.addEventListener('click', () => {
                        window.location.href = `editar?id=${usuario.id}`;
                    });

                    // Crear el botón de eliminar
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Eliminar';
                    deleteButton.classList.add('delete-button'); // Agregar clases si deseas estilizar

                    // Lógica para eliminar el usuario
                    deleteButton.addEventListener('click', () => {
                        if (confirm(`¿Seguro que deseas eliminar a ${usuario.nombre}?`)) {
                            fetch(`/usuarios/${usuario.id}`, {  // Usar el ID del usuario para eliminar
                                method: 'DELETE',
                            })
                                .then(response => response.json())
                                .then(data => {
                                    // Si la eliminación fue exitosa, recargar la tabla o la página
                                    alert(data.message || 'Usuario eliminado correctamente');
                                    // Recargar la tabla sin el usuario eliminado
                                    actualizarTabla();  // Llamar a una función que recargue los usuarios
                                })
                                .catch(error => {
                                    console.error('Error al eliminar el usuario:', error);
                                    alert('Hubo un error al intentar eliminar al usuario');
                                });
                        }
                    });

                    // Añadir los botones a la celda de acciones
                    accionesCell.appendChild(editButton);
                    accionesCell.appendChild(deleteButton);
                    tr.appendChild(accionesCell);

                    // Agregar la fila a la tabla
                    tableBody.appendChild(tr);
                });
            } else {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="13">No hay usuarios registrados.</td>';
                tableBody.appendChild(tr);
            }
        })
        .catch(error => {
            console.error('Error al cargar los usuarios:', error);
        });
});

// Función para actualizar la tabla después de eliminar un usuario
function actualizarTabla() {
    fetch('/usuarios')
        .then(response => response.json())
        .then(data => {
            // Ordenar los usuarios por su ID de forma ascendente
            data.sort((a, b) => a.id - b.id);

            const tableBody = document.querySelector('#usuarios-table tbody');
            tableBody.innerHTML = '';  // Limpiar la tabla

            if (data.length > 0) {
                data.forEach((usuario, index) => {
                    const tr = document.createElement('tr');

                    // Asignar un nuevo ID consecutivo para mostrar en la tabla
                    const idConsecutivo = index + 1;

                    tr.innerHTML = `
                        <td>${idConsecutivo}</td>
                        <td>${usuario.nombre}</td>
                        <td>${usuario.paterno}</td>
                        <td>${usuario.materno}</td>
                        <td>${usuario.direccion}</td>
                        <td>${usuario.correo}</td>
                        <td>${usuario.sexo}</td>
                        <td>${usuario.pais}</td>
                        <td>${usuario.cp}</td>
                        <td>${usuario.ciudad}</td>
                        <td>${usuario.estado}</td>
                    `;

                    // Crear la celda de "Acciones"
                    const accionesCell = document.createElement('td');
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Editar';
                    editButton.classList.add('edit-button');
                    editButton.addEventListener('click', () => {
                        window.location.href = `editar.html?id=${usuario.id}`;
                    });

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Eliminar';
                    deleteButton.classList.add('delete-button');
                    deleteButton.addEventListener('click', () => {
                        if (confirm(`¿Seguro que deseas eliminar a ${usuario.nombre}?`)) {
                            fetch(`/usuarios/${usuario.id}`, { method: 'DELETE' })
                                .then(response => response.json())
                                .then(data => {
                                    alert(data.message || 'Usuario eliminado correctamente');
                                    actualizarTabla();  // Recargar la tabla después de eliminar
                                })
                                .catch(error => {
                                    console.error('Error al eliminar el usuario:', error);
                                    alert('Hubo un error al intentar eliminar al usuario');
                                });
                        }
                    });

                    accionesCell.appendChild(editButton);
                    accionesCell.appendChild(deleteButton);
                    tr.appendChild(accionesCell);
                    tableBody.appendChild(tr);
                });
            } else {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="13">No hay usuarios registrados.</td>';
                tableBody.appendChild(tr);
            }
        })
        .catch(error => {
            console.error('Error al actualizar la tabla:', error);
        });
}