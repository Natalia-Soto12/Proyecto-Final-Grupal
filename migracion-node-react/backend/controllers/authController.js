const mysql = require('mysql2/promise');
const md5 = require('md5');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

exports.login = async (req, res) => {
  const { nombreLogin, claveLogin, optionsRadios } = req.body;

  if (!nombreLogin || !claveLogin) {
    return res.status(400).json({ error: 'Error campo vacío' });
  }

  try {
    if (optionsRadios === 'option2') {
      // Login admin
      const [rows] = await pool.query('SELECT * FROM administrador WHERE Nombre = ?', [nombreLogin]);
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Error nombre o contraseña inválido' });
      }
      const admin = rows[0];
      if (admin.Clave !== md5(claveLogin)) {
        return res.status(401).json({ error: 'Error nombre o contraseña inválido' });
      }
      req.session.nombreAdmin = nombreLogin;
      req.session.UserType = 'Admin';
      req.session.adminID = admin.id;
      res.json({ message: 'Login exitoso', userType: 'Admin' });
    } else if (optionsRadios === 'option1') {
      // Login user
      const [rows] = await pool.query('SELECT * FROM cliente WHERE Nombre = ?', [nombreLogin]);
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Error nombre o contraseña inválido' });
      }
      const user = rows[0];
      if (user.Clave !== md5(claveLogin)) {
        return res.status(401).json({ error: 'Error nombre o contraseña inválido' });
      }
      req.session.nombreUser = nombreLogin;
      req.session.UserType = 'User';
      req.session.UserNIT = user.NIT;
      res.json({ message: 'Login exitoso', userType: 'User' });
    } else {
      res.status(400).json({ error: 'Tipo de usuario inválido' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.logout = (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ error: 'Error al cerrar sesión' });
      } else {
        return res.json({ message: 'Sesión cerrada con éxito' });
      }
    });
  } else {
    res.json({ message: 'No hay sesión activa' });
  }
};
