import React, { useEffect, useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setError('Error al cargar productos'));
  }, []);

  const handleAddToCart = async (codigo) => {
    const result = await addToCart(codigo, 1);
    if (!result.success) {
      alert(result.error || 'Error al agregar al carrito');
    } else {
      alert('Producto agregado al carrito');
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Lista de Productos</h2>
      <div>
        {products.map(product => (
          <ProductCard key={product.CodigoProd} product={product} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
