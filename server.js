const express = require('express');
const path = require('path');
const multer = require('multer'); // Importar multer
const fs = require('fs');
const connection = require('./config/bd'); 

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración del almacenamiento de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'Public', 'Images', 'avatares');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Crear el objeto upload usando la configuración de multer
const upload = multer({ storage: storage });

// Servir archivos estáticos desde la carpeta Public
app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas para servir las páginas HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/formulario', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'formulario.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/registros', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registros.html'));
});

app.get('/editar', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'editar.html'));
});

app.get('/perfils', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'perfil.html'));
});

// Ruta para manejar el registro del formulario
app.post('/registro', upload.single('foto'), (req, res) => {
  const { nombre, paterno, materno, direccion, correo, password, sexo, pais, cp, ciudad, estado } = req.body;
  const foto = req.file ? `/Images/avatares/${req.file.filename}` : null;

  // Normalizar el valor de pais a minúsculas
  const paisNormalizado = pais ? pais.toLowerCase() : '';

  // Verificar si todos los campos son correctos
  if (!nombre || !paterno || !materno || !direccion || !correo || !password || !sexo || !paisNormalizado || !cp || !ciudad || !estado) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  // Validar correo electrónico
  const correoRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!correoRegex.test(correo)) {
    return res.status(400).json({ error: 'Correo electrónico inválido.' });
  }

  // Validar código postal (debe ser numérico)
  const cpRegex = /^[0-9]{5}$/;
  if (!cpRegex.test(cp)) {
    return res.status(400).json({ error: 'Código postal inválido. Debe tener 5 dígitos numéricos.' });
  }

  // Asegúrate de que el campo pais no sea nulo
  if (!paisNormalizado) {
    return res.status(400).json({ error: "El campo 'pais' es obligatorio." });
  }

  // Insertar los datos en la base de datos
  const query = `
    INSERT INTO usuarios (nombre, paterno, materno, direccion, correo, password, sexo, pais, cp, ciudad, estado, foto) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [nombre, paterno, materno, direccion, correo, password, sexo, paisNormalizado, cp, ciudad, estado, foto], (err, results) => {
    if (err) {
      console.error('Error al insertar los datos:', err);
      return res.status(500).json({ error: 'Error al registrar los datos.' });
    }
    res.status(200).send('¡Registro exitoso!');
  });
});

// Ruta para manejar el login
app.post('/login', (req, res) => {
  console.log('Recibido POST en /login'); // Esto es para verificar si el servidor recibe la solicitud
  const { correo, password } = req.body;

  const query = 'SELECT nombre, foto FROM usuarios WHERE correo = ? AND password = ?';
  connection.query(query, [correo, password], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).json({ success: false, error: 'Error al consultar la base de datos.' });
    }

    console.log('Resultados de la consulta:', results);  // Verifica los resultados de la consulta

    if (results.length > 0) {
      const usuario = results[0];
      console.log('Usuario encontrado:', usuario);
      return res.json({ success: true, usuario: usuario });
    } else {
      console.log('Correo o contraseña incorrectos');
      return res.json({ success: false, error: 'Correo o contraseña incorrectos.' });
    }
  });
});

// Ruta para obtener los usuarios sin la contraseña ni la foto
app.get('/usuarios', (req, res) => {
  const sql = 'SELECT id, nombre, paterno, materno, direccion, correo, sexo, pais, cp, ciudad, estado FROM usuarios';
  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).json({ error: 'Error al obtener los usuarios' });
    } else {
      res.json(result);  // Enviar los usuarios como JSON
    }
  });
});

app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;

  // Realiza la eliminación del usuario en la base de datos
  connection.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {  // Cambiar db.query por connection.query
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Hubo un error al eliminar el usuario.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ message: 'Usuario eliminado correctamente.' });
  });
});

// Ruta para obtener un usuario por su ID
app.get('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM usuarios WHERE id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener los datos del usuario:', err);
      return res.status(500).json({ error: 'Error al obtener los datos del usuario' });
    }
    if (result.length > 0) {
      res.json(result[0]);  // Devolver el primer usuario encontrado
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

// Ruta para actualizar un usuario por su ID
app.put('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, paterno, materno, direccion, correo, sexo, pais, cp, ciudad, estado } = req.body;

  // Verificar si todos los campos son proporcionados
  if (!nombre || !paterno || !materno || !direccion || !correo || !sexo || !pais || !cp || !ciudad || !estado) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const query = `
    UPDATE usuarios SET
      nombre = ?, paterno = ?, materno = ?, direccion = ?, correo = ?, sexo = ?, pais = ?, cp = ?, ciudad = ?, estado = ?
    WHERE id = ?
  `;
  
  connection.query(query, [nombre, paterno, materno, direccion, correo, sexo, pais, cp, ciudad, estado, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar los datos del usuario:', err);
      return res.status(500).json({ error: 'Error al actualizar los datos.' });
    }
    if (result.affectedRows > 0) {
      res.json({ message: 'Usuario actualizado correctamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  });
});

// Ruta para obtener un usuario por nombre
app.get('/usuarios/:usuario', (req, res) => {
  const usuarioNombre = req.params.usuario;

  // Buscar al usuario en la base de datos por nombre
  db.query('SELECT * FROM usuarios WHERE nombre = ?', [usuarioNombre], (err, result) => {
      if (err) {
          console.error('Error al obtener el usuario:', err);
          return res.status(500).send('Error al obtener el usuario');
      }

      if (result.length === 0) {
          return res.status(404).send('Usuario no encontrado');
      }

      res.json(result[0]); // Retornar los datos del usuario
  });
});

// Ruta para obtener un perfil por nombre
app.get('/perfil/:usuario', (req, res) => {
  const usuarioNombre = req.params.usuario;

  // Buscar al usuario en la base de datos por nombre
  connection.query('SELECT * FROM usuarios WHERE nombre = ?', [usuarioNombre], (err, result) => {
      if (err) {
          console.error('Error al obtener el usuario:', err);
          return res.status(500).send('Error al obtener el perfil');
      }

      if (result.length === 0) {
          return res.status(404).send('Perfil no encontrado');
      }

      res.json(result[0]); // Retornar los datos del perfil
  });
});

// Ruta para actualizar un perfil por nombre
app.put('/perfil/:usuario', (req, res) => {
  const usuarioNombre = req.params.usuario;
  const { direccion, correo, sexo, pais, cp, ciudad, estado } = req.body;

  // Actualizar los datos del perfil en la base de datos
  connection.query('UPDATE usuarios SET direccion = ?, correo = ?, sexo = ?, pais = ?, cp = ?, ciudad = ?, estado = ? WHERE nombre = ?', 
  [direccion, correo, sexo, pais, cp, ciudad, estado, usuarioNombre], 
  (err, result) => {
      if (err) {
          console.error('Error al actualizar el perfil:', err);
          return res.status(500).send('Error al actualizar el perfil');
      }

      res.json({ message: 'Perfil actualizado correctamente' });
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});