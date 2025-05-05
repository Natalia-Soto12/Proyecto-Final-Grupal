const express = require('express');
const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const clientRoutes = require('./routes/client');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/category');
const providerRoutes = require('./routes/provider');
const bankRoutes = require('./routes/bank');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));
app.use(express.json());

// Setup session middleware
app.use(session({
  secret: 'tu_secreto_de_sesion',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambiar a true si usas HTTPS
}));

// Sample health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Use product routes
app.use('/api/products', productRoutes);

// Use cart routes
app.use('/api/cart', cartRoutes);

// Use client routes
app.use('/api/clients', clientRoutes);

// Use auth routes
app.use('/api/auth', authRoutes);

// Use order routes
app.use('/api/orders', orderRoutes);

// Use admin routes
app.use('/api/admin', adminRoutes);

// Use category routes
app.use('/api/category', categoryRoutes);

// Use provider routes
app.use('/api/provider', providerRoutes);

// Use bank routes
app.use('/api/bank', bankRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
