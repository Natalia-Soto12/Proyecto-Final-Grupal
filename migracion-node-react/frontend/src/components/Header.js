import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{ padding: '10px', backgroundColor: '#eee', marginBottom: '20px' }}>
      <nav>
        <Link to="/products" style={{ marginRight: '10px' }}>Productos</Link>
        <Link to="/cart" style={{ marginRight: '10px' }}>Carrito</Link>
        <Link to="/orders" style={{ marginRight: '10px' }}>Pedidos</Link>
        {user && user.tipo === 'Admin' && (
          <Link to="/admin" style={{ marginRight: '10px' }}>Administración</Link>
        )}
        {user ? (
          <>
            <span>Hola, {user.nombre}</span>
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Cerrar sesión</button>
          </>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
