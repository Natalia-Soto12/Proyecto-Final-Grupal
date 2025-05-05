import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState(null);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPass1, setNewAdminPass1] = useState('');
  const [newAdminPass2, setNewAdminPass2] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetch('/api/admin/list') // Assuming an endpoint to list admins
      .then(res => res.json())
      .then(data => setAdmins(data))
      .catch(() => setError('Error al cargar administradores'));
  }, [refresh]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (newAdminPass1 !== newAdminPass2) {
      alert('Las contraseñas no coinciden');
      return;
    }
    try {
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: newAdminName,
          adminPass1: newAdminPass1,
          adminPass2: newAdminPass2
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Administrador registrado con éxito');
        setNewAdminName('');
        setNewAdminPass1('');
        setNewAdminPass2('');
        setRefresh(!refresh);
      } else {
        alert(data.error || 'Error al registrar administrador');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este administrador?')) return;
    try {
      const response = await fetch(`/api/admin/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok) {
        alert('Administrador eliminado con éxito');
        setRefresh(!refresh);
      } else {
        alert(data.error || 'Error al eliminar administrador');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Panel de Administración</h2>
      <form onSubmit={handleRegister} style={{ marginBottom: '20px' }}>
        <h3>Registrar Nuevo Administrador</h3>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={newAdminPass1}
            onChange={(e) => setNewAdminPass1(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirmar Contraseña:</label>
          <input
            type="password"
            value={newAdminPass2}
            onChange={(e) => setNewAdminPass2(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Registrar</button>
      </form>
      <h3>Administradores Registrados</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {admins.map(admin => (
          <li key={admin.id} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
            <p>Nombre: {admin.Nombre}</p>
            <button onClick={() => handleDelete(admin.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
