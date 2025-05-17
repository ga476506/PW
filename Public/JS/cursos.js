document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("cursos-container");

    try {
        const response = await fetch("/api/cursos");
        const cursos = await response.json();

        // Obtener el usuarioId de la sesión
        const usuarioResponse = await fetch("/api/usuarioId");
        const usuarioData = await usuarioResponse.json();
        const usuarioId = usuarioData.usuarioId;

        cursos.forEach(curso => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("curso");

            const imagenHTML = curso.imagen_portada
                ? `<img class="curso-portada" src="${curso.imagen_portada}" alt="Portada de ${curso.titulo}">`
                : `<div class="curso-portada-placeholder">Sin imagen</div>`;

            // Botón de unirse
            const unirseBtnHTML = `
                <button class="unirse-btn" data-curso-id="${curso.id}">Unirse</button>
            `;

            cursoDiv.innerHTML = `
                ${imagenHTML}
                <div class="curso-info">
                    <h2>${curso.titulo}</h2>
                    <p><strong>Autor:</strong> ${curso.autor}</p>
                    ${unirseBtnHTML} <!-- Agregar el botón aquí -->
                </div>
            `;

            // Agregar el evento de clic en el botón Unirse
            cursoDiv.querySelector('.unirse-btn').addEventListener('click', async (e) => {
                const cursoId = e.target.getAttribute('data-curso-id');
                
                // Hacer una petición para asociar el curso con el usuario
                try {
                    const res = await fetch(`/api/unirseCurso`, {
                        method: 'POST',
                        body: JSON.stringify({ cursoId, usuarioId }),
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (res.ok) {
                        alert('Te has unido al curso');
                    } else {
                        alert('Hubo un error al unirse al curso');
                    }
                } catch (err) {
                    console.error('Error al unirse al curso:', err);
                    alert('Error al intentar unirse al curso');
                }
            });

            container.appendChild(cursoDiv);
        });

    } catch (err) {
        container.innerHTML = `<p>Error al cargar cursos.</p>`;
        console.error(err);
    }
});