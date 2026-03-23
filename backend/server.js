const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./config/database');
const choristesRoutes = require('./routes/choristes');
const cotisationsRoutes = require('./routes/cotisations');
const donsRoutes = require('./routes/dons');
const depensesRoutes = require('./routes/depenses');
const dashboardRoutes = require('./routes/dashboard');
const rapportsRoutes = require('./routes/rapports');
const exportRoutes = require('./routes/export');
const activitesRoutes = require('./routes/activites');
const programmationRoutes = require('./routes/programmation');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/choristes', authMiddleware, choristesRoutes);
app.use('/api/cotisations', authMiddleware, cotisationsRoutes);
app.use('/api/dons', authMiddleware, donsRoutes);
app.use('/api/depenses', authMiddleware, depensesRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/rapports', authMiddleware, rapportsRoutes);
app.use('/api/export', authMiddleware, exportRoutes);
app.use('/api/activites', authMiddleware, activitesRoutes);
app.use('/api/programmation', authMiddleware, programmationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API David Sewa opérationnelle' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erreur serveur',
    message: err.message 
  });
});

// Start server
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Erreur au démarrage:', error);
    process.exit(1);
  }
};

startServer();
