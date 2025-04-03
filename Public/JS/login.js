document.addEventListener('DOMContentLoaded', function () {
    // Verificar si el usuario ya está logueado
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));

    if (usuario) {
        document.getElementById('usuario-info').style.display = 'block';
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
        document.getElementById('foto-usuario').src = usuario.foto;

        document.getElementById('user-menu').style.display = 'none'; 
        document.getElementById('foto-usuario-menu').src = usuario.foto;
        document.getElementById('nombre-usuario-menu').textContent = usuario.nombre;

        // Si el usuario es "admin", agregar el enlace a Usuarios
        if (usuario.nombre.toLowerCase() === 'admin') {
            agregarEnlaceUsuarios();
        }
    }

    // Mostrar/ocultar menú de usuario al hacer clic
    const usuarioInfo = document.getElementById('usuario-info');
    const userMenu = document.getElementById('user-menu');

    if (usuarioInfo) {
        usuarioInfo.addEventListener('click', function (e) {
            e.stopPropagation();
            userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function (e) {
        if (usuarioInfo && !usuarioInfo.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.style.display = 'none';
        }
    });

    // Función para cerrar sesión
    function cerrarSesion() {
        sessionStorage.removeItem('usuario');
        document.getElementById('usuario-info').style.display = 'none';
        document.getElementById('user-menu').style.display = 'none';

        // Eliminar enlace de "Usuarios" al cerrar sesión
        const enlaceUsuarios = document.getElementById('enlace-usuarios');
        if (enlaceUsuarios) {
            enlaceUsuarios.remove();
        }
    }

    // Evento para cerrar sesión
    const cerrarSesionBtn = document.getElementById('cerrar-sesion');
    if (cerrarSesionBtn) {
        cerrarSesionBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            cerrarSesion();
        });
    }

    // Manejo del login
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', function (e) {
            e.preventDefault();

            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('usuario-info').style.display = 'block';
                    document.getElementById('nombre-usuario').textContent = data.usuario.nombre;
                    document.getElementById('foto-usuario').src = data.usuario.foto;

                    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

                    // Si el usuario es "admin", agregar el enlace a Usuarios
                    if (data.usuario.nombre.toLowerCase() === 'admin') {
                        agregarEnlaceUsuarios();
                    }
                } else {
                    alert('Correo o contraseña incorrectos');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // Función para agregar el enlace "Usuarios" al menú de navegación
    function agregarEnlaceUsuarios() {
        const navList = document.querySelector('.nav-list');
        if (!navList) return;

        // Verificar si el enlace ya existe para evitar duplicados
        if (!document.getElementById('enlace-usuarios')) {
            const li = document.createElement('li');
            li.id = 'enlace-usuarios';
            const a = document.createElement('a');
            a.href = 'registros';
            a.textContent = 'Usuarios';
            li.appendChild(a);
            navList.appendChild(li);
        }
    }
});
localStorage.setItem("nombreUsuario", usuario.nombre);