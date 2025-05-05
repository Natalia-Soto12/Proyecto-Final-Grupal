import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [nombreLogin, setNombreLogin] = useState('');
  const [claveLogin, setClaveLogin] = useState('');
  const [optionsRadios, setOptionsRadios] = useState('option1'); // User by default
  const [error, setError] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(nombreLogin, claveLogin, optionsRadios);
    if (result.success) {
      if (optionsRadios === 'option2') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombreLogin}
            onChange={(e) => setNombreLogin(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={claveLogin}
            onChange={(e) => setClaveLogin(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Tipo de usuario:</label>
          <div>
            <label>
              <input
                type="radio"
                value="option1"
                checked={optionsRadios === 'option1'}
                onChange={() => setOptionsRadios('option1')}
              />
              Usuario
            </label>
            <label style={{ marginLeft: '10px' }}>
              <input
                type="radio"
                value="option2"
                checked={optionsRadios === 'option2'}
                onChange={() => setOptionsRadios('option2')}
              />
              Administrador
            </label>
          </div>
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
