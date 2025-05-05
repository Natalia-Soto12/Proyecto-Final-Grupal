const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

router.post('/register', async (req, res) => {
  const {
    clienNit,
    clienName,
    clienFullname,
    clienLastname,
    clienPass,
    clienPass2,
    clienDir,
    clienPhone,
    clienEmail
  } = req.body;

  if (!clienNit || !clienName || !clienFullname || !clienLastname || !clienDir || !clienPhone || !clienEmail) {
    return res.status(400).json({ error: 'Los campos no pueden estar vacíos' });
  }

  if (clienPass !== clienPass2) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM cliente WHERE NIT = ?', [clienNit]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }

    const hashedPass = await bcrypt.hash(clienPass, 10);

    const sql = `INSERT INTO cliente 
      (NIT, Nombre, NombreCompleto, Apellido, Direccion, Clave, Telefono, Email) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    await pool.query(sql, [
      clienNit,
      clienName,
      clienFullname,
      clienLastname,
      clienDir,
      hashedPass,
      clienPhone,
      clienEmail
    ]);

    res.json({ message: 'Registro completado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:nit', async (req, res) => {
  const nit = req.params.nit;
  const { clienName, clienFullname, clienLastname, clienPhone, clienEmail, clienDir, clienOldName, clienOldPass, clienNewPass, clienNewPass2 } = req.body;

  try {
    let updateFields = {
      Nombre: clienName,
      NombreCompleto: clienFullname,
      Apellido: clienLastname,
      Direccion: clienDir,
      Telefono: clienPhone,
      Email: clienEmail
    };

    if (clienOldName !== clienName) {
      const [rows] = await pool.query('SELECT * FROM cliente WHERE Nombre = ?', [clienName]);
      if (rows.length > 0) {
        return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
      }
    }

    if (clienOldPass && clienNewPass && clienNewPass2) {
      if (clienNewPass !== clienNewPass2) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
      }
      const [rows] = await pool.query('SELECT Clave FROM cliente WHERE Nombre = ?', [clienOldName]);
      if (rows.length === 0) {
        return res.status(400).json({ error: 'Usuario no encontrado' });
      }
      const validPass = await bcrypt.compare(clienOldPass, rows[0].Clave);
      if (!validPass) {
        return res.status(400).json({ error: 'La contraseña actual no coincide' });
      }
      const hashedPass = await bcrypt.hash(clienNewPass, 10);
      updateFields.Clave = hashedPass;
    }

    const setClause = Object.keys(updateFields)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updateFields);
    values.push(nit);

    const [result] = await pool.query(
      `UPDATE cliente SET ${setClause} WHERE NIT = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Note: Session update should be handled in frontend or session middleware

    res.json({ message: 'Cliente actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/:nit', async (req, res) => {
  const nit = req.params.nit;

  try {
    const [rows] = await pool.query('SELECT NIT, Nombre, NombreCompleto, Apellido, Direccion, Telefono, Email FROM cliente WHERE NIT = ?', [nit]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
