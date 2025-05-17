let recursoIndex = 0;

document.getElementById('agregarRecursoBtn').addEventListener('click', () => {
  const contenedor = document.getElementById('recursosContainer');
  const recursoDiv = document.createElement('div');

  recursoDiv.innerHTML = `
    <input type="text" name="nombreRecurso[]" placeholder="Nombre del recurso" required>
    <input type="file" name="archivos" required><br>
  `;

  contenedor.appendChild(recursoDiv); 
});

document.getElementById('cursoForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = document.getElementById('cursoForm');
  const formData = new FormData(form);

  try {
    const res = await fetch('/publicar', {
      method: 'POST',
      body: formData
    });

    const text = await res.text();
    alert(text);
    form.reset();
    document.getElementById('recursosContainer').innerHTML = ''; // limpiar recursos agregados
  } catch (err) {
    console.error('Error al enviar curso:', err);
    alert('Ocurrió un error al enviar el curso');
  }
});