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
  const { bancoCuenta, bancoNombre, bancoBeneficiario, bancoTipo } = req.body;

  if (!bancoCuenta || !bancoNombre || !bancoBeneficiario || !bancoTipo) {
    return res.status(400).json({ error: 'Los campos no pueden estar vacíos' });
  }

  try {
    await pool.query(
      'INSERT INTO cuentabanco (NumeroCuenta, NombreBanco, NombreBeneficiario, TipoCuenta) VALUES (?, ?, ?, ?)',
      [bancoCuenta, bancoNombre, bancoBeneficiario, bancoTipo]
    );

    res.json({ message: 'Cuenta bancaria agregada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { bancoCuenta, bancoNombre, bancoBeneficiario, bancoTipo } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE cuentabanco SET NumeroCuenta = ?, NombreBanco = ?, NombreBeneficiario = ?, TipoCuenta = ? WHERE id = ?',
      [bancoCuenta, bancoNombre, bancoBeneficiario, bancoTipo, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
    }

    res.json({ message: 'Cuenta bancaria actualizada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
