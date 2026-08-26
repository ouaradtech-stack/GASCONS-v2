import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
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

export const FirebaseService = {
  // 1. Settings: Company Profile
  async saveCompanyProfile(profile: CompanyProfile): Promise<void> {
    const path = 'settings/company';
    try {
      await setDoc(doc(db, 'settings', 'company'), profile, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getCompanyProfile(): Promise<CompanyProfile | null> {
    const path = 'settings/company';
    try {
      const snap = await getDoc(doc(db, 'settings', 'company'));
      return snap.exists() ? (snap.data() as CompanyProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  subscribeCompanyProfile(callback: (profile: CompanyProfile | null) => void) {
    const path = 'settings/company';
    return onSnapshot(
      doc(db, 'settings', 'company'),
      (snap) => {
        callback(snap.exists() ? (snap.data() as CompanyProfile) : null);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // 2. Settings: Stock Config
  async saveStockConfig(config: StockConfig): Promise<void> {
    const path = 'settings/stockConfig';
    try {
      await setDoc(doc(db, 'settings', 'stockConfig'), config, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getStockConfig(): Promise<StockConfig | null> {
    const path = 'settings/stockConfig';
    try {
      const snap = await getDoc(doc(db, 'settings', 'stockConfig'));
      return snap.exists() ? (snap.data() as StockConfig) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  subscribeStockConfig(callback: (config: StockConfig | null) => void) {
    const path = 'settings/stockConfig';
    return onSnapshot(
      doc(db, 'settings', 'stockConfig'),
      (snap) => {
        callback(snap.exists() ? (snap.data() as StockConfig) : null);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // 3. Stock Adjustments
  async saveStockAdjustment(adj: StockAdjustment): Promise<void> {
    const path = `stockAdjustments/${adj.id}`;
    try {
      await setDoc(doc(db, 'stockAdjustments', adj.id), adj);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeStockAdjustments(callback: (adjustments: StockAdjustment[]) => void) {
    const path = 'stockAdjustments';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as StockAdjustment);
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // 4. Categories
  async saveCategory(cat: VehicleCategory): Promise<void> {
    const path = `categories/${cat.id}`;
    try {
      await setDoc(doc(db, 'categories', cat.id), cat);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeCategories(callback: (categories: VehicleCategory[]) => void) {
    const path = 'categories';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        callback(snap.docs.map((d) => d.data() as VehicleCategory));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // 5. Vehicles
  async saveVehicle(veh: Vehicle): Promise<void> {
    const path = `vehicles/${veh.id}`;
    try {
      await setDoc(doc(db, 'vehicles', veh.id), veh);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    const path = `vehicles/${id}`;
    try {
      await deleteDoc(doc(db, 'vehicles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeVehicles(callback: (vehicles: Vehicle[]) => void) {
    const path = 'vehicles';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        callback(snap.docs.map((d) => d.data() as Vehicle));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // 6. Departments
  async saveDepartment(dept: Department): Promise<void> {
    const path = `departments/${dept.id}`;
    try {
      await setDoc(doc(db, 'departments', dept.id), dept);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteDepartment(id: string): Promise<void> {
    const path = `departments/${id}`;
    try {
      await deleteDoc(doc(db, 'departments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeDepartments(callback: (departments: Department[]) => void) {
    const path = 'departments';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        callback(snap.docs.map((d) => d.data() as Department));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // 7. Suppliers
  async saveSupplier(sup: Supplier): Promise<void> {
    const path = `suppliers/${sup.id}`;
    try {
      await setDoc(doc(db, 'suppliers', sup.id), sup);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteSupplier(id: string): Promise<void> {
    const path = `suppliers/${id}`;
    try {
      await deleteDoc(doc(db, 'suppliers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeSuppliers(callback: (suppliers: Supplier[]) => void) {
    const path = 'suppliers';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        callback(snap.docs.map((d) => d.data() as Supplier));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // 8. Users
  async saveUser(user: User): Promise<void> {
    const path = `users/${user.id}`;
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteUser(id: string): Promise<void> {
    const path = `users/${id}`;
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeUsers(callback: (users: User[]) => void) {
    const path = 'users';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        callback(snap.docs.map((d) => d.data() as User));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // 9. Fuel Exits
  async saveFuelExit(exit: FuelExit): Promise<void> {
    const path = `fuelExits/${exit.id}`;
    try {
      await setDoc(doc(db, 'fuelExits', exit.id), exit);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteFuelExit(id: string): Promise<void> {
    const path = `fuelExits/${id}`;
    try {
      await deleteDoc(doc(db, 'fuelExits', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeFuelExits(callback: (exits: FuelExit[]) => void) {
    const path = 'fuelExits';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as FuelExit);
        items.sort(
          (a, b) =>
            new Date(`${b.date}T${b.time || '00:00'}`).getTime() -
            new Date(`${a.date}T${a.time || '00:00'}`).getTime()
        );
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // 10. Fuel Deliveries
  async saveFuelDelivery(delivery: FuelDelivery): Promise<void> {
    const path = `fuelDeliveries/${delivery.id}`;
    try {
      await setDoc(doc(db, 'fuelDeliveries', delivery.id), delivery);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteFuelDelivery(id: string): Promise<void> {
    const path = `fuelDeliveries/${id}`;
    try {
      await deleteDoc(doc(db, 'fuelDeliveries', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeFuelDeliveries(callback: (deliveries: FuelDelivery[]) => void) {
    const path = 'fuelDeliveries';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as FuelDelivery);
        items.sort(
          (a, b) =>
            new Date(`${b.date}T${b.time || '00:00'}`).getTime() -
            new Date(`${a.date}T${a.time || '00:00'}`).getTime()
        );
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // Bulk Seed initial data to Firestore if cloud is empty
  async seedInitialDataIfEmpty(initialData: {
    companyProfile: CompanyProfile;
    stockConfig: StockConfig;
    categories: VehicleCategory[];
    vehicles: Vehicle[];
    departments: Department[];
    suppliers: Supplier[];
    users: User[];
    fuelExits: FuelExit[];
    fuelDeliveries: FuelDelivery[];
  }): Promise<void> {
    try {
      const companyDoc = await getDoc(doc(db, 'settings', 'company'));
      if (!companyDoc.exists()) {
        console.log('Synchronizing initial data to Firebase Firestore...');
        await this.saveCompanyProfile(initialData.companyProfile);
        await this.saveStockConfig(initialData.stockConfig);

        const batch = writeBatch(db);
        initialData.categories.forEach((c) => {
          batch.set(doc(db, 'categories', c.id), c);
        });
        initialData.vehicles.forEach((v) => {
          batch.set(doc(db, 'vehicles', v.id), v);
        });
        initialData.departments.forEach((d) => {
          batch.set(doc(db, 'departments', d.id), d);
        });
        initialData.suppliers.forEach((s) => {
          batch.set(doc(db, 'suppliers', s.id), s);
        });
        initialData.users.forEach((u) => {
          batch.set(doc(db, 'users', u.id), u);
        });
        initialData.fuelExits.forEach((e) => {
          batch.set(doc(db, 'fuelExits', e.id), e);
        });
        initialData.fuelDeliveries.forEach((d) => {
          batch.set(doc(db, 'fuelDeliveries', d.id), d);
        });

        await batch.commit();
        console.log('Firebase initial data sync complete.');
      }
    } catch (err) {
      console.warn('Firebase initial sync note:', err);
    }
  },
};
