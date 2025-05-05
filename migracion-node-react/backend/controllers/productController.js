const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'frontend/assets/img-products/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.body.prodCodigo + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Formato de imagen inválido. Solo se permiten .jpg y .png'));
  }
}).single('img');

exports.registerProduct = (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Error en la carga del archivo: ' + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const {
      prodCodigo,
      prodName,
      prodCategoria,
      prodPrice,
      prodModel,
      prodMarca,
      prodStock,
      prodCodigoP,
      prodEstado,
      adminName,
      prodDescPrice
    } = req.body;

    if (!prodCodigo || !prodName || !prodCategoria || !prodPrice || !prodModel || !prodMarca || !prodStock || !prodCodigoP) {
      return res.status(400).json({ error: 'Los campos obligatorios no deben estar vacíos' });
    }

    try {
      const [rows] = await pool.query('SELECT * FROM producto WHERE CodigoProd = ?', [prodCodigo]);
      if (rows.length > 0) {
        return res.status(400).json({ error: 'El código de producto ya está registrado' });
      }

      const imgFinalName = req.file ? req.file.filename : null;

      const sql = `INSERT INTO producto 
        (CodigoProd, NombreProd, CodigoCat, Precio, Descuento, Modelo, Marca, Stock, NITProveedor, Imagen, Nombre, Estado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      await pool.query(sql, [
        prodCodigo,
        prodName,
        prodCategoria,
        prodPrice,
        prodDescPrice || 0,
        prodModel,
        prodMarca,
        prodStock,
        prodCodigoP,
        imgFinalName,
        adminName,
        prodEstado
      ]);

      res.json({ message: 'Producto registrado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
};

exports.updateProduct = (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Error en la carga del archivo: ' + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const codeOldProdUp = req.params.code;
    const {
      prodName,
      prodCategoria,
      prodPrice,
      prodModel,
      prodMarca,
      prodStock,
      prodCodigoP,
      prodEstado,
      prodDescPrice
    } = req.body;

    if (!prodName || !prodCategoria || !prodPrice || !prodModel || !prodMarca || !prodStock || !prodCodigoP) {
      return res.status(400).json({ error: 'Los campos obligatorios no deben estar vacíos' });
    }

    try {
      let imgFinalName = null;
      if (req.file) {
        imgFinalName = req.file.filename;
      }

      let sql = 'UPDATE producto SET NombreProd = ?, CodigoCat = ?, Precio = ?, Descuento = ?, Modelo = ?, Marca = ?, Stock = ?, NITProveedor = ?, Estado = ?';
      const params = [prodName, prodCategoria, prodPrice, prodDescPrice || 0, prodModel, prodMarca, prodStock, prodCodigoP, prodEstado];

      if (imgFinalName) {
        sql += ', Imagen = ?';
        params.push(imgFinalName);
      }

      sql += ' WHERE CodigoProd = ?';
      params.push(codeOldProdUp);

      const [result] = await pool.query(sql, params);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ message: 'Producto actualizado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
};

exports.deleteProduct = async (req, res) => {
  const codeProd = req.params.code;

  try {
    const [sales] = await pool.query('SELECT * FROM detalle WHERE CodigoProd = ?', [codeProd]);
    if (sales.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el producto porque está registrado en una venta' });
    }

    const [products] = await pool.query('SELECT * FROM producto WHERE CodigoProd = ?', [codeProd]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const product = products[0];
    const imagePath = `frontend/assets/img-products/${product.Imagen}`;

    const [result] = await pool.query('DELETE FROM producto WHERE CodigoProd = ?', [codeProd]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }

    // Delete image file if exists
    if (fs.existsSync(imagePath)) {
      fs.chmodSync(imagePath, 0o777);
      fs.unlinkSync(imagePath);
    }

    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.listProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT CodigoProd as code, NombreProd as name, Precio as price, Stock as stock, Imagen as image FROM producto');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la lista de productos' });
  }
};
