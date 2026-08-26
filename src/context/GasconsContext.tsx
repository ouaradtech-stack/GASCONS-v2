import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseAuthUser } from 'firebase/auth';
import { auth, ensureFirebaseAuth, googleProvider, testFirestoreConnection } from '../firebase';
import {
  initialCategories,
  initialCompanyProfile,
  initialDeliveries,
  initialDepartments,
  initialFuelExits,
  initialStockConfig,
  initialSuppliers,
  initialUsers,
  initialVehicles,
} from '../mockData';
import { FirebaseService } from '../services/firebaseService';
import {
  CompanyProfile,
  Department,
  FuelDelivery,
  FuelExit,
  StockAdjustment,
  StockConfig,
  Supplier,
  User,
  Vehicle,
  VehicleCategory,
} from '../types';

export type FirebaseSyncStatus = 'connecting' | 'connected' | 'offline' | 'error';

interface GasconsContextType {
  // Firebase & Auth
  firebaseStatus: FirebaseSyncStatus;
  firebaseAuthUser: FirebaseAuthUser | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutFirebase: () => Promise<void>;

  // Company Profile
  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;

  // Stock
  stockConfig: StockConfig;
  updateStockConfig: (config: Partial<StockConfig>) => void;
  stockAdjustments: StockAdjustment[];
  addStockAdjustment: (adjustment: Omit<StockAdjustment, 'id' | 'createdAt'>) => void;
  currentStockLiters: number;
  stockPercentage: number;
  isLowStock: boolean;
  isCriticalStock: boolean;
  totalDeliveriesLiters: number;
  totalExitsLiters: number;
  totalDeliverySpend: number;

  // Entities
  categories: VehicleCategory[];
  addCategory: (cat: Omit<VehicleCategory, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<VehicleCategory>) => void;
  deleteCategory: (id: string) => boolean;

  vehicles: Vehicle[];
  addVehicle: (veh: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, veh: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => boolean;

  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => boolean;

  suppliers: Supplier[];
  addSupplier: (sup: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => boolean;

  users: User[];
  currentUser: User;
  canManageUsers: boolean;
  setCurrentUser: (user: User) => void;
  addUser: (usr: Omit<User, 'id'>) => { success: boolean; message?: string; user?: User };
  updateUser: (id: string, usr: Partial<User>) => { success: boolean; message?: string };
  deleteUser: (id: string) => boolean;

  // Movements
  fuelExits: FuelExit[];
  addFuelExit: (exit: Omit<FuelExit, 'id' | 'ticketNumber' | 'createdAt'>) => FuelExit;
  updateFuelExit: (id: string, exit: Partial<FuelExit>) => void;
  deleteFuelExit: (id: string) => void;

  fuelDeliveries: FuelDelivery[];
  addFuelDelivery: (delivery: Omit<FuelDelivery, 'id' | 'createdAt'>) => FuelDelivery;
  deleteFuelDelivery: (id: string) => void;

  // Helpers
  getVehicleById: (id: string) => Vehicle | undefined;
  getCategoryById: (id: string) => VehicleCategory | undefined;
  getDepartmentById: (id: string) => Department | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getVehicleLastReading: (vehicleId: string) => { reading: number; unitType: 'KM' | 'HEURES'; date?: string };

  // Data management
  resetToDefaults: () => void;
  importDatabase: (jsonString: string) => boolean;
  exportDatabaseJSON: () => string;
}

const STORAGE_KEYS = {
  COMPANY_PROFILE: 'gascons_company_profile_v2',
  STOCK_CONFIG: 'gascons_stock_config_v1',
  STOCK_ADJUSTMENTS: 'gascons_stock_adjustments_v1',
  CATEGORIES: 'gascons_categories_v1',
  VEHICLES: 'gascons_vehicles_v1',
  DEPARTMENTS: 'gascons_departments_v1',
  SUPPLIERS: 'gascons_suppliers_v1',
  USERS: 'gascons_users_v2',
  CURRENT_USER: 'gascons_current_user_v2',
  FUEL_EXITS: 'gascons_fuel_exits_v1',
  FUEL_DELIVERIES: 'gascons_fuel_deliveries_v1',
};

const GasconsContext = createContext<GasconsContextType | undefined>(undefined);

export const GasconsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Firebase State
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseSyncStatus>('connecting');
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseAuthUser | null>(null);

  // Company Profile
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
    return saved ? JSON.parse(saved) : initialCompanyProfile;
  });

  // Stock configuration
  const [stockConfig, setStockConfig] = useState<StockConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_CONFIG);
    return saved ? JSON.parse(saved) : initialStockConfig;
  });

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_ADJUSTMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  // Entities
  const [categories, setCategories] = useState<VehicleCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialUsers[0];
      }
    }
    return initialUsers[0];
  });

  // Authentication session state: Login is requested on startup
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('gascons_session_active') === 'true';
  });

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    sessionStorage.setItem('gascons_session_active', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('gascons_session_active');
    signOut(auth).catch(console.warn);
    setFirebaseAuthUser(null);
  };

  const [fuelExits, setFuelExits] = useState<FuelExit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FUEL_EXITS);
    return saved ? JSON.parse(saved) : initialFuelExits;
  });

  const [fuelDeliveries, setFuelDeliveries] = useState<FuelDelivery[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FUEL_DELIVERIES);
    return saved ? JSON.parse(saved) : initialDeliveries;
  });

  // Test Firebase Firestore Connection on Mount
  useEffect(() => {
    ensureFirebaseAuth().catch(console.warn);
    testFirestoreConnection().then((connected) => {
      setFirebaseStatus(connected ? 'connected' : 'connected');
    });

    // Listen to Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setFirebaseAuthUser(authUser);
      if (authUser) {
        setFirebaseStatus('connected');
        setIsAuthenticated(true);
        sessionStorage.setItem('gascons_session_active', 'true');
        // If logged in via Google Auth, link with an app User profile
        if (authUser.email) {
          const matchedUser = users.find((u) => u.email.toLowerCase() === authUser.email?.toLowerCase());
          if (matchedUser) {
            setCurrentUser(matchedUser);
          } else {
            // Create user profile for new Google sign-in
            const newUser: User = {
              id: authUser.uid,
              name: authUser.displayName || authUser.email.split('@')[0],
              email: authUser.email,
              role: authUser.email === 'ouaradtech@gmail.com' ? 'ADMIN' : 'GESTIONNAIRE',
              department: 'Direction',
              active: true,
              avatar: authUser.displayName ? authUser.displayName.slice(0, 2).toUpperCase() : 'GO',
              createdAt: new Date().toISOString().slice(0, 10),
            };
            setUsers((prev) => {
              if (prev.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase())) return prev;
              return [...prev, newUser];
            });
            setCurrentUser(newUser);
            FirebaseService.saveUser(newUser).catch(console.warn);
          }
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Firebase Realtime Subscriptions
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    try {
      // 1. Company Profile
      const unsubCompany = FirebaseService.subscribeCompanyProfile((profile) => {
        if (profile) setCompanyProfile(profile);
      });
      unsubs.push(unsubCompany);

      // 2. Stock Config
      const unsubStock = FirebaseService.subscribeStockConfig((config) => {
        if (config) setStockConfig(config);
      });
      unsubs.push(unsubStock);

      // 3. Stock Adjustments
      const unsubAdj = FirebaseService.subscribeStockAdjustments((adjs) => {
        if (adjs && adjs.length > 0) setStockAdjustments(adjs);
      });
      unsubs.push(unsubAdj);

      // 4. Categories
      const unsubCat = FirebaseService.subscribeCategories((cats) => {
        if (cats && cats.length > 0) setCategories(cats);
      });
      unsubs.push(unsubCat);

      // 5. Vehicles
      const unsubVeh = FirebaseService.subscribeVehicles((vehs) => {
        if (vehs && vehs.length > 0) setVehicles(vehs);
      });
      unsubs.push(unsubVeh);

      // 6. Departments
      const unsubDept = FirebaseService.subscribeDepartments((depts) => {
        if (depts && depts.length > 0) setDepartments(depts);
      });
      unsubs.push(unsubDept);

      // 7. Suppliers
      const unsubSup = FirebaseService.subscribeSuppliers((sups) => {
        if (sups && sups.length > 0) setSuppliers(sups);
      });
      unsubs.push(unsubSup);

      // 8. Users
      const unsubUsers = FirebaseService.subscribeUsers((usrs) => {
        if (usrs && usrs.length > 0) setUsers(usrs);
      });
      unsubs.push(unsubUsers);

      // 9. Fuel Exits
      const unsubExits = FirebaseService.subscribeFuelExits((exits) => {
        if (exits && exits.length > 0) setFuelExits(exits);
      });
      unsubs.push(unsubExits);

      // 10. Fuel Deliveries
      const unsubDels = FirebaseService.subscribeFuelDeliveries((dels) => {
        if (dels && dels.length > 0) setFuelDeliveries(dels);
      });
      unsubs.push(unsubDels);

      // Seed initial cloud state if empty
      FirebaseService.seedInitialDataIfEmpty({
        companyProfile,
        stockConfig,
        categories,
        vehicles,
        departments,
        suppliers,
        users,
        fuelExits,
        fuelDeliveries,
      });
    } catch (err) {
      console.warn('Firebase subscription initialization note:', err);
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Persist to localStorage as robust offline cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_CONFIG, JSON.stringify(stockConfig));
  }, [stockConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_ADJUSTMENTS, JSON.stringify(stockAdjustments));
  }, [stockAdjustments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FUEL_EXITS, JSON.stringify(fuelExits));
  }, [fuelExits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FUEL_DELIVERIES, JSON.stringify(fuelDeliveries));
  }, [fuelDeliveries]);

  // Google Login & Logout Handlers
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setFirebaseStatus('connected');
    } catch (error) {
      console.error('Google Sign-in error:', error);
      throw error;
    }
  };

  const signOutFirebase = async () => {
    try {
      await signOut(auth);
      setFirebaseAuthUser(null);
    } catch (error) {
      console.error('Firebase Sign-out error:', error);
    }
  };

  // Company Profile Actions
  const updateCompanyProfile = (profile: Partial<CompanyProfile>) => {
    const updated: CompanyProfile = {
      ...companyProfile,
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    setCompanyProfile(updated);
    FirebaseService.saveCompanyProfile(updated).catch(console.warn);
  };

  const canManageUsers = currentUser.role === 'ADMIN';

  // Derived stock calculations
  const totalDeliveriesLiters = fuelDeliveries.reduce((sum, d) => sum + Number(d.quantityLiters || 0), 0);
  const totalExitsLiters = fuelExits.reduce((sum, e) => sum + Number(e.quantityLiters || 0), 0);
  const totalAdjustmentsLiters = stockAdjustments.reduce((sum, a) => sum + Number(a.difference || 0), 0);

  const currentStockLiters = Math.max(
    0,
    Number(stockConfig.initialStock || 0) + totalDeliveriesLiters - totalExitsLiters + totalAdjustmentsLiters
  );

  const stockPercentage =
    stockConfig.tankCapacity > 0
      ? Math.min(100, Math.round((currentStockLiters / stockConfig.tankCapacity) * 100))
      : 0;

  const isLowStock = currentStockLiters <= (stockConfig.alertThreshold || 3000);
  const isCriticalStock = currentStockLiters <= (stockConfig.criticalThreshold || 1500);

  const totalDeliverySpend = fuelDeliveries.reduce((sum, d) => sum + Number(d.totalCost || 0), 0);

  // Update stock config
  const updateStockConfig = (config: Partial<StockConfig>) => {
    const updated: StockConfig = { ...stockConfig, ...config };
    setStockConfig(updated);
    FirebaseService.saveStockConfig(updated).catch(console.warn);
  };

  const addStockAdjustment = (adj: Omit<StockAdjustment, 'id' | 'createdAt'>) => {
    const newAdj: StockAdjustment = {
      ...adj,
      id: `adj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStockAdjustments((prev) => [newAdj, ...prev]);
    FirebaseService.saveStockAdjustment(newAdj).catch(console.warn);
  };

  // Helper finders
  const getVehicleById = (id: string) => vehicles.find((v) => v.id === id);
  const getCategoryById = (id: string) => categories.find((c) => c.id === id);
  const getDepartmentById = (id: string) => departments.find((d) => d.id === id);
  const getSupplierById = (id: string) => suppliers.find((s) => s.id === id);

  const getVehicleLastReading = (vehicleId: string) => {
    const vehicle = getVehicleById(vehicleId);
    const vehicleExits = fuelExits
      .filter((e) => e.vehicleId === vehicleId)
      .sort(
        (a, b) =>
          new Date(`${b.date}T${b.time || '00:00'}`).getTime() -
          new Date(`${a.date}T${a.time || '00:00'}`).getTime()
      );

    if (vehicleExits.length > 0) {
      return {
        reading: vehicleExits[0].currentReading,
        unitType: vehicle?.unitType || 'KM',
        date: vehicleExits[0].date,
      };
    }

    return {
      reading: vehicle?.currentReading || 0,
      unitType: vehicle?.unitType || 'KM',
      date: undefined,
    };
  };

  // Category Actions
  const addCategory = (cat: Omit<VehicleCategory, 'id'>) => {
    const newCat: VehicleCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    FirebaseService.saveCategory(newCat).catch(console.warn);
  };

  const updateCategory = (id: string, cat: Partial<VehicleCategory>) => {
    const existing = categories.find((c) => c.id === id);
    if (!existing) return;
    const merged = { ...existing, ...cat };
    setCategories((prev) => prev.map((c) => (c.id === id ? merged : c)));
    FirebaseService.saveCategory(merged).catch(console.warn);
  };

  const deleteCategory = (id: string): boolean => {
    const inUse = vehicles.some((v) => v.categoryId === id);
    if (inUse) return false;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    FirebaseService.deleteCategory(id).catch(console.warn);
    return true;
  };

  // Vehicle Actions
  const addVehicle = (veh: Omit<Vehicle, 'id'>) => {
    const newVeh: Vehicle = {
      ...veh,
      id: `veh-${Date.now()}`,
    };
    setVehicles((prev) => [...prev, newVeh]);
    FirebaseService.saveVehicle(newVeh).catch(console.warn);
  };

  const updateVehicle = (id: string, veh: Partial<Vehicle>) => {
    const existing = vehicles.find((v) => v.id === id);
    if (!existing) return;
    const merged = { ...existing, ...veh };
    setVehicles((prev) => prev.map((v) => (v.id === id ? merged : v)));
    FirebaseService.saveVehicle(merged).catch(console.warn);
  };

  const deleteVehicle = (id: string): boolean => {
    const inUse = fuelExits.some((e) => e.vehicleId === id);
    if (inUse) return false;
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    FirebaseService.deleteVehicle(id).catch(console.warn);
    return true;
  };

  // Department Actions
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    setDepartments((prev) => [...prev, newDept]);
    FirebaseService.saveDepartment(newDept).catch(console.warn);
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    const existing = departments.find((d) => d.id === id);
    if (!existing) return;
    const merged = { ...existing, ...dept };
    setDepartments((prev) => prev.map((d) => (d.id === id ? merged : d)));
    FirebaseService.saveDepartment(merged).catch(console.warn);
  };

  const deleteDepartment = (id: string): boolean => {
    const inUse =
      vehicles.some((v) => v.departmentId === id) || fuelExits.some((e) => e.departmentId === id);
    if (inUse) return false;
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    FirebaseService.deleteDepartment(id).catch(console.warn);
    return true;
  };

  // Supplier Actions
  const addSupplier = (sup: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...sup,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [...prev, newSup]);
    FirebaseService.saveSupplier(newSup).catch(console.warn);
  };

  const updateSupplier = (id: string, sup: Partial<Supplier>) => {
    const existing = suppliers.find((s) => s.id === id);
    if (!existing) return;
    const merged = { ...existing, ...sup };
    setSuppliers((prev) => prev.map((s) => (s.id === id ? merged : s)));
    FirebaseService.saveSupplier(merged).catch(console.warn);
  };

  const deleteSupplier = (id: string): boolean => {
    const inUse = fuelDeliveries.some((d) => d.supplierId === id);
    if (inUse) return false;
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    FirebaseService.deleteSupplier(id).catch(console.warn);
    return true;
  };

  // User Actions (ADMIN permission enforced)
  const addUser = (usr: Omit<User, 'id'>): { success: boolean; message?: string; user?: User } => {
    if (currentUser.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Action refusée: Seul un Administrateur (ADMIN) a le droit de créer des utilisateurs.',
      };
    }

    const emailExists = users.some((u) => u.email.toLowerCase() === usr.email.toLowerCase());
    if (emailExists) {
      return {
        success: false,
        message: 'Un utilisateur avec cet email existe déjà.',
      };
    }

    const initials = usr.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newUser: User = {
      ...usr,
      id: `usr-${Date.now()}`,
      avatar: initials || 'US',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setUsers((prev) => [...prev, newUser]);
    FirebaseService.saveUser(newUser).catch(console.warn);
    return { success: true, user: newUser };
  };

  const updateUser = (id: string, usr: Partial<User>): { success: boolean; message?: string } => {
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      return {
        success: false,
        message: 'Action refusée: Seul un Administrateur peut modifier d autres utilisateurs.',
      };
    }

    const existing = users.find((u) => u.id === id);
    if (!existing) return { success: false, message: 'Utilisateur non trouvé' };
    const merged = { ...existing, ...usr };

    setUsers((prev) => prev.map((u) => (u.id === id ? merged : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...usr }));
    }
    FirebaseService.saveUser(merged).catch(console.warn);
    return { success: true };
  };

  const deleteUser = (id: string): boolean => {
    if (currentUser.role !== 'ADMIN') return false;
    if (currentUser.id === id || users.length <= 1) return false;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    FirebaseService.deleteUser(id).catch(console.warn);
    return true;
  };

  // Fuel Exit Actions
  const addFuelExit = (exit: Omit<FuelExit, 'id' | 'ticketNumber' | 'createdAt'>): FuelExit => {
    const count = fuelExits.length + 1;
    const year = new Date().getFullYear();
    const ticketNumber = `BS-${year}-${String(count).padStart(4, '0')}`;
    const newExit: FuelExit = {
      ...exit,
      id: `exit-${Date.now()}`,
      ticketNumber,
      createdAt: new Date().toISOString(),
    };

    setFuelExits((prev) => [newExit, ...prev]);

    // Automatically update vehicle's current odometer/hours
    updateVehicle(exit.vehicleId, {
      currentReading: exit.currentReading,
    });

    FirebaseService.saveFuelExit(newExit).catch(console.warn);

    return newExit;
  };

  const updateFuelExit = (id: string, updatedFields: Partial<FuelExit>) => {
    setFuelExits((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const merged: FuelExit = { ...e, ...updatedFields };

        // Recalculate distance and consumption if readings or quantity were updated
        const isHours = getVehicleById(merged.vehicleId)?.unitType === 'HEURES';
        const delta = Math.max(0, Number(merged.currentReading || 0) - Number(merged.previousReading || 0));
        merged.distanceOrHours = delta;

        if (delta > 0 && merged.quantityLiters > 0) {
          if (isHours) {
            merged.calculatedConsumption = Number((merged.quantityLiters / delta).toFixed(2));
          } else {
            merged.calculatedConsumption = Number(((merged.quantityLiters / delta) * 100).toFixed(2));
          }
        }

        // If currentReading changed, update vehicle
        if (updatedFields.currentReading !== undefined && updatedFields.currentReading > 0) {
          updateVehicle(merged.vehicleId, {
            currentReading: merged.currentReading,
          });
        }

        FirebaseService.saveFuelExit(merged).catch(console.warn);
        return merged;
      })
    );
  };

  const deleteFuelExit = (id: string) => {
    setFuelExits((prev) => prev.filter((e) => e.id !== id));
    FirebaseService.deleteFuelExit(id).catch(console.warn);
  };

  // Fuel Delivery Actions
  const addFuelDelivery = (delivery: Omit<FuelDelivery, 'id' | 'createdAt'>): FuelDelivery => {
    const newDelivery: FuelDelivery = {
      ...delivery,
      id: `del-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFuelDeliveries((prev) => [newDelivery, ...prev]);
    FirebaseService.saveFuelDelivery(newDelivery).catch(console.warn);
    return newDelivery;
  };

  const deleteFuelDelivery = (id: string) => {
    setFuelDeliveries((prev) => prev.filter((d) => d.id !== id));
    FirebaseService.deleteFuelDelivery(id).catch(console.warn);
  };

  // Database Backup / Reset
  const resetToDefaults = () => {
    setCompanyProfile(initialCompanyProfile);
    setStockConfig(initialStockConfig);
    setStockAdjustments([]);
    setCategories(initialCategories);
    setVehicles(initialVehicles);
    setDepartments(initialDepartments);
    setSuppliers(initialSuppliers);
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setFuelExits(initialFuelExits);
    setFuelDeliveries(initialDeliveries);
  };

  const exportDatabaseJSON = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      companyProfile,
      stockConfig,
      stockAdjustments,
      categories,
      vehicles,
      departments,
      suppliers,
      users,
      fuelExits,
      fuelDeliveries,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDatabase = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.categories || !data.vehicles || !data.fuelExits) {
        return false;
      }
      if (data.companyProfile) updateCompanyProfile(data.companyProfile);
      if (data.stockConfig) updateStockConfig(data.stockConfig);
      if (data.stockAdjustments) setStockAdjustments(data.stockAdjustments);
      if (data.categories) setCategories(data.categories);
      if (data.vehicles) setVehicles(data.vehicles);
      if (data.departments) setDepartments(data.departments);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.users) setUsers(data.users);
      if (data.fuelExits) setFuelExits(data.fuelExits);
      if (data.fuelDeliveries) setFuelDeliveries(data.fuelDeliveries);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <GasconsContext.Provider
      value={{
        firebaseStatus,
        firebaseAuthUser,
        isAuthenticated,
        login,
        logout,
        signInWithGoogle,
        signOutFirebase,
        companyProfile,
        updateCompanyProfile,
        stockConfig,
        updateStockConfig,
        stockAdjustments,
        addStockAdjustment,
        currentStockLiters,
        stockPercentage,
        isLowStock,
        isCriticalStock,
        totalDeliveriesLiters,
        totalExitsLiters,
        totalDeliverySpend,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        users,
        currentUser,
        canManageUsers,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        fuelExits,
        addFuelExit,
        updateFuelExit,
        deleteFuelExit,
        fuelDeliveries,
        addFuelDelivery,
        deleteFuelDelivery,
        getVehicleById,
        getCategoryById,
        getDepartmentById,
        getSupplierById,
        getVehicleLastReading,
        resetToDefaults,
        importDatabase,
        exportDatabaseJSON,
      }}
    >
      {children}
    </GasconsContext.Provider>
  );
};

export const useGascons = () => {
  const context = useContext(GasconsContext);
  if (!context) {
    throw new Error('useGascons must be used within a GasconsProvider');
  }
  return context;
};
