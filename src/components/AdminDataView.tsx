import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  Building2,
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
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  Truck,
  Upload,
  UserCheck,
  Users,
  X,
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
import { WindowsExeModal } from './WindowsExeModal';

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
    canManageUsers,
    setCurrentUser,
    exportDatabaseJSON,
    importDatabase,
    resetToDefaults,
    firebaseStatus,
    firebaseAuthUser,
    signInWithGoogle,
  } = useGascons();

  const [activeTab, setActiveTab] = useState<'vehicles' | 'categories' | 'users' | 'departments' | 'suppliers' | 'company' | 'backup'>('vehicles');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isWindowsExeModalOpen, setIsWindowsExeModalOpen] = useState(false);

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

  // 3. User Modal with Password
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('POMPISTE');
  const [userDept, setUserDept] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPasswordConfirm, setUserPasswordConfirm] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);

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
  const handleOpenUserModal = (u?: User) => {
    setErrorMsg('');
    setShowUserPassword(false);
    if (u) {
      // If editing another user and not Admin
      if (!canManageUsers && currentUser.id !== u.id) {
        setErrorMsg('Action refusée: Seul un Administrateur peut modifier d autres utilisateurs.');
        return;
      }
      setEditingUserId(u.id);
      setUserName(u.name);
      setUserEmail(u.email);
      setUserRole(u.role);
      setUserDept(u.department);
      setUserPassword(u.password || '');
      setUserPasswordConfirm(u.password || '');
    } else {
      // Creating new user requires ADMIN role
      if (!canManageUsers) {
        setErrorMsg('Action refusée: Seul un Administrateur (ADMIN) a le droit de créer des utilisateurs.');
        return;
      }
      setEditingUserId(null);
      setUserName('');
      setUserEmail('');
      setUserRole('POMPISTE');
      setUserDept(departments[0]?.name || 'Exploitation');
      setUserPassword('');
      setUserPasswordConfirm('');
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

    const payload: Partial<User> & { name: string; email: string; role: UserRole; department: string; active: boolean } = {
      name: userName.trim(),
      email: userEmail.trim(),
      role: userRole,
      department: userDept.trim() || 'Exploitation',
      active: true,
      ...(userPassword ? { password: userPassword } : {}),
    };

    if (editingUserId) {
      const res = updateUser(editingUserId, payload);
      if (!res.success) {
        setErrorMsg(res.message || 'Erreur lors de la modification.');
        return;
      }
      setSuccessMsg('Utilisateur et mot de passe mis à jour avec succès !');
    } else {
      const res = addUser(payload as Omit<User, 'id'>);
      if (!res.success) {
        setErrorMsg(res.message || 'Erreur lors de la création de l utilisateur.');
        return;
      }
      setSuccessMsg(`Utilisateur ${payload.name} (${payload.role}) créé avec mot de passe !`);
    }

    setTimeout(() => setSuccessMsg(''), 4000);
    setIsUserModalOpen(false);
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
          {/* Admin Rights Info / Warning */}
          {!canManageUsers ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Accès Restreint : Seul l Administrateur (ADMIN) a le droit de créer ou modifier les utilisateurs</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Votre profil actuel est <span className="font-bold uppercase font-mono">{currentUser.role}</span>. Pour créer de nouveaux utilisateurs ou réinitialiser des mots de passe, veuillez vous connecter avec un compte Administrateur (ex: <span className="font-semibold">Ahmed Benali</span>).
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">
                  Droits Administrateur Actifs : Vous pouvez créer des utilisateurs, définir leurs mots de passe et leurs niveaux d accès.
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                ADMIN CONSOLE
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Comptes Utilisateurs & Mots de Passe
              </h3>
              <p className="text-xs text-slate-500">
                Gestion des accès sécurisés pour Pompistes, Gestionnaires de stock et Superviseurs de chantiers
              </p>
            </div>

            <button
              onClick={() => handleOpenUserModal()}
              disabled={!canManageUsers}
              title={!canManageUsers ? 'Seul un Administrateur peut créer des utilisateurs' : 'Créer un compte utilisateur avec mot de passe'}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                canManageUsers
                  ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              }`}
            >
              {canManageUsers ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Créer Utilisateur & Mot de Passe</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {users.map((u) => {
              const isCurrent = currentUser.id === u.id;
              const hasPassword = Boolean(u.password);
              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {u.avatar || u.name[0]}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : u.role === 'GESTIONNAIRE'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : u.role === 'SUPERVISEUR'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 truncate">{u.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{u.department}</p>

                  {/* Password & Security Badge */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Mot de passe :
                    </span>
                    <span className="font-mono font-semibold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {hasPassword ? '••••••••' : 'Non défini'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200 text-xs">
                    <button
                      onClick={() => setCurrentUser(u)}
                      disabled={isCurrent}
                      className={`font-semibold text-[11px] ${
                        isCurrent ? 'text-emerald-700 font-bold' : 'text-blue-600 hover:underline'
                      }`}
                    >
                      {isCurrent ? '✓ Actif' : 'Se connecter'}
                    </button>

                    <div className="flex items-center gap-1">
                      {(canManageUsers || isCurrent) && (
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          title="Modifier utilisateur & mot de passe"
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canManageUsers && users.length > 1 && !isCurrent && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer l utilisateur ${u.name} ?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          title="Supprimer l utilisateur"
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
            <h3 className="font-bold text-sm text-slate-900">Sauvegarde, Cloud Firebase & Export Windows (.EXE)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Synchronisation Cloud temps réel, export JSON, restauration et compilation pour exécutable Windows (.EXE)
            </p>
          </div>

          {/* Firebase Cloud Firestore Status Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950 via-slate-900 to-sky-950 text-white border border-sky-800/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-sky-500/30">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/30 text-sky-200 border border-sky-400/20">
                    Google Cloud Firebase
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Synchronisé en Direct
                  </span>
                </div>
                <h4 className="text-sm font-black text-white mt-1">
                  Base de Données Firestore Cloud Activée
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Projet : <span className="font-mono text-sky-300">credible-drake-hlcf1</span> • Région : <span className="font-mono text-sky-300">europe-west3</span> • Sauvegarde multi-appareils & collaborative
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {firebaseAuthUser ? (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Compte Google</span>
                  <span className="text-xs font-bold text-emerald-400">{firebaseAuthUser.email}</span>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle().catch(console.warn)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              )}
            </div>
          </div>

          {/* Windows Desktop Packaging Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/30">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/20">
                    Application Desktop
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/20">
                    Windows 10 / 11 (.EXE)
                  </span>
                </div>
                <h4 className="text-sm font-black text-white mt-1">
                  Générer l Installeur Windows (.EXE) pour PC & Chantiers
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Fonctionnement 100% Hors-Ligne, raccourci bureau, démarrage instantané et impression directe des tickets
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsWindowsExeModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all shrink-0"
            >
              <Package className="w-4 h-4" />
              <span>Convertir en .EXE Windows</span>
            </button>
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="ADMIN">ADMIN (Accès Total)</option>
                    <option value="GESTIONNAIRE">GESTIONNAIRE (Stock & BL)</option>
                    <option value="POMPISTE">POMPISTE (Saisie Sorties)</option>
                    <option value="SUPERVISEUR">SUPERVISEUR (Consultation)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Département</label>
                  <input
                    type="text"
                    value={userDept}
                    onChange={(e) => setUserDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

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
      {/* Windows EXE Packaging Guide Modal */}
      <WindowsExeModal
        isOpen={isWindowsExeModalOpen}
        onClose={() => setIsWindowsExeModalOpen(false)}
      />
    </div>
  );
};
