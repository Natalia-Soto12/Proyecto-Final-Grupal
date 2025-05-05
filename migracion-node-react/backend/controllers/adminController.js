const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

exports.registerAdmin = async (req, res) => {
  const { adminName, adminPass1, adminPass2 } = req.body;

  if (!adminName || !adminPass1 || !adminPass2) {
    return res.status(400).json({ error: 'Los campos no pueden estar vacíos' });
  }

  if (adminPass1 !== adminPass2) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM administrador WHERE Nombre = ?', [adminName]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
    }

    const hashedPass = await bcrypt.hash(adminPass1, 10);

    await pool.query('INSERT INTO administrador (Nombre, Clave) VALUES (?, ?)', [adminName, hashedPass]);

    res.json({ message: 'Administrador registrado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.deleteAdmin = async (req, res) => {
  const adminId = req.params.id;

  try {
    const [result] = await pool.query('DELETE FROM administrador WHERE id = ?', [adminId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    res.json({ message: 'Administrador eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.updateAdmin = async (req, res) => {
  const adminId = req.params.id;
  const { adminName, adminNameOld, adminPass1, adminPass2 } = req.body;

  try {
    let finalName = adminNameOld;

    if (adminNameOld !== adminName) {
      const [rows] = await pool.query('SELECT * FROM administrador WHERE Nombre = ?', [adminName]);
      if (rows.length > 0) {
        return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
      }
      finalName = adminName;
    }

    let updateFields = { Nombre: finalName };

    if (adminPass1 && adminPass2) {
      if (adminPass1 !== adminPass2) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
      }
      const hashedPass = await bcrypt.hash(adminPass1, 10);
      updateFields.Clave = hashedPass;
    }

    const setClause = Object.keys(updateFields)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updateFields);
    values.push(adminId);

    const [result] = await pool.query(
      `UPDATE administrador SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    res.json({ message: 'Administrador actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.listAdmins = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, Nombre FROM administrador');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la lista de administradores' });
  }
};
