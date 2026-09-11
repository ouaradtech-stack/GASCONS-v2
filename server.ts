import express from 'express';
import path from 'path';
import fs from 'fs';
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

  // 10. Local Backup System ("base de donnee" folder)
  const BACKUP_DIR_NAME = 'base de donnee';
  const BACKUP_DIR = path.join(process.cwd(), BACKUP_DIR_NAME);

  // Ensure "base de donnee" directory exists
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`[Backup] Dossier "${BACKUP_DIR_NAME}" initialisé avec succès.`);
    }
  } catch (err) {
    console.error(`[Backup] Erreur lors de l'initialisation du dossier "${BACKUP_DIR_NAME}":`, err);
  }

  // POST /api/backup/save-local: Automatically saves snapshot into folder "base de donnee"
  app.post('/api/backup/save-local', async (req, res) => {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }

      const payload = req.body || {};
      const now = new Date();
      const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const dateStr = now.toISOString().slice(0, 10);

      // 1. Latest full database snapshot
      const latestPath = path.join(BACKUP_DIR, 'gascons_database_latest.json');
      fs.writeFileSync(latestPath, JSON.stringify(payload, null, 2), 'utf-8');

      // 2. Point-in-time backup snapshot
      const pointInTimePath = path.join(BACKUP_DIR, `backup_${timestamp}.json`);
      fs.writeFileSync(pointInTimePath, JSON.stringify(payload, null, 2), 'utf-8');

      // 3. Specialized table files for direct opening / Excel / Python inspection
      if (Array.isArray(payload.vehicles)) {
        fs.writeFileSync(
          path.join(BACKUP_DIR, 'vehicules_engins.json'),
          JSON.stringify(payload.vehicles, null, 2),
          'utf-8'
        );

        // Also generate CSV for vehicles
        const csvHeader = 'ID;Code;Immatriculation;Designation;CategorieID;DepartementID;CapaciteReservoir;CompteurActuel;Unite;Chauffeur;Statut\n';
        const csvRows = payload.vehicles.map((v: any) =>
          `"${v.id || ''}";"${v.code || ''}";"${v.plateNumber || ''}";"${(v.name || '').replace(/"/g, '""')}";"${v.categoryId || ''}";"${v.departmentId || ''}";"${v.tankCapacity || 0}";"${v.currentReading || 0}";"${v.unitType || 'KM'}";"${(v.assignedDriver || '').replace(/"/g, '""')}";"${v.status || 'ACTIF'}"`
        ).join('\n');
        fs.writeFileSync(path.join(BACKUP_DIR, 'vehicules_engins.csv'), '\uFEFF' + csvHeader + csvRows, 'utf-8');
      }

      if (Array.isArray(payload.fuelExits)) {
        fs.writeFileSync(
          path.join(BACKUP_DIR, 'sorties_gasoil.json'),
          JSON.stringify(payload.fuelExits, null, 2),
          'utf-8'
        );
      }

      if (Array.isArray(payload.fuelDeliveries)) {
        fs.writeFileSync(
          path.join(BACKUP_DIR, 'receptions_carburant.json'),
          JSON.stringify(payload.fuelDeliveries, null, 2),
          'utf-8'
        );
      }

      if (Array.isArray(payload.users)) {
        fs.writeFileSync(
          path.join(BACKUP_DIR, 'utilisateurs_et_sous_admins.json'),
          JSON.stringify(payload.users, null, 2),
          'utf-8'
        );
      }

      if (payload.stockConfig) {
        fs.writeFileSync(
          path.join(BACKUP_DIR, 'stock_cuve.json'),
          JSON.stringify(payload.stockConfig, null, 2),
          'utf-8'
        );
      }

      // Keep maximum 30 point-in-time backups to avoid excessive disk growth
      try {
        const files = fs.readdirSync(BACKUP_DIR);
        const backupFiles = files
          .filter((f) => f.startsWith('backup_') && f.endsWith('.json'))
          .sort()
          .reverse();
        if (backupFiles.length > 30) {
          backupFiles.slice(30).forEach((oldFile) => {
            try {
              fs.unlinkSync(path.join(BACKUP_DIR, oldFile));
            } catch (_) {}
          });
        }
      } catch (_) {}

      res.json({
        success: true,
        message: 'Sauvegarde locale effectuée avec succès dans le dossier "base de donnee"',
        folder: BACKUP_DIR_NAME,
        timestamp,
        date: dateStr,
      });
    } catch (error: any) {
      console.error('API /api/backup/save-local error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/backup/status: Status of the "base de donnee" folder
  app.get('/api/backup/status', (req, res) => {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }

      const files = fs.readdirSync(BACKUP_DIR);
      const fileStats = files.map((name) => {
        const filePath = path.join(BACKUP_DIR, name);
        const stat = fs.statSync(filePath);
        return {
          name,
          size: stat.size,
          updatedAt: stat.mtime.toISOString(),
        };
      });

      res.json({
        success: true,
        folder: BACKUP_DIR_NAME,
        absolutePath: BACKUP_DIR,
        fileCount: files.length,
        files: fileStats,
      });
    } catch (error: any) {
      console.error('API /api/backup/status error:', error);
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
