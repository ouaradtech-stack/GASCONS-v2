import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Ban,
  Briefcase,
  Building,
  Building2,
  Check,
  CheckCircle2,
  Cloud,
  Database,
  Download,
  Edit2,
  Eye,
  EyeOff,
  FileJson,
  Key,
  Layers,
  Lock,
  Monitor,
  Package,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  Upload,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useGascons } from '../context/GasconsContext';
import {
  Department,
  Supplier,
  User,
  UserRole,
  Vehicle,
  VehicleCategory,
  VehicleUnitType,
} from '../types';
import { CompanySetupModal } from './CompanySetupModal';
import { SupabaseSetupModal } from './SupabaseSetupModal';
import { SupabaseService } from '../services/supabaseService';

export const AdminDataView: React.FC = () => {
  const {
    companyProfile,
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
    addUser,
    updateUser,
    deleteUser,
    currentUser,
    isSuperAdmin,
    canManageUsers,
    isCurrentClientSuspended,
    toggleUserStatus,
    purgeFirebaseData,
    isFirebasePurged,
    setCurrentUser,
    exportDatabaseJSON,
    importDatabase,
    resetToDefaults,
    stockConfig,
    stockAdjustments,
    fuelExits,
    fuelDeliveries,
    firebaseStatus,
    sqlStatus,
    supabaseStatus,
    firebaseAuthUser,
    signInWithGoogle,
  } = useGascons();

  const [activeTab, setActiveTab] = useState<'vehicles' | 'categories' | 'users' | 'departments' | 'suppliers' | 'company' | 'backup'>('vehicles');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // 1. Vehicle Modal
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehCode, setVehCode] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [vehName, setVehName] = useState('');
  const [vehCategoryId, setVehCategoryId] = useState('');
  const [vehDepartmentId, setVehDepartmentId] = useState('');
  const [vehCapacity, setVehCapacity] = useState('200');
  const [vehReading, setVehReading] = useState('0');
  const [vehUnit, setVehUnit] = useState<VehicleUnitType>('KM');
  const [vehDriver, setVehDriver] = useState('');
  const [vehStatus, setVehStatus] = useState<'ACTIF' | 'EN_MAINTENANCE' | 'HORS_SERVICE'>('ACTIF');

  // 2. Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catUnit, setCatUnit] = useState<VehicleUnitType>('KM');
  const [catTargetRate, setCatTargetRate] = useState('20');
  const [catColor, setCatColor] = useState('#3b82f6');
  const [catDesc, setCatDesc] = useState('');

  // 3. User Modal with Password & Sous-Admin licensing fields
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('POMPISTE');
  const [userDept, setUserDept] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPasswordConfirm, setUserPasswordConfirm] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);

  // Sous-Admin specific fields
  const [userClientCompanyName, setUserClientCompanyName] = useState('');
  const [userLicenseType, setUserLicenseType] = useState<'STARTER' | 'BUSINESS' | 'ENTERPRISE' | 'SUR_MESURE'>('BUSINESS');
  const [userMaxVehicles, setUserMaxVehicles] = useState('20');
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState<'ACTIF' | 'SUSPENDU' | 'EXPIRE'>('ACTIF');
  const [userActive, setUserActive] = useState(true);
  const [userSuspensionReason, setUserSuspensionReason] = useState('');
  const [userExpiresAt, setUserExpiresAt] = useState('');
  const [userFilterTab, setUserFilterTab] = useState<'all' | 'sous_admin' | 'team'>('all');

  // Quick suspension modal
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState('');

  // Migration to Supabase & Firebase Purge states
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [migrationDone, setMigrationDone] = useState(false);
  const [isPurgingFirebase, setIsPurgingFirebase] = useState(false);
  const [purgeSuccessInfo, setPurgeSuccessInfo] = useState<string | null>(null);

  // 4. Department Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptManager, setDeptManager] = useState('');

  // 5. Supplier Modal
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [editingSupId, setEditingSupId] = useState<string | null>(null);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supPrice, setSupPrice] = useState('1.45');
  const [supAddress, setSupAddress] = useState('');

  // 6. JSON Import
  const [importJsonText, setImportJsonText] = useState('');

  // Open Vehicle Modal for Create / Edit
  const handleOpenVehicleModal = (v?: Vehicle) => {
    setErrorMsg('');
    if (v) {
      setEditingVehicleId(v.id);
      setVehCode(v.code);
      setVehPlate(v.plateNumber);
      setVehName(v.name);
      setVehCategoryId(v.categoryId);
      setVehDepartmentId(v.departmentId);
      setVehCapacity(String(v.tankCapacity));
      setVehReading(String(v.currentReading));
      setVehUnit(v.unitType);
      setVehDriver(v.assignedDriver || '');
      setVehStatus(v.status);
    } else {
      setEditingVehicleId(null);
      setVehCode(`V-${vehicles.length + 1}`);
      setVehPlate('');
      setVehName('');
      setVehCategoryId(categories[0]?.id || '');
      setVehDepartmentId(departments[0]?.id || '');
      setVehCapacity('250');
      setVehReading('0');
      setVehUnit('KM');
      setVehDriver('');
      setVehStatus('ACTIF');
    }
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehPlate.trim() || !vehName.trim()) {
      setErrorMsg('Veuillez remplir l immatriculation et le nom du véhicule.');
      return;
    }

    const payload = {
      code: vehCode.trim(),
      plateNumber: vehPlate.trim(),
      name: vehName.trim(),
      categoryId: vehCategoryId || categories[0]?.id,
      departmentId: vehDepartmentId || departments[0]?.id,
      tankCapacity: Number(vehCapacity) || 0,
      currentReading: Number(vehReading) || 0,
      unitType: vehUnit,
      assignedDriver: vehDriver.trim() || undefined,
      status: vehStatus,
    };

    if (editingVehicleId) {
      updateVehicle(editingVehicleId, payload);
      setSuccessMsg('Véhicule mis à jour avec succès.');
    } else {
      addVehicle(payload);
      setSuccessMsg('Nouveau véhicule ajouté à la base de données.');
    }

    setIsVehicleModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Open Category Modal
  const handleOpenCategoryModal = (c?: VehicleCategory) => {
    setErrorMsg('');
    if (c) {
      setEditingCategoryId(c.id);
      setCatName(c.name);
      setCatUnit(c.unitType);
      setCatTargetRate(String(c.defaultTargetRate));
      setCatColor(c.color || '#3b82f6');
      setCatDesc(c.description || '');
    } else {
      setEditingCategoryId(null);
      setCatName('');
      setCatUnit('KM');
      setCatTargetRate('25');
      setCatColor('#3b82f6');
      setCatDesc('');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setErrorMsg('Le nom de la catégorie est obligatoire.');
      return;
    }
    const payload = {
      name: catName.trim(),
      unitType: catUnit,
      defaultTargetRate: Number(catTargetRate) || 0,
      color: catColor,
      description: catDesc.trim() || undefined,
    };

    if (editingCategoryId) {
      updateCategory(editingCategoryId, payload);
    } else {
      addCategory(payload);
    }
    setIsCategoryModalOpen(false);
  };

  // Open User Modal
  const handleOpenUserModal = (u?: User, presetRole?: UserRole) => {
    setErrorMsg('');
    setShowUserPassword(false);
    if (u) {
      // If editing another user and not Admin
      if (!canManageUsers && currentUser.id !== u.id) {
        setErrorMsg('Action refusée: Seul un Administrateur ou Super-Admin peut modifier d autres utilisateurs.');
        return;
      }
      setEditingUserId(u.id);
      setUserName(u.name);
      setUserEmail(u.email);
      setUserRole(u.role);
      setUserDept(u.department);
      setUserPassword(u.password || '');
      setUserPasswordConfirm(u.password || '');
      setUserClientCompanyName(u.clientCompanyName || '');
      setUserLicenseType(u.licenseType || 'BUSINESS');
      setUserMaxVehicles(String(u.maxVehiclesQuota || 20));
      setUserSubscriptionStatus(u.subscriptionStatus || (u.active !== false ? 'ACTIF' : 'SUSPENDU'));
      setUserActive(u.active ?? true);
      setUserSuspensionReason(u.suspensionReason || '');
      setUserExpiresAt(u.subscriptionExpiresAt || u.licenseExpiresAt || '');
    } else {
      // Creating new user requires ADMIN or SUPER_ADMIN role
      if (!canManageUsers) {
        setErrorMsg('Action refusée: Seul un Administrateur ou Super-Admin a le droit de créer des utilisateurs ou sous-admins.');
        return;
      }
      setEditingUserId(null);
      setUserName('');
      setUserEmail('');
      setUserRole(presetRole || 'SOUS_ADMIN');
      setUserDept(presetRole === 'SOUS_ADMIN' ? 'Client Externe' : (departments[0]?.name || 'Direction'));
      setUserPassword('');
      setUserPasswordConfirm('');
      setUserClientCompanyName('');
      setUserLicenseType('BUSINESS');
      setUserMaxVehicles('20');
      setUserSubscriptionStatus('ACTIF');
      setUserActive(true);
      setUserSuspensionReason('');
      setUserExpiresAt('');
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!userName.trim() || !userEmail.trim()) {
      setErrorMsg('Le nom et l email sont obligatoires.');
      return;
    }

    if (!editingUserId) {
      // Creating new user: Password is required!
      if (!userPassword || userPassword.length < 4) {
        setErrorMsg('Le mot de passe doit contenir au moins 4 caractères.');
        return;
      }
      if (userPassword !== userPasswordConfirm) {
        setErrorMsg('Les mots de passe ne correspondent pas.');
        return;
      }
    } else {
      // Editing existing user
      if (userPassword && userPassword.length < 4) {
        setErrorMsg('Le mot de passe doit contenir au moins 4 caractères.');
        return;
      }
      if (userPassword && userPassword !== userPasswordConfirm) {
        setErrorMsg('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    const isSousAdmin = userRole === 'SOUS_ADMIN';

    const payload: Partial<User> & { name: string; email: string; role: UserRole; department: string; active: boolean } = {
      name: userName.trim(),
      email: userEmail.trim(),
      role: userRole,
      department: userDept.trim() || (isSousAdmin ? 'Client Externe' : 'Direction'),
      active: userActive,
      subscriptionStatus: userSubscriptionStatus,
      ...(isSousAdmin ? {
        clientCompanyName: userClientCompanyName.trim() || userName.trim(),
        licenseType: userLicenseType,
        maxVehiclesQuota: Number(userMaxVehicles) || 20,
        subscriptionExpiresAt: userExpiresAt || undefined,
        suspensionReason: userActive ? undefined : (userSuspensionReason || 'Désactivé par le Super Administrateur'),
      } : {}),
      ...(userPassword ? { password: userPassword } : {}),
    };

    if (editingUserId) {
      const res = updateUser(editingUserId, payload);
      if (!res.success) {
        setErrorMsg(res.message || 'Erreur lors de la modification.');
        return;
      }
      setSuccessMsg('Compte utilisateur / sous-admin mis à jour avec succès !');
    } else {
      const res = addUser(payload as Omit<User, 'id'>);
      if (!res.success) {
        setErrorMsg(res.message || 'Erreur lors de la création de l utilisateur.');
        return;
      }
      setSuccessMsg(
        isSousAdmin
          ? `Sous-Admin Client "${payload.name}" (${userClientCompanyName || 'Entreprise'}) créé avec succès !`
          : `Utilisateur ${payload.name} (${payload.role}) créé avec mot de passe !`
      );
    }

    setTimeout(() => setSuccessMsg(''), 4000);
    setIsUserModalOpen(false);
  };

  // Quick suspension handler
  const handleOpenSuspendModal = (u: User) => {
    setUserToSuspend(u);
    setSuspendReasonInput(u.suspensionReason || 'Non-paiement de licence ou suspension administrative');
    setIsSuspendModalOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!userToSuspend) return;
    const ok = await toggleUserStatus(userToSuspend.id, false, suspendReasonInput);
    if (ok) {
      setSuccessMsg(`Le sous-admin client "${userToSuspend.clientCompanyName || userToSuspend.name}" a été DÉSACTIVÉ.`);
    } else {
      setErrorMsg('Erreur lors de la désactivation.');
    }
    setIsSuspendModalOpen(false);
    setUserToSuspend(null);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleReactivateUser = async (u: User) => {
    const ok = await toggleUserStatus(u.id, true);
    if (ok) {
      setSuccessMsg(`Le sous-admin client "${u.clientCompanyName || u.name}" a été RÉACTIVÉ avec succès !`);
    } else {
      setErrorMsg('Erreur lors de la réactivation.');
    }
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Migration to Supabase & Firebase Purge handlers
  const handleMigrateToSupabase = async () => {
    setIsMigrating(true);
    setMigrationLogs([]);
    setErrorMsg('');
    const logs: string[] = [];

    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString('fr-FR')}] ${msg}`);
      setMigrationLogs([...logs]);
    };

    try {
      addLog('Vérification de la connexion Supabase...');
      if (!SupabaseService.isAvailable()) {
        throw new Error('Supabase n est pas encore configuré. Renseignez l URL et la clé Supabase.');
      }

      addLog('1/9 Migration du Profil Société vers Supabase...');
      await SupabaseService.saveCompanyProfile(companyProfile);

      addLog('2/9 Migration de la Configuration Cuve vers Supabase...');
      await SupabaseService.saveStockConfig(stockConfig);

      addLog(`3/9 Migration des Catégories (${categories.length} éléments) vers Supabase...`);
      for (const cat of categories) {
        await SupabaseService.saveCategory(cat);
      }

      addLog(`4/9 Migration du Parc Véhicules (${vehicles.length} véhicules) vers Supabase...`);
      for (const veh of vehicles) {
        await SupabaseService.saveVehicle(veh);
      }

      addLog(`5/9 Migration des Départements (${departments.length} départements) vers Supabase...`);
      for (const dept of departments) {
        await SupabaseService.saveDepartment(dept);
      }

      addLog(`6/9 Migration des Fournisseurs (${suppliers.length} fournisseurs) vers Supabase...`);
      for (const sup of suppliers) {
        await SupabaseService.saveSupplier(sup);
      }

      addLog(`7/9 Migration des Utilisateurs & Sous-Admins (${users.length} comptes) vers Supabase...`);
      for (const usr of users) {
        await SupabaseService.saveUser(usr);
      }

      addLog(`8/9 Migration des Bons de Sortie Gasoil (${fuelExits.length} sorties) vers Supabase...`);
      for (const exit of fuelExits) {
        await SupabaseService.saveFuelExit(exit);
      }

      addLog(`9/9 Migration des Réceptions Carburant (${fuelDeliveries.length} livraisons) vers Supabase...`);
      for (const del of fuelDeliveries) {
        await SupabaseService.saveFuelDelivery(del);
      }

      addLog('🎉 SUCCÈS : 100% des données ont été migrées et stockées dans Supabase PostgreSQL !');
      setMigrationDone(true);
      setSuccessMsg('Migration complète vers Supabase réussie avec succès !');
    } catch (err: any) {
      addLog(`❌ Échec : ${err?.message || err}`);
      setErrorMsg(`Erreur migration Supabase : ${err?.message || err}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handlePurgeFirebase = async () => {
    const confirm1 = window.confirm(
      '⚠️ SUPPRESSION DÉFINITIVE CHEZ FIREBASE :\n\nÊtes-vous sûr de vouloir supprimer TOUTES les données chez Firebase Firestore ?\n\nCette action va vider toutes les collections Firebase pour que vos données soient UNIQUEMENT conservées dans Supabase.'
    );
    if (!confirm1) return;

    const confirm2 = window.prompt(
      'TAPEZ "PURGER" EN MAJUSCULES POUR CONFIRMER LA SUPPRESSION DÉFINITIVE DE FIREBASE :'
    );
    if (confirm2 !== 'PURGER') {
      alert('Action annulée : Le mot de confirmation est incorrect.');
      return;
    }

    setIsPurgingFirebase(true);
    try {
      const res = await purgeFirebaseData();
      if (res.success) {
        setPurgeSuccessInfo(`Purge Firebase terminée : ${res.count} documents Firestore ont été définitivement supprimés.`);
        setSuccessMsg('Données Firebase supprimées avec succès ! Supabase est désormais la seule base.');
      } else {
        setErrorMsg(`Erreur lors de la suppression Firebase : ${res.error}`);
      }
    } catch (err: any) {
      setErrorMsg(`Erreur lors de la purge : ${err?.message || err}`);
    } finally {
      setIsPurgingFirebase(false);
    }
  };

  // Open Dept Modal
  const handleOpenDeptModal = (d?: Department) => {
    if (d) {
      setEditingDeptId(d.id);
      setDeptName(d.name);
      setDeptCode(d.code);
      setDeptManager(d.manager);
    } else {
      setEditingDeptId(null);
      setDeptName('');
      setDeptCode(`DEP-${departments.length + 1}`);
      setDeptManager('');
    }
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;
    const payload = {
      name: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      manager: deptManager.trim(),
    };
    if (editingDeptId) {
      updateDepartment(editingDeptId, payload);
    } else {
      addDepartment(payload);
    }
    setIsDeptModalOpen(false);
  };

  // Open Supplier Modal
  const handleOpenSupModal = (s?: Supplier) => {
    if (s) {
      setEditingSupId(s.id);
      setSupName(s.name);
      setSupContact(s.contactName);
      setSupPhone(s.phone);
      setSupPrice(String(s.pricePerLiter));
      setSupAddress(s.address || '');
    } else {
      setEditingSupId(null);
      setSupName('');
      setSupContact('');
      setSupPhone('');
      setSupPrice('1.45');
      setSupAddress('');
    }
    setIsSupModalOpen(true);
  };

  const handleSaveSup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;
    const payload = {
      name: supName.trim(),
      contactName: supContact.trim(),
      phone: supPhone.trim(),
      pricePerLiter: Number(supPrice) || 0,
      address: supAddress.trim() || undefined,
    };
    if (editingSupId) {
      updateSupplier(editingSupId, payload);
    } else {
      addSupplier(payload);
    }
    setIsSupModalOpen(false);
  };

  // Download Backup JSON
  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gascons_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  // Import Backup JSON
  const handleApplyImport = () => {
    if (!importJsonText.trim()) return;
    const ok = importDatabase(importJsonText);
    if (ok) {
      alert('Base de données restaurée avec succès !');
      setImportJsonText('');
    } else {
      alert('Erreur: Le format JSON fourni est invalide ou corrompu.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Base de Données & Paramétrage
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administration du parc véhicules, catégories, utilisateurs (Admin / Pompiste), départements et sauvegardes
          </p>
        </div>

        {/* Active user switcher badge */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-slate-500">Profil Actif:</span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const u = users.find((usr) => usr.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
            className="bg-transparent font-bold text-slate-800 outline-hidden"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'vehicles'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          Véhicules & Engins ({vehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Catégories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Utilisateurs & Mots de passe ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'departments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Départements ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          Fournisseurs ({suppliers.length})
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-500" />
          Société & Logo
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'backup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          Sauvegarde & Restauration
        </button>
      </div>

      {/* 1. VEHICLES TAB */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Parc de Véhicules & Équipements</h3>
            <button
              onClick={() => handleOpenVehicleModal()}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Nouveau Véhicule
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Code & Immat.</th>
                  <th className="px-3 py-2.5">Désignation</th>
                  <th className="px-3 py-2.5">Catégorie</th>
                  <th className="px-3 py-2.5">Département</th>
                  <th className="px-3 py-2.5 text-right">Compteur Actuel</th>
                  <th className="px-3 py-2.5 text-right">Capacité</th>
                  <th className="px-3 py-2.5">Chauffeur</th>
                  <th className="px-3 py-2.5">Statut</th>
                  <th className="px-3 py-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => {
                  const cat = categories.find((c) => c.id === v.categoryId);
                  const dept = departments.find((d) => d.id === v.departmentId);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5">
                        <span className="font-mono font-bold text-blue-900 block">{v.code}</span>
                        <span className="font-mono text-[11px] text-slate-500">{v.plateNumber}</span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{v.name}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${cat?.color || '#3b82f6'}15`,
                            color: cat?.color || '#3b82f6',
                          }}
                        >
                          {cat?.name || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{dept?.name || '-'}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-800">
                        {v.currentReading.toLocaleString('fr-FR')} {v.unitType === 'HEURES' ? 'h' : 'km'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-600">{v.tankCapacity} L</td>
                      <td className="px-3 py-2.5 text-slate-700">{v.assignedDriver || '-'}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            v.status === 'ACTIF'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenVehicleModal(v)}
                            className="p-1 rounded-lg text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Supprimer le véhicule ${v.name} ?`)) {
                                const ok = deleteVehicle(v.id);
                                if (!ok) alert('Impossible de supprimer ce véhicule car des sorties y sont associées.');
                              }
                            }}
                            className="p-1 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Catégories de Véhicules & Normes de Consommation</h3>
            <button
              onClick={() => handleOpenCategoryModal()}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Catégorie
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                  </div>
                  <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {c.unitType}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Norme conso réf:{' '}
                  <strong className="text-blue-900 font-mono font-bold">
                    {c.defaultTargetRate} {c.unitType === 'HEURES' ? 'L/h' : 'L/100km'}
                  </strong>
                </div>
                {c.description && <p className="text-[11px] text-slate-500">{c.description}</p>}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleOpenCategoryModal(c)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer la catégorie ${c.name} ?`)) {
                        const ok = deleteCategory(c.id);
                        if (!ok) alert('Impossible de supprimer une catégorie contenant des véhicules.');
                      }
                    }}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          {/* Super Admin Executive Banner */}
          {isSuperAdmin ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-indigo-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold text-lg shadow-inner">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Console Super-Administrateur Master
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {currentUser.email}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Contrôle central des licences : Vendez des accès Sous-Admins à vos clients, définissez leurs quotas et désactivez-les instantanément en cas d impayé ou de litige.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenUserModal(undefined, 'SOUS_ADMIN')}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <Award className="w-4 h-4" />
                    <span>+ Vendre Licence Client (Sous-Admin)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : !canManageUsers ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Accès Restreint : Seul un Administrateur peut créer ou modifier les utilisateurs</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Votre profil actuel est <span className="font-bold uppercase font-mono">{currentUser.role}</span>. Connectez-vous avec un compte Administrateur pour gérer les comptes.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">
                  Droits Administrateur Actifs : Gestion des comptes et mots de passe.
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                ADMIN CONSOLE
              </span>
            </div>
          )}

          {/* Sub-navigation Filters and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserFilterTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  userFilterTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tous ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setUserFilterTab('sous_admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  userFilterTab === 'sous_admin'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Clients Sous-Admins ({users.filter((u) => u.role === 'SOUS_ADMIN').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setUserFilterTab('team')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  userFilterTab === 'team'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Équipe Interne ({users.filter((u) => u.role !== 'SOUS_ADMIN').length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              {canManageUsers && (
                <button
                  onClick={() => handleOpenUserModal(undefined, 'POMPISTE')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau Compte Interne</span>
                </button>
              )}
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users
              .filter((u) => {
                if (userFilterTab === 'sous_admin') return u.role === 'SOUS_ADMIN';
                if (userFilterTab === 'team') return u.role !== 'SOUS_ADMIN';
                return true;
              })
              .map((u) => {
                const isCurrent = currentUser.id === u.id;
                const hasPassword = Boolean(u.password);
                const isSousAdmin = u.role === 'SOUS_ADMIN';
                const isSuper = u.role === 'SUPER_ADMIN' || u.email.toLowerCase() === 'ouaradtech@gmail.com';
                const isSuspended = u.active === false || u.subscriptionStatus === 'SUSPENDU';

                return (
                  <div
                    key={u.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                        : isSuspended
                        ? 'bg-rose-50/40 border-rose-300 hover:border-rose-400'
                        : isSousAdmin
                        ? 'bg-gradient-to-b from-amber-50/40 to-slate-50 border-amber-200 hover:border-amber-300 shadow-2xs'
                        : isSuper
                        ? 'bg-gradient-to-b from-purple-50/40 to-slate-50 border-purple-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-9 h-9 rounded-xl text-white font-black text-xs flex items-center justify-center shadow-xs ${
                              isSuper
                                ? 'bg-purple-900'
                                : isSousAdmin
                                ? 'bg-amber-600'
                                : 'bg-slate-900'
                            }`}
                          >
                            {u.avatar || u.name[0]}
                          </span>
                          <div>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded border inline-block ${
                                isSuper
                                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                                  : isSousAdmin
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : u.role === 'ADMIN'
                                  ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                  : u.role === 'GESTIONNAIRE'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : u.role === 'SUPERVISEUR'
                                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              {isSuper ? '👑 SUPER ADMIN' : isSousAdmin ? '⭐ CLIENT SOUS-ADMIN' : u.role}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        {isSuspended ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <Ban className="w-3 h-3 text-rose-600" />
                            DÉSACTIVÉ
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            ACTIF
                          </span>
                        )}
                      </div>

                      {/* Client Company Name if Sous-Admin */}
                      {isSousAdmin && (
                        <div className="mb-2 p-2 rounded-xl bg-amber-50/80 border border-amber-200/80">
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 truncate">
                            <Building className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>{u.clientCompanyName || 'Entreprise Cliente'}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-amber-800 mt-1 font-semibold">
                            <span>Licence: {u.licenseType || 'BUSINESS'}</span>
                            <span className="font-mono">Quota: {u.maxVehiclesQuota || 20} véh.</span>
                          </div>
                        </div>
                      )}

                      {/* User Info */}
                      <h4 className="font-bold text-xs text-slate-900 truncate">{u.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate font-mono">{u.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{u.department}</p>

                      {/* Suspension Reason Warning */}
                      {isSuspended && u.suspensionReason && (
                        <div className="mt-2 p-2 rounded-lg bg-rose-100/80 border border-rose-200 text-rose-900 text-[10px] flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Motif de coupure :</span>
                            <span>{u.suspensionReason}</span>
                          </div>
                        </div>
                      )}

                      {/* Password Info */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          Mot de passe :
                        </span>
                        <span className="font-mono font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {hasPassword ? '••••••••' : 'Non défini'}
                        </span>
                      </div>
                    </div>

                    {/* Actions and Deactivation Toggle */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-2">
                      {/* Sub-admin direct suspension toggle */}
                      {(isSuperAdmin || canManageUsers) && isSousAdmin && (
                        <div>
                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleReactivateUser(u)}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>Réactiver le Sous-Admin</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenSuspendModal(u)}
                              className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <PowerOff className="w-3.5 h-3.5 text-rose-600" />
                              <span>Désactiver / Couper l Accès</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <button
                          onClick={() => setCurrentUser(u)}
                          disabled={isCurrent}
                          className={`font-semibold text-[11px] ${
                            isCurrent ? 'text-emerald-700 font-bold' : 'text-blue-600 hover:underline'
                          }`}
                        >
                          {isCurrent ? '✓ Connecté Actuellement' : 'Basculer vers ce compte'}
                        </button>

                        <div className="flex items-center gap-1">
                          {(canManageUsers || isCurrent) && (
                            <button
                              onClick={() => handleOpenUserModal(u)}
                              title="Modifier utilisateur, quota ou licence"
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canManageUsers && users.length > 1 && !isCurrent && !isSuper && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Supprimer définitivement le compte ${u.name} ?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              title="Supprimer l utilisateur"
                              className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 4. DEPARTMENTS TAB */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Départements & Chantiers</h3>
            <button
              onClick={() => handleOpenDeptModal()}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Nouveau Département
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-900">
                    {d.code}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenDeptModal(d)} className="text-blue-600 text-xs">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const ok = deleteDepartment(d.id);
                        if (!ok) alert('Département utilisé dans des véhicules ou sorties.');
                      }}
                      className="text-red-600 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-xs text-slate-900">{d.name}</h4>
                <p className="text-[11px] text-slate-500">Responsable: {d.manager}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SUPPLIERS TAB */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Fournisseurs de Carburant</h3>
            <button
              onClick={() => handleOpenSupModal()}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Nouveau Fournisseur
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{s.name}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenSupModal(s)} className="text-blue-600 text-xs">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const ok = deleteSupplier(s.id);
                        if (!ok) alert('Fournisseur lié à des livraisons.');
                      }}
                      className="text-red-600 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p>Contact: {s.contactName}</p>
                  <p>Tél: {s.phone}</p>
                  <p className="font-mono text-emerald-800 font-bold">Prix indicatif: {s.pricePerLiter} €/L</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. COMPANY PROFILE & LOGO TAB */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Paramètres de la Société & En-têtes Officiels
              </h3>
              <p className="text-xs text-slate-500">
                Configuration de la Raison Sociale, du Logo, des identifiants légaux et de l en-tête des bons de sortie
              </p>
            </div>
            <button
              onClick={() => setIsCompanyModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Modifier Logo & Raison Sociale
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Identity Card */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white space-y-4 shadow-lg border border-slate-800 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 flex items-center justify-center border border-white/20 shadow-inner">
                    {companyProfile.logoUrl && companyProfile.logoUrl.startsWith('data:') ? (
                      <img
                        src={companyProfile.logoUrl}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain rounded"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-3xl font-black text-amber-400">
                        {companyProfile.logoUrl === 'fuel-shield' ? '⛽' :
                         companyProfile.logoUrl === 'btp-truck' ? '🚜' :
                         companyProfile.logoUrl === 'transport-heavy' ? '🚛' :
                         companyProfile.logoUrl === 'industry-gear' ? '🏭' : '⛽'}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 uppercase tracking-wider border border-blue-400/20">
                      {companyProfile.legalStatus || 'SARL'}
                    </span>
                    <h4 className="text-lg font-black text-white mt-1 leading-tight">
                      {companyProfile.name || 'ENTREPRISE NON CONFIGURÉE'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {companyProfile.activity || 'Travaux Publics & Transport'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30">
                  {companyProfile.currency || 'DZD'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Identifiants Légaux</span>
                  <p className="font-mono text-slate-200 mt-0.5">{companyProfile.taxId || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Téléphone</span>
                  <p className="text-slate-200 mt-0.5">{companyProfile.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Email Direction</span>
                  <p className="text-slate-200 mt-0.5 truncate">{companyProfile.email || 'Non renseigné'}</p>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Siège & Dépôt</span>
                  <p className="text-slate-200 mt-0.5">
                    {companyProfile.address ? `${companyProfile.address}, ` : ''}{companyProfile.city || ''} {companyProfile.country ? `(${companyProfile.country})` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Print Header Preview */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Rendu sur Bon de Sortie & Impression
                </span>
                <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="text-[10px] font-bold text-slate-900 truncate max-w-[150px]">
                      {companyProfile.name}
                    </div>
                    <span className="text-[8px] font-mono text-slate-400">BON-SORTIE-001</span>
                  </div>
                  <p className="text-[9px] text-slate-500 italic">
                    « {companyProfile.headerTagline || 'Gestion & Contrôle des Consommations de Gasoil'} »
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCompanyModalOpen(true)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition-colors"
              >
                Éditer les Paramètres Société
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BACKUP & RESTORE TAB */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Sauvegarde, Cloud Supabase & Bases de Données</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Synchronisation Supabase (PostgreSQL), Cloud SQL, Firebase Firestore, export JSON et restauration
            </p>
          </div>

          {/* Cloud Databases Status Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Supabase Database Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white border border-emerald-800/60 shadow-lg flex flex-col justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/30 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/20">
                      Supabase Cloud
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                      supabaseStatus === 'connected'
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/20'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                      {supabaseStatus === 'connected' ? 'Connecté' : 'À configurer'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1 truncate">
                    Supabase PostgreSQL
                  </h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5 line-clamp-2">
                    Synchronisation automatique et stockage temps réel
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Gérer Supabase & Sync</span>
              </button>
            </div>

            {/* Cloud SQL PostgreSQL Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/60 shadow-lg flex flex-col justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-500/30 shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                      Cloud SQL
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                      sqlStatus === 'connected'
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/20'
                        : 'bg-amber-500/30 text-amber-300 border-amber-400/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sqlStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      {sqlStatus === 'connected' ? 'Actif' : 'En attente'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1">
                    PostgreSQL & Drizzle
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Région : <span className="font-mono text-indigo-300">europe-west3</span>
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700 font-mono">
                ai-studio-a8fb6796
              </div>
            </div>

            {/* Firebase Cloud Firestore Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950 via-slate-900 to-sky-950 text-white border border-sky-800/60 shadow-lg flex flex-col justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-sky-500/30 shrink-0">
                  <Cloud className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/30 text-sky-200 border border-sky-400/20">
                      Firebase & Auth
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {firebaseStatus === 'connected' ? 'En Direct' : 'Prêt'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1">
                    Authentification & Sync
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    {firebaseAuthUser ? firebaseAuthUser.email : 'credible-drake-hlcf1'}
                  </p>
                </div>
              </div>

              {!firebaseAuthUser ? (
                <button
                  type="button"
                  onClick={() => signInWithGoogle().catch(console.warn)}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition-all"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Connexion Google</span>
                </button>
              ) : (
                <div className="text-[11px] text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700/50 font-medium truncate text-center">
                  Compte Google connecté
                </div>
              )}
            </div>
          </div>

          {/* MIGRATION SUPABASE & PURGE SÉCURISÉE FIREBASE MODULE */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                    <Zap className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-sm text-white">
                    Transition Supabase Cloud & Purge Sécurisée Firebase
                  </h4>
                  {isFirebasePurged && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Firebase Supprimé
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enregistrez l intégralité des données dans Supabase (PostgreSQL), puis supprimez les données chez Firebase pour finaliser la bascule exclusive.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                  Total : {vehicles.length} véhicules • {fuelExits.length} sorties • {users.length} comptes
                </span>
              </div>
            </div>

            {/* Actions Grid: Step 1 and Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1: Migrate to Supabase */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-emerald-900/60 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Étape 1 : Enregistrement
                    </span>
                    {migrationDone && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Données en sécurité
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-xs text-white">Enregistrer toutes les données dans Supabase</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Écrit et synchronise toutes les tables (profil, véhicules, catégories, sorties, réceptions, utilisateurs et sous-admins) dans la base PostgreSQL Supabase.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMigrateToSupabase}
                  disabled={isMigrating}
                  className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md ${
                    isMigrating
                      ? 'bg-slate-700 text-slate-300 cursor-wait'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98 shadow-emerald-950'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
                  <span>{isMigrating ? 'Transfert vers Supabase en cours...' : '1. Enregistrer dans Supabase Maintenant'}</span>
                </button>
              </div>

              {/* Step 2: Purge Firebase */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
                isFirebasePurged
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-slate-900/80 border-rose-900/60'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isFirebasePurged
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                    }`}>
                      Étape 2 : Nettoyage Firebase
                    </span>
                    {isFirebasePurged && (
                      <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Purge effectuée
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-xs text-white">Supprimer les données chez Firebase</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isFirebasePurged
                      ? 'Les documents Firestore ont déjà été définitivement purgés. Les écritures Firebase sont verrouillées.'
                      : 'Supprime irréversiblement toutes les collections Firestore pour ne laisser aucune donnée résiduelle chez Firebase.'}
                  </p>
                </div>

                {isFirebasePurged ? (
                  <div className="p-2.5 bg-emerald-900/30 border border-emerald-700/40 rounded-xl text-center text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Firebase vidé : Base 100% active = Supabase</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePurgeFirebase}
                    disabled={isPurgingFirebase}
                    className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md ${
                      isPurgingFirebase
                        ? 'bg-slate-700 text-slate-300 cursor-wait'
                        : 'bg-rose-600 hover:bg-rose-500 text-white active:scale-98 shadow-rose-950'
                    }`}
                  >
                    <Trash2 className={`w-4 h-4 ${isPurgingFirebase ? 'animate-spin' : ''}`} />
                    <span>{isPurgingFirebase ? 'Suppression chez Firebase en cours...' : '2. Supprimer les données chez Firebase'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Migration Real-time Logs Console */}
            {migrationLogs.length > 0 && (
              <div className="p-4 rounded-xl bg-black/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1">
                  <span className="font-mono font-bold text-emerald-400">Journal de synchronisation Supabase</span>
                  <span>{migrationLogs.length} opérations</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px]">
                  {migrationLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`${
                        log.includes('✅') || log.includes('SUCCÈS')
                          ? 'text-emerald-400 font-bold'
                          : log.includes('❌') || log.includes('Échec')
                          ? 'text-rose-400 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purge Success Alert */}
            {purgeSuccessInfo && (
              <div className="p-3.5 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{purgeSuccessInfo}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export block */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                Exporter la Sauvegarde Complète (JSON)
              </h4>
              <p className="text-xs text-slate-500">
                Téléchargez un fichier JSON complet contenant toutes vos tables et configurations pour sécuriser vos données.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger Sauvegarde .JSON
              </button>
            </div>

            {/* Reset block */}
            <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
              <h4 className="font-bold text-xs text-rose-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-rose-600" />
                Réinitialiser Données Démo
              </h4>
              <p className="text-xs text-rose-700">
                Remet à zéro la base de données avec le jeu d essai initial officiel (catégories, engins, livraisons et sorties).
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Voulez-vous réinitialiser toutes les données de démonstration ?')) {
                    resetToDefaults();
                    alert('Données réinitialisées !');
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Réinitialiser avec Données de Démo
              </button>
            </div>
          </div>

          {/* Import JSON Text */}
          <div className="p-5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              Restaurer une Sauvegarde JSON
            </h4>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Collez ici le contenu de votre fichier de sauvegarde JSON..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleApplyImport}
              disabled={!importJsonText.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Importer et Remplacer la Base
            </button>
          </div>
        </div>
      )}

      {/* Vehicle Modal Form */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingVehicleId ? 'Modifier Véhicule / Engin' : 'Créer un Véhicule / Engin'}
              </h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code Interne</label>
                  <input
                    type="text"
                    value={vehCode}
                    onChange={(e) => setVehCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Immatriculation / N° Série *</label>
                  <input
                    type="text"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value)}
                    required
                    placeholder="ex: 4821-AB-16"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Désignation / Modèle *</label>
                <input
                  type="text"
                  value={vehName}
                  onChange={(e) => setVehName(e.target.value)}
                  required
                  placeholder="ex: Caterpillar 320D"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie *</label>
                  <select
                    value={vehCategoryId}
                    onChange={(e) => {
                      setVehCategoryId(e.target.value);
                      const cat = categories.find((c) => c.id === e.target.value);
                      if (cat) setVehUnit(cat.unitType);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.unitType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Département Affecté *</label>
                  <select
                    value={vehDepartmentId}
                    onChange={(e) => setVehDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unité Compteur</label>
                  <select
                    value={vehUnit}
                    onChange={(e) => setVehUnit(e.target.value as VehicleUnitType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="KM">Kilomètres (KM)</option>
                    <option value="HEURES">Heures (h)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Index Compteur</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={vehReading}
                    onChange={(e) => setVehReading(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacité Réservoir (L)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={vehCapacity}
                    onChange={(e) => setVehCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chauffeur / Opérateur Assigné</label>
                  <input
                    type="text"
                    value={vehDriver}
                    onChange={(e) => setVehDriver(e.target.value)}
                    placeholder="ex: Omar Selmi"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statut</label>
                  <select
                    value={vehStatus}
                    onChange={(e) => setVehStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="ACTIF">ACTIF</option>
                    <option value="EN_MAINTENANCE">EN MAINTENANCE</option>
                    <option value="HORS_SERVICE">HORS SERVICE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl"
                >
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal Form */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingCategoryId ? 'Modifier Catégorie' : 'Créer une Catégorie'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom de la Catégorie *</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                  placeholder="ex: Poids Lourds & Bennes"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unité</label>
                  <select
                    value={catUnit}
                    onChange={(e) => setCatUnit(e.target.value as VehicleUnitType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="KM">Kilomètres (KM)</option>
                    <option value="HEURES">Heures (h)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Norme Conso Réf ({catUnit === 'HEURES' ? 'L/h' : 'L/100km'})</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={catTargetRate}
                    onChange={(e) => setCatTargetRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Couleur Badge</label>
                  <input
                    type="color"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    className="w-full h-9 p-1 border border-slate-300 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Description optionnelle"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl"
                >
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal Form */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingUserId ? 'Modifier Utilisateur' : 'Créer un Utilisateur'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom & Prénom *</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  placeholder="ex: Karim Ouarad"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  placeholder="karim@gascons.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rôle d Accès *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-xs"
                  >
                    {isSuperAdmin && (
                      <option value="SUPER_ADMIN">👑 SUPER_ADMIN (Master OuaradTech)</option>
                    )}
                    <option value="SOUS_ADMIN">⭐ SOUS_ADMIN (Client Vente & Quota)</option>
                    <option value="ADMIN">ADMIN (Accès Total Entreprise)</option>
                    <option value="GESTIONNAIRE">GESTIONNAIRE (Stock & BL)</option>
                    <option value="POMPISTE">POMPISTE (Saisie Sorties)</option>
                    <option value="SUPERVISEUR">SUPERVISEUR (Consultation)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Département / Chantier</label>
                  <input
                    type="text"
                    value={userDept}
                    onChange={(e) => setUserDept(e.target.value)}
                    placeholder="ex: Exploitation / Direction"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Sous-Admin Licensing Configuration Block */}
              {userRole === 'SOUS_ADMIN' && (
                <div className="p-3.5 bg-gradient-to-br from-amber-50/70 via-slate-50 to-amber-50/30 rounded-xl border border-amber-200/90 space-y-3">
                  <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      Paramètres de Licence Client (Sous-Admin)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Société Cliente *</label>
                      <input
                        type="text"
                        value={userClientCompanyName}
                        onChange={(e) => setUserClientCompanyName(e.target.value)}
                        required={userRole === 'SOUS_ADMIN'}
                        placeholder="ex: Société BTP Sahara"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Formule de Licence</label>
                      <select
                        value={userLicenseType}
                        onChange={(e) => setUserLicenseType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                      >
                        <option value="STARTER">STARTER (10 véhicules max)</option>
                        <option value="BUSINESS">BUSINESS (30 véhicules max)</option>
                        <option value="ENTERPRISE">ENTERPRISE (100 véhicules max)</option>
                        <option value="SUR_MESURE">SUR MESURE (Illimité)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Quota Max Véhicules</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={userMaxVehicles}
                        onChange={(e) => setUserMaxVehicles(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Statut Initial Souscription</label>
                      <select
                        value={userSubscriptionStatus}
                        onChange={(e) => setUserSubscriptionStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                      >
                        <option value="ACTIF">✓ ACTIF (Accès Ouvert)</option>
                        <option value="SUSPENDU">⛔ SUSPENDU (Accès Coupé)</option>
                      </select>
                    </div>
                  </div>

                  {userSubscriptionStatus === 'SUSPENDU' && (
                    <div>
                      <label className="block font-semibold text-rose-700 mb-1">Motif de la coupure</label>
                      <input
                        type="text"
                        value={userSuspensionReason}
                        onChange={(e) => setUserSuspensionReason(e.target.value)}
                        placeholder="ex: Facture impayée du mois de mars..."
                        className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-xl text-rose-900"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Password Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mot de Passe {editingUserId ? '(Laisser vide pour ne pas modifier)' : '*'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    {showUserPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showUserPassword ? 'Masquer' : 'Afficher'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <input
                      type={showUserPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      required={!editingUserId}
                      placeholder={editingUserId ? 'Nouveau mot de passe...' : 'Mot de passe initial...'}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <input
                      type={showUserPassword ? 'text' : 'password'}
                      value={userPasswordConfirm}
                      onChange={(e) => setUserPasswordConfirm(e.target.value)}
                      required={!editingUserId || Boolean(userPassword)}
                      placeholder="Confirmer mot de passe..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  🔒 Seul un compte ADMIN a le droit de générer ou réinitialiser les identifiants d accès.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl"
                >
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  {editingUserId ? 'Mettre à jour' : 'Créer l Utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Suspend / Deactivate Sous-Admin Modal */}
      {isSuspendModalOpen && userToSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <PowerOff className="w-4 h-4" />
                <span>Désactiver le Sous-Admin Client</span>
              </div>
              <button
                onClick={() => {
                  setIsSuspendModalOpen(false);
                  setUserToSuspend(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
              <p className="font-bold">
                Êtes-vous sûr de vouloir couper l accès pour {userToSuspend.name} ?
              </p>
              <p className="text-[11px] text-rose-700">
                Société : <span className="font-semibold">{userToSuspend.clientCompanyName || userToSuspend.name}</span> ({userToSuspend.email})
              </p>
              <p className="text-[10px] text-rose-600 mt-1">
                Une fois désactivé, le sous-admin et ses opérateurs ne pourront plus saisir de sorties ni accéder au stock.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Motif de la suspension (Visible dans l interface) *
              </label>
              <input
                type="text"
                value={suspendReasonInput}
                onChange={(e) => setSuspendReasonInput(e.target.value)}
                placeholder="ex: Facture impayée, Période d essai terminée..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsSuspendModalOpen(false);
                  setUserToSuspend(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                Confirmer la Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dept Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingDeptId ? 'Modifier Département' : 'Nouveau Département'}
              </h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSaveDept} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Code (ex: LOG, CH-NORD) *</label>
                <input
                  type="text"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du Département *</label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Responsable / Chef de Chantier</label>
                <input
                  type="text"
                  value={deptManager}
                  onChange={(e) => setDeptManager(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl"
                >
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingSupId ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}
              </h3>
              <button onClick={() => setIsSupModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSaveSup} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Raison Sociale / Nom *</label>
                <input
                  type="text"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  required
                  placeholder="ex: TotalEnergies"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prix Unitaire Moyen (€/L)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={supPrice}
                  onChange={(e) => setSupPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSupModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl"
                >
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Company Setup / Edit Modal */}
      <CompanySetupModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
      />

      {/* Supabase Setup / Configuration & Migration Modal */}
      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};
