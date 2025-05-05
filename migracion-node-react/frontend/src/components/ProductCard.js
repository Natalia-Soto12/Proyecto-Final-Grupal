import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h3>{product.NombreProd}</h3>
      <p>Precio: ${product.Precio}</p>
      <button onClick={() => onAddToCart(product.CodigoProd)}>Agregar al carrito</button>
    </div>
  );
};

export default ProductCard;
