import React, { useEffect, useState } from 'react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(() => setError('Error al cargar pedidos'));
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (orders.length === 0) {
    return <p>No hay pedidos.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Pedidos</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {orders.map(order => (
          <li key={order.NumPedido} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
            <p>Número de Pedido: {order.NumPedido}</p>
            <p>Fecha: {order.Fecha}</p>
            <p>Total a Pagar: ${order.TotalPagar}</p>
            <p>Estado: {order.Estado}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders;
