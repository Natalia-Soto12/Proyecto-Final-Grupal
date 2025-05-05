const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const comprobanteDir = 'frontend/assets/comprobantes/';

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

// Configure multer for comprobante upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, comprobanteDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now();
    cb(null, 'comprobante_' + uniqueSuffix + ext);
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
}).single('comprobante');

exports.confirmOrder = (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Error en la carga del archivo: ' + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { NumDepo, tipoenvio, Cedclien } = req.body;

    if (!req.session || !req.session.carro) {
      return res.status(400).json({ error: 'No has seleccionado ningún producto, revisa el carrito de compras' });
    }

    try {
      const [clientRows] = await pool.query('SELECT * FROM cliente WHERE NIT = ?', [Cedclien]);
      if (clientRows.length === 0) {
        return res.status(400).json({ error: 'El DNI es incorrecto, no está registrado con ningún cliente' });
      }

      let comprobanteF = 'Sin archivo adjunto';
      if (req.file) {
        comprobanteF = req.file.filename;
      }

      let suma = 0;
      for (const codess of Object.values(req.session.carro)) {
        const [productRows] = await pool.query('SELECT * FROM producto WHERE CodigoProd = ?', [codess.producto]);
        if (productRows.length > 0) {
          const fila = productRows[0];
          const tp = fila.Precio - (fila.Precio * (fila.Descuento / 100));
          suma += tp * codess.cantidad;
        }
      }

      const StatusV = 'Pendiente';
      const fecha = new Date().toISOString().slice(0, 10);

      const [result] = await pool.query(
        'INSERT INTO venta (Fecha, NIT, TotalPagar, Estado, NumeroDeposito, TipoEnvio, Adjunto) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [fecha, Cedclien, suma, StatusV, NumDepo, tipoenvio, comprobanteF]
      );

      const numPedido = result.insertId;

      for (const carro of Object.values(req.session.carro)) {
        const [productRows] = await pool.query('SELECT * FROM producto WHERE CodigoProd = ?', [carro.producto]);
        if (productRows.length > 0) {
          const filaP = productRows[0];
          const pref = filaP.Precio - (filaP.Precio * (filaP.Descuento / 100));
          await pool.query(
            'INSERT INTO detalle (NumPedido, CodigoProd, CantidadProductos, PrecioProd) VALUES (?, ?, ?, ?)',
            [numPedido, carro.producto, carro.cantidad, pref]
          );

          // Update stock
          const existenciasRest = carro.cantidad;
          await pool.query(
            'UPDATE producto SET Stock = Stock - ? WHERE CodigoProd = ?',
            [existenciasRest, carro.producto]
          );
        }
      }

      // Clear cart
      req.session.carro = {};

      res.json({ message: 'Pedido realizado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
};

exports.updateOrderStatus = async (req, res) => {
  const numPedido = req.params.numPedido;
  const { pedidoStatus } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE venta SET Estado = ? WHERE NumPedido = ?',
      [pedidoStatus, numPedido]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ message: 'Pedido actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.getOrderStatus = async (req, res) => {
  const numPedido = req.params.numPedido;

  try {
    const [rows] = await pool.query('SELECT Estado FROM venta WHERE NumPedido = ?', [numPedido]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const currentStatus = rows[0].Estado;
    const statuses = ['Pendiente', 'Entregado', 'Enviado'];

    res.json({
      currentStatus,
      statuses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
