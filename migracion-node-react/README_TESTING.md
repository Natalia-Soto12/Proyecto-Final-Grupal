# Pruebas y Validación del Proyecto Migrado

## Backend Node.js

1. Iniciar el servidor backend:
   ```
   cd backend
   npm install
   node server.js
   ```

2. Usar Postman o curl para probar las APIs REST:

- Login:
  ```
  POST http://localhost:3001/api/auth/login
  Body (JSON):
  {
    "nombre": "admin",
    "clave": "adminpass",
    "tipo": "Admin"
  }
  ```

- Agregar producto al carrito:
  ```
  POST http://localhost:3001/api/cart/add
  Body (JSON):
  {
    "producto": "codigo123",
    "cantidad": 2
  }
  ```

3. Verificar respuestas JSON y códigos HTTP.

## Frontend React

1. Iniciar la aplicación frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

2. Navegar a la aplicación en el navegador (por defecto http://localhost:3000).

3. Probar funcionalidades:
   - Login con usuario y administrador.
   - Agregar productos al carrito.
   - Navegación y visualización de páginas.

4. Verificar que la experiencia de usuario y diseño se mantienen.

## Notas

- Reportar cualquier error o comportamiento inesperado.
- Realizar pruebas adicionales según funcionalidades migradas.
