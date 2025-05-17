function cerrarSesion() {
    sessionStorage.removeItem('usuario');
    document.getElementById('usuario-info').style.display = 'none';
    document.getElementById('user-menu').style.display = 'none';

    const enlaceUsuarios = document.getElementById('enlace-usuarios');
    if (enlaceUsuarios) {
        enlaceUsuarios.remove();
    }

    const enlaceIngresar = document.getElementById('enlace-ingresar');
    if (enlaceIngresar) {
        enlaceIngresar.style.display = 'block';
    }

    window.location.href = "/";
}


document.addEventListener('DOMContentLoaded', function () {
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));

    if (usuario) {
        // Mostrar info usuario
        document.getElementById('usuario-info').style.display = 'block';
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
        document.getElementById('foto-usuario').src = usuario.foto;

        // Menú usuario
        document.getElementById('foto-usuario-menu').src = usuario.foto;
        document.getElementById('nombre-usuario-menu').textContent = usuario.nombre;

        // Ocultar botón "Ingresar"
        const enlaceIngresar = document.getElementById('enlace-ingresar');
        if (enlaceIngresar) {
            enlaceIngresar.style.display = 'none';
        }

        if (usuario.nombre.toLowerCase() === 'admin') {
            agregarEnlaceUsuarios();
        }
        if (usuario.nombre === 'Profesor') {
            agregarEnlacePublicar();
        }        

        if (usuario.nombre === 'Profesor') {
            agregarEnlaceMaterial();
        }
    }

    // Abrir/cerrar menú usuario
    const usuarioInfo = document.getElementById('usuario-info');
    const userMenu = document.getElementById('user-menu');

    if (usuarioInfo) {
        usuarioInfo.addEventListener('click', function (e) {
            e.stopPropagation();
            userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
        });
    }

    document.addEventListener('click', function (e) {
        if (usuarioInfo && !usuarioInfo.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.style.display = 'none';
        }
    });

    // Login
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
                        sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
                        window.location.href = "/";
                    }
                    else {
                        alert('Correo o contraseña incorrectos');
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    }

    function agregarEnlaceUsuarios() {
        const navList = document.querySelector('.nav-list');
        if (!navList) return;

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

    function agregarEnlacePublicar() {
        const navList = document.querySelector('.nav-list');
        if (!navList) return;
    
        if (!document.getElementById('enlace-publicar')) {
            const li = document.createElement('li');
            li.id = 'enlace-publicar';
            const a = document.createElement('a');
            a.href = 'publicar';
            a.textContent = 'publicar';
            li.appendChild(a);
            navList.appendChild(li);
        }
    }   

    function agregarEnlaceMaterial() {
        const navList = document.querySelector('.nav-list');
        if (!navList) return;
    
        if (!document.getElementById('enlace-material')) {
            const li = document.createElement('li');
            li.id = 'enlace-material';
            const a = document.createElement('a');
            a.href = 'material';
            a.textContent = 'Agregar Material';
            li.appendChild(a);
            navList.appendChild(li);
        }
    }
});