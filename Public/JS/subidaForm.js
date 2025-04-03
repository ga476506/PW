document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".form-register");
    const nombre = document.getElementById("nombre");
    const paterno = document.getElementById("paterno");
    const materno = document.getElementById("materno");
    const direccion = document.getElementById("direccion");
    const correo = document.getElementById("correo");
    const password = document.getElementById("password");
    const sexoMasculino = document.querySelector("input[name='sexo'][value='Masculino']");
    const sexoFemenino = document.querySelector("input[name='sexo'][value='Femenino']");
    const pais = document.getElementById("Pais");
    const cp = document.getElementById("cp");
    const ciudad = document.getElementById("ciudad");
    const estado = document.getElementById("estado");
    const foto = document.getElementById("foto");
    const boton = document.querySelector(".botons");

    boton.addEventListener("click", function (event) {
        event.preventDefault();
        validarFormulario();
    });

    function validarFormulario() {
        let errores = [];

        const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
        if (!regexNombre.test(nombre.value.trim())) {
            errores.push("El nombre solo puede contener letras y espacios.");
        }
        if (!regexNombre.test(paterno.value.trim())) {
            errores.push("El apellido paterno solo puede contener letras y espacios.");
        }
        if (!regexNombre.test(materno.value.trim())) {
            errores.push("El apellido materno solo puede contener letras y espacios.");
        }

        const regexDireccion = /^[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ\s,.#-]{5,}$/;
        if (!regexDireccion.test(direccion.value.trim())) {
            errores.push("La dirección debe tener al menos 5 caracteres y solo permite letras, números y algunos símbolos (, . # -).");
        }

        const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regexCorreo.test(correo.value.trim())) {
            errores.push("El correo electrónico no es válido.");
        }

        const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!regexPassword.test(password.value)) {
            errores.push("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.");
        }

        // Validar sexo
        if (!sexoMasculino.checked && !sexoFemenino.checked) {
            errores.push("Debe seleccionar un sexo.");
        }

        // Validar los campos de país, código postal, ciudad y estado
        const paisValue = pais.value.trim().toLowerCase();
        if (!paisValue) {
            errores.push("Debe seleccionar un país.");
        }
        if (!cp.value.trim() || !/^\d{5}$/.test(cp.value.trim())) {
            errores.push("El código postal debe ser un número de 5 dígitos.");
        }
        if (!ciudad.value.trim()) {
            errores.push("Debe ingresar una ciudad.");
        }
        if (!estado.value.trim()) {
            errores.push("Debe ingresar un estado.");
        }

        // Validar la foto (opcional, pero si se elige, debe ser una imagen)
        if (foto.files.length > 0) {
            const file = foto.files[0];
            if (!file.type.startsWith("image/")) {
                errores.push("El archivo de foto debe ser una imagen.");
            }
        }

        // Si hay errores, mostramos un mensaje
        if (errores.length > 0) {
            alert("Errores en el formulario:\n" + errores.join("\n"));
        } else {
            enviarFormulario();
        }
    }

    function enviarFormulario() {
        const sexo = sexoMasculino.checked ? "Masculino" : "Femenino";
        let formData = new FormData();

        formData.append("nombre", nombre.value.trim());
        formData.append("paterno", paterno.value.trim());
        formData.append("materno", materno.value.trim());
        formData.append("direccion", direccion.value.trim());
        formData.append("correo", correo.value.trim());
        formData.append("password", password.value.trim());
        formData.append("sexo", sexo);
        formData.append("pais", pais.value.trim().toLowerCase());  // Enviamos el país en minúsculas
        formData.append("cp", cp.value.trim());
        formData.append("ciudad", ciudad.value.trim());
        formData.append("estado", estado.value.trim());
        if (foto.files.length > 0) {
            formData.append("foto", foto.files[0]);
        }

        fetch('/registro', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            alert("Usuario registrado con éxito.");
            console.log(data); // Imprimir respuesta del servidor
        })
        .catch(error => {
            alert("Error al registrar usuario: " + error);
        });
    }
});