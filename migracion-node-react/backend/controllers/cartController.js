exports.addToCart = (req, res) => {
  if (!req.session) {
    return res.status(500).json({ error: 'Sesión no iniciada' });
  }

  const { codigo, cantidad } = req.body;

  if (!codigo || !cantidad) {
    return res.status(400).json({ error: 'Código y cantidad son requeridos' });
  }

  if (!req.session.carro) {
    req.session.carro = {};
  }

  if (req.session.carro[codigo]) {
    return res.status(400).json({ error: 'El producto ya fue agregado al carrito' });
  }

  req.session.carro[codigo] = { producto: codigo, cantidad: cantidad };

  res.json({ message: 'Producto agregado al carrito' });
};

exports.removeFromCart = (req, res) => {
  const code = req.params.code;

  if (!req.session) {
    return res.status(400).json({ error: 'No hay sesión activa' });
  }

  if (req.session.carro && req.session.carro[code]) {
    delete req.session.carro[code];
    return res.json({ message: 'Producto eliminado del carrito' });
  } else {
    return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
  }
};

exports.clearCart = (req, res) => {
  if (!req.session) {
    return res.status(400).json({ error: 'No hay sesión activa' });
  }

  req.session.carro = {};
  res.json({ message: 'Carrito vaciado con éxito' });
};
