const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./config/bd');
const session = require('express-session');
const app = express();

// Configurar express-session
app.use(session({
  secret: '230904', // Cambia esto por una clave secreta segura
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Configurar otras rutas y middlewares

require('dotenv').config();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'Public', 'Images', 'avatares');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const recursoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'Public', 'Images', 'recursos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const uploadRecurso = multer({ storage: recursoStorage });

const portadaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'Public', 'Images', 'portadas');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const uploadPortada = multer({ storage: portadaStorage });

app.use(express.static(path.join(__dirname, 'Public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/formulario', (req, res) => res.sendFile(path.join(__dirname, 'views', 'formulario.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/registros', (req, res) => res.sendFile(path.join(__dirname, 'views', 'registros.html')));
app.get('/editar', (req, res) => res.sendFile(path.join(__dirname, 'views', 'editar.html')));
app.get('/perfils', (req, res) => res.sendFile(path.join(__dirname, 'views', 'perfil.html')));
app.get('/cursos', (req, res) => res.sendFile(path.join(__dirname, 'views', 'cursos.html')));
app.get('/publicar', (req, res) => res.sendFile(path.join(__dirname, 'views', 'publicar.html')));
app.get('/misCursos', (req, res) => res.sendFile(path.join(__dirname, 'views', 'misCursos.html')));
app.get('/curso/:id', (req, res) => { res.sendFile(path.join(__dirname, 'views', 'curso.html')); });
app.get('/material', (req, res) => { res.sendFile(path.join(__dirname, 'views', 'material.html')); });
app.post('/registro', upload.single('foto'), async (req, res) => {
  const { nombre, paterno, materno, direccion, correo, password, sexo, pais, cp, ciudad, estado } = req.body;
  const foto = req.file ? `/Images/avatares/${req.file.filename}` : null;
  if (![nombre, paterno, materno, direccion, correo, password, sexo, pais, cp, ciudad, estado].every(Boolean)) return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  const correoRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!correoRegex.test(correo)) return res.status(400).json({ error: 'Correo electrónico inválido.' });
  const cpRegex = /^[0-9]{5}$/;
  if (!cpRegex.test(cp)) return res.status(400).json({ error: 'Código postal inválido. Debe tener 5 dígitos numéricos.' });
  try {
    const sql = `INSERT INTO usuarios (nombre, paterno, materno, direccion, correo, password, sexo, pais, cp, ciudad, estado, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.query(sql, [nombre, paterno, materno, direccion, correo, password, sexo, pais.toLowerCase(), cp, ciudad, estado, foto]);
    res.send('¡Registro exitoso!');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar los datos.' });
  }
});

app.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  try {
    const [rows] = await db.query('SELECT id, nombre, foto FROM usuarios WHERE correo = ? AND password = ?', [correo, password]);
    if (rows.length) {
      // Guardar el id del usuario en la sesión
      req.session.usuarioId = rows[0].id;
      req.session.usuarioNombre = rows[0].nombre;  // Puedes agregar más datos si lo necesitas
      return res.json({ success: true, usuario: rows[0] });
    }
    return res.json({ success: false, error: 'Correo o contraseña incorrectos.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar la base de datos.' });
  }
});


app.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, paterno, materno, direccion, correo, sexo, pais, cp, ciudad, estado FROM usuarios');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los usuarios.' });
  }
});

app.get('/usuarios/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
    if (rows.length) return res.json(rows[0]);
    res.status(404).json({ error: 'Usuario no encontrado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  const { nombre, paterno, materno, direccion, correo, sexo, pais, cp, ciudad, estado } = req.body;
  if (![nombre, paterno, materno, direccion, correo, sexo, pais, cp, ciudad, estado].every(Boolean)) return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  try {
    const [result] = await db.query('UPDATE usuarios SET nombre=?, paterno=?, materno=?, direccion=?, correo=?, sexo=?, pais=?, cp=?, ciudad=?, estado=? WHERE id=?', [nombre, paterno, materno, direccion, correo, sexo, pais.toLowerCase(), cp, ciudad, estado, req.params.id]);
    if (result.affectedRows) return res.json({ message: 'Usuario actualizado correctamente.' });
    res.status(404).json({ message: 'Usuario no encontrado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
});

app.get('/api/usuarioId', (req, res) => {
  if (req.session.usuarioId) {
    return res.json({ usuarioId: req.session.usuarioId });
  }
  return res.status(401).json({ error: 'Usuario no autenticado' });
});

app.get('/perfil/:usuario', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE nombre = ?', [req.params.usuario]);
    if (rows.length) return res.json(rows[0]);
    res.status(404).json({ error: 'Perfil no encontrado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el perfil.' });
  }
});

app.put('/perfil/:usuario', async (req, res) => {
  const { direccion, correo, sexo, pais, cp, ciudad, estado } = req.body;
  try {
    await db.query('UPDATE usuarios SET direccion=?, correo=?, sexo=?, pais=?, cp=?, ciudad=?, estado=? WHERE nombre=?', [direccion, correo, sexo, pais.toLowerCase(), cp, ciudad, estado, req.params.usuario]);
    res.json({ message: 'Perfil actualizado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el perfil.' });
  }
});

const uploadCurso = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let dir;
      if (file.fieldname === 'imagen_portada') {
        dir = path.join(__dirname, 'Public', 'Images', 'portadas');
      } else if (file.fieldname === 'archivos') {
        dir = path.join(__dirname, 'Public', 'Images', 'recursos');
      }

      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  })
});

app.post('/publicar', uploadCurso.fields([
  { name: 'imagen_portada', maxCount: 1 },
  { name: 'archivos', maxCount: 10 }
]), async (req, res) => {
  const { titulo, descripcion, autor } = req.body;
  const archivos = req.files['archivos'] || [];
  const imagenPortada = req.files['imagen_portada']?.[0];

  try {
    const imagenRuta = imagenPortada ? `/Images/portadas/${imagenPortada.filename}` : null;

    const [result] = await db.query(
      'INSERT INTO cursos (titulo, descripcion, autor, imagen_portada) VALUES (?, ?, ?, ?)',
      [titulo, descripcion, autor, imagenRuta]
    );
    const cursoId = result.insertId;

    const nombres = req.body.nombreRecurso;

    archivos.forEach(async (file, i) => {
      const ext = path.extname(file.originalname).toLowerCase();
      let tipo = 'texto';
      if (['.mp4', '.webm'].includes(ext)) tipo = 'video';
      else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) tipo = 'imagen';  // <-- AQUÍ
      else if (['.mp3', '.wav'].includes(ext)) tipo = 'audio';
      else if (['.pdf'].includes(ext)) tipo = 'pdf';

      const nombreRecurso = Array.isArray(nombres) ? nombres[i] : nombres;

      await db.query(
        'INSERT INTO archivos (curso_id, tipo, nombre_original, ruta) VALUES (?, ?, ?, ?)',
        [cursoId, tipo, nombreRecurso || file.originalname, `/Images/recursos/${file.filename}`]
      );
    });

    res.send('Curso y archivos guardados correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al guardar curso');
  }
});


app.get('/api/cursos', async (req, res) => {
  try {
    const [cursos] = await db.query('SELECT id, titulo, autor, imagen_portada FROM cursos');
    res.json(cursos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los cursos' });
  }
});

app.post('/api/unirseCurso', async (req, res) => {
  const { cursoId, usuarioId } = req.body;

  // Si el usuario está logueado, utiliza su id de sesión si no se pasa en la solicitud
  const usuarioIdSesion = req.session.usuarioId || usuarioId;

  if (!cursoId || !usuarioIdSesion) {
    return res.status(400).json({ error: 'Faltan datos necesarios' });
  }

  try {
    const [existing] = await db.query(
      'SELECT * FROM usuario_cursos WHERE usuario_id = ? AND curso_id = ?',
      [usuarioIdSesion, cursoId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya estás unido a este curso' });
    }

    await db.query(
      'INSERT INTO usuario_cursos (usuario_id, curso_id) VALUES (?, ?)',
      [usuarioIdSesion, cursoId]
    );

    res.status(200).json({ message: 'Unido al curso con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al unirse al curso' });
  }
});

app.get('/api/misCursos', async (req, res) => {
  const usuarioId = req.session.usuarioId;

  if (!usuarioId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  try {
    const [cursos] = await db.query(`
      SELECT c.id, c.titulo, c.autor, c.imagen_portada
      FROM cursos c
      JOIN usuario_cursos uc ON c.id = uc.curso_id
      WHERE uc.usuario_id = ?`, [usuarioId]);

    res.json(cursos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los cursos del usuario' });
  }
});

app.get('/api/curso/:id', async (req, res) => {
  const cursoId = req.params.id;

  try {
    const [[curso]] = await db.query('SELECT * FROM cursos WHERE id = ?', [cursoId]);
    const [archivos] = await db.query('SELECT * FROM archivos WHERE curso_id = ?', [cursoId]);

    res.json({ curso, archivos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los datos del curso' });
  }
});

app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));