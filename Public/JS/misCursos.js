document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("mis-cursos-container");

    try {
        const response = await fetch("/api/misCursos");
        const cursos = await response.json();

        cursos.forEach(curso => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("curso");

            const imagenHTML = curso.imagen_portada
                ? `<img class="curso-portada" src="${curso.imagen_portada}" alt="Portada de ${curso.titulo}">`
                : `<div class="curso-portada-placeholder">Sin imagen</div>`;

            cursoDiv.innerHTML = `
            ${imagenHTML}
            <div class="curso-info">
                <h2>${curso.titulo}</h2>
                <p><strong>Autor:</strong> ${curso.autor}</p>
                <a href="/curso/${curso.id}" class="estudiar-btn">Estudiar</a>
            </div>
            `;
            container.appendChild(cursoDiv);
        });

    } catch (err) {
        container.innerHTML = `<p>Error al cargar tus cursos.</p>`;
        console.error(err);
    }
});