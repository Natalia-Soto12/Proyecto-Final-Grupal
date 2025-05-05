import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    setCartItems(Object.values(cart));
  }, [cart]);

  const handleRemove = async (codigo) => {
    const result = await removeFromCart(codigo);
    if (!result.success) {
      alert(result.error || 'Error al eliminar del carrito');
    }
  };

  const handleClear = async () => {
    const result = await clearCart();
    if (!result.success) {
      alert(result.error || 'Error al vaciar el carrito');
    }
  };

  if (cartItems.length === 0) {
    return <p>El carrito está vacío.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Carrito de Compras</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cartItems.map(item => (
          <li key={item.producto} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
            <p>Código: {item.producto}</p>
            <p>Cantidad: {item.cantidad}</p>
            <button onClick={() => handleRemove(item.producto)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <button onClick={handleClear}>Vaciar Carrito</button>
    </div>
  );
};

export default Cart;
