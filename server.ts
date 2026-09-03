import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getDbCategories,
  getDbCompanyProfile,
  getDbDepartments,
  getDbFuelDeliveries,
  getDbFuelExits,
  getDbStockAdjustments,
  getDbStockConfig,
  getDbSuppliers,
  getDbUsers,
  getDbVehicles,
  saveDbCategory,
  saveDbCompanyProfile,
  saveDbDepartment,
  saveDbFuelDelivery,
  saveDbFuelExit,
  saveDbStockAdjustment,
  saveDbStockConfig,
  saveDbSupplier,
  saveDbVehicle,
  upsertDbUser,
} from './src/db/repository.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- REST API Endpoints (PostgreSQL / Cloud SQL Relational Database) ---

  // Health check & DB Status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'Cloud SQL PostgreSQL', timestamp: new Date().toISOString() });
  });

  // 1. Company Profile
  app.get('/api/company', async (req, res) => {
    try {
      const profile = await getDbCompanyProfile();
      res.json({ success: true, data: profile });
    } catch (error: any) {
      console.error('API /api/company error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/company', async (req, res) => {
    try {
      const profile = await saveDbCompanyProfile(req.body);
      res.json({ success: true, data: profile });
    } catch (error: any) {
      console.error('API POST /api/company error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 2. Stock Config
  app.get('/api/stock/config', async (req, res) => {
    try {
      const config = await getDbStockConfig();
      res.json({ success: true, data: config });
    } catch (error: any) {
      console.error('API /api/stock/config error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/stock/config', async (req, res) => {
    try {
      const config = await saveDbStockConfig(req.body);
      res.json({ success: true, data: config });
    } catch (error: any) {
      console.error('API POST /api/stock/config error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 3. Vehicles & Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await getDbCategories();
      res.json({ success: true, data: categories });
    } catch (error: any) {
      console.error('API /api/categories error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const category = await saveDbCategory(req.body);
      res.json({ success: true, data: category });
    } catch (error: any) {
      console.error('API POST /api/categories error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/vehicles', async (req, res) => {
    try {
      const vehicles = await getDbVehicles();
      res.json({ success: true, data: vehicles });
    } catch (error: any) {
      console.error('API /api/vehicles error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/vehicles', async (req, res) => {
    try {
      const vehicle = await saveDbVehicle(req.body);
      res.json({ success: true, data: vehicle });
    } catch (error: any) {
      console.error('API POST /api/vehicles error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 4. Departments
  app.get('/api/departments', async (req, res) => {
    try {
      const depts = await getDbDepartments();
      res.json({ success: true, data: depts });
    } catch (error: any) {
      console.error('API /api/departments error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/departments', async (req, res) => {
    try {
      const dept = await saveDbDepartment(req.body);
      res.json({ success: true, data: dept });
    } catch (error: any) {
      console.error('API POST /api/departments error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 5. Suppliers
  app.get('/api/suppliers', async (req, res) => {
    try {
      const suppliers = await getDbSuppliers();
      res.json({ success: true, data: suppliers });
    } catch (error: any) {
      console.error('API /api/suppliers error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/suppliers', async (req, res) => {
    try {
      const supplier = await saveDbSupplier(req.body);
      res.json({ success: true, data: supplier });
    } catch (error: any) {
      console.error('API POST /api/suppliers error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 6. Fuel Exits
  app.get('/api/fuel-exits', async (req, res) => {
    try {
      const exits = await getDbFuelExits();
      res.json({ success: true, data: exits });
    } catch (error: any) {
      console.error('API /api/fuel-exits error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/fuel-exits', async (req, res) => {
    try {
      const exit = await saveDbFuelExit(req.body);
      res.json({ success: true, data: exit });
    } catch (error: any) {
      console.error('API POST /api/fuel-exits error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 7. Fuel Deliveries
  app.get('/api/fuel-deliveries', async (req, res) => {
    try {
      const deliveries = await getDbFuelDeliveries();
      res.json({ success: true, data: deliveries });
    } catch (error: any) {
      console.error('API /api/fuel-deliveries error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/fuel-deliveries', async (req, res) => {
    try {
      const delivery = await saveDbFuelDelivery(req.body);
      res.json({ success: true, data: delivery });
    } catch (error: any) {
      console.error('API POST /api/fuel-deliveries error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 8. Stock Adjustments
  app.get('/api/stock/adjustments', async (req, res) => {
    try {
      const adjustments = await getDbStockAdjustments();
      res.json({ success: true, data: adjustments });
    } catch (error: any) {
      console.error('API /api/stock/adjustments error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/stock/adjustments', async (req, res) => {
    try {
      const adjustment = await saveDbStockAdjustment(req.body);
      res.json({ success: true, data: adjustment });
    } catch (error: any) {
      console.error('API POST /api/stock/adjustments error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 9. Users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await getDbUsers();
      res.json({ success: true, data: users });
    } catch (error: any) {
      console.error('API /api/users error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const user = await upsertDbUser(req.body);
      res.json({ success: true, data: user });
    } catch (error: any) {
      console.error('API POST /api/users error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- Vite Middleware Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GASCONS Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
