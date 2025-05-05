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

router.delete('/:code', async (req, res) => {
  const codeCateg = req.params.code;

  try {
    const [products] = await pool.query('SELECT * FROM producto WHERE CodigoCat = ?', [codeCateg]);
    if (products.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar la categoría porque existen productos asociados' });
    }

    const [result] = await pool.query('DELETE FROM categoria WHERE CodigoCat = ?', [codeCateg]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:code', async (req, res) => {
  const codeOldCatUp = req.params.code;
  const { categName, categDescrip } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE categoria SET Nombre = ?, Descripcion = ? WHERE CodigoCat = ?',
      [categName, categDescrip, codeOldCatUp]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría actualizada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
