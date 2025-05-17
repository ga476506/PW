document.addEventListener("DOMContentLoaded", async () => {
  const cursoId = window.location.pathname.split('/').pop();

  try {
    const response = await fetch(`/api/curso/${cursoId}`);
    const data = await response.json();

    const { curso, archivos } = data;

    document.getElementById('titulo').textContent = curso.titulo;
    document.getElementById('descripcion').textContent = curso.descripcion;

    const contenedorBotones = document.getElementById('archivos-botones');
    const contenedorContenido = document.getElementById('archivos-contenido');

    let visibleId = null;

    archivos.forEach((archivo, index) => {
      const contentId = `contenido-${index}`;

      const btn = document.createElement('button');
      btn.textContent = archivo.nombre_original;
      btn.classList.add('toggle-btn');
      btn.onclick = () => {
        if (visibleId && visibleId !== contentId) {
          document.getElementById(visibleId).classList.remove('active');
        }

        const target = document.getElementById(contentId);
        const isVisible = target.classList.contains('active');

        target.classList.toggle('active', !isVisible);
        visibleId = !isVisible ? contentId : null;
      };
      contenedorBotones.appendChild(btn);

      let recursoHTML;
      switch (archivo.tipo) {
        case 'video':
          recursoHTML = `<video controls src="${archivo.ruta}" style="max-width: 100%; max-height: 400px;"></video>`;
          break;
        case 'imagen':
          recursoHTML = `<img src="${archivo.ruta}" alt="${archivo.nombre_original}" style="max-width: 100%; max-height: 400px;">`;
          break;
        case 'audio':
          recursoHTML = `<audio controls src="${archivo.ruta}"></audio>`;
          break;
        case 'pdf':
          recursoHTML = `<iframe src="${archivo.ruta}" style="width: 100%; height: 400px; border: none;"></iframe>`;
          break;
        case 'texto':
          recursoHTML = `<a href="${archivo.ruta}" target="_blank">Leer documento</a>`;
          break;
        default:
          recursoHTML = `<p>Archivo no soportado</p>`;
      }

      const recursoDiv = document.createElement('div');
      recursoDiv.id = contentId;
      recursoDiv.classList.add('archivo-item');
      recursoDiv.innerHTML = `
        <p class="nombre-archivo">${archivo.nombre_original}</p>
        ${recursoHTML}
      `;

      contenedorContenido.appendChild(recursoDiv);
    });
  } catch (err) {
    console.error('Error al cargar el curso:', err);
    document.getElementById('curso-container').innerHTML = '<p>Error al cargar el curso</p>';
  }
});