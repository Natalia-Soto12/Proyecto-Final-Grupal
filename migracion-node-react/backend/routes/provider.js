const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

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
  const { proveNit, proveName, proveDir, proveTel, proveWeb } = req.body;

  if (!proveNit || !proveName || !proveDir || !proveTel) {
    return res.status(400).json({ error: 'Los campos obligatorios no pueden estar vacíos' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM proveedor WHERE NITProveedor = ?', [proveNit]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'El número de NIT/CEDULA ya está registrado' });
    }

    await pool.query(
      'INSERT INTO proveedor (NITProveedor, NombreProveedor, Direccion, Telefono, PaginaWeb) VALUES (?, ?, ?, ?, ?)',
      [proveNit, proveName, proveDir, proveTel, proveWeb || null]
    );

    res.json({ message: 'Proveedor registrado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.delete('/:nit', async (req, res) => {
  const nitProve = req.params.nit;

  try {
    const [products] = await pool.query('SELECT * FROM producto WHERE NITProveedor = ?', [nitProve]);
    if (products.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el proveedor porque existen productos asociados' });
    }

    const [result] = await pool.query('DELETE FROM proveedor WHERE NITProveedor = ?', [nitProve]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json({ message: 'Proveedor eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:nit', async (req, res) => {
  const nitOldProveUp = req.params.nit;
  const { proveName, proveDir, proveTel, proveWeb } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE proveedor SET NombreProveedor = ?, Direccion = ?, Telefono = ?, PaginaWeb = ? WHERE NITProveedor = ?',
      [proveName, proveDir, proveTel, proveWeb, nitOldProveUp]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json({ message: 'Proveedor actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
