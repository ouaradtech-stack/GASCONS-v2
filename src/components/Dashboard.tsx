import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Droplet,
  Fuel,
  Gauge,
  Info,
  Layers,
  MapPin,
  PieChart as PieIcon,
  Plus,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGascons } from '../context/GasconsContext';
import { FuelExit } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onSelectVoucher: (exit: FuelExit) => void;
}

// Department harmonious color palette
const DEPT_COLORS = [
  '#2563EB', // Royal Blue
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#64748B', // Slate
];

// Helper: Calculate ISO week info from date "YYYY-MM-DD"
function getWeekInfo(dateStr: string) {
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return { key: 'Inconnu', label: 'Inconnu', start: '', end: '', weekNum: 0, year: 2026 };
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  if (isNaN(d.getTime())) {
    return { key: 'Inconnu', label: 'Inconnu', start: '', end: '', weekNum: 0, year: 2026 };
  }

  // Find Monday of the week
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diffToMonday);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

  // ISO Week calculation
  const target = new Date(monday.valueOf());
  const dayNr = (monday.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

  const startFormatted = `${String(monday.getDate()).padStart(2, '0')}/${String(monday.getMonth() + 1).padStart(2, '0')}`;
  const endFormatted = `${String(sunday.getDate()).padStart(2, '0')}/${String(sunday.getMonth() + 1).padStart(2, '0')}`;

  const key = `${monday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  const label = `Sem. ${weekNum}`;
  const fullLabel = `Semaine ${weekNum} (${startFormatted} - ${endFormatted})`;

  return {
    key,
    label,
    fullLabel,
    start: startFormatted,
    end: endFormatted,
    weekNum,
    year: monday.getFullYear(),
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectVoucher }) => {
  const {
    stockConfig,
    currentStockLiters,
    stockPercentage,
    isLowStock,
    isCriticalStock,
    totalDeliveriesLiters,
    totalExitsLiters,
    fuelExits,
    fuelDeliveries,
    categories,
    vehicles,
    departments,
    getVehicleById,
    getCategoryById,
    getDepartmentById,
  } = useGascons();

  const [hoveredDeptIndex, setHoveredDeptIndex] = useState<number | null>(null);

  // 1. Weekly Consumption Evolution Data (Linear Chart)
  const weeklyConsumptionData = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        label: string;
        fullLabel: string;
        start: string;
        end: string;
        liters: number;
        exitsCount: number;
        vehiclesSet: Set<string>;
      }
    >();

    fuelExits.forEach((exit) => {
      const info = getWeekInfo(exit.date);
      const existing = map.get(info.key) || {
        key: info.key,
        label: info.label,
        fullLabel: info.fullLabel,
        start: info.start,
        end: info.end,
        liters: 0,
        exitsCount: 0,
        vehiclesSet: new Set<string>(),
      };

      existing.liters += exit.quantityLiters;
      existing.exitsCount += 1;
      existing.vehiclesSet.add(exit.vehicleId);
      map.set(info.key, existing);
    });

    const sorted = Array.from(map.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((item) => ({
        key: item.key,
        name: item.label,
        fullLabel: item.fullLabel,
        periode: `${item.start} - ${item.end}`,
        liters: item.liters,
        sorties: item.exitsCount,
        vehiculesDistincts: item.vehiclesSet.size,
        avgPerExit: item.exitsCount > 0 ? Math.round(item.liters / item.exitsCount) : 0,
      }));

    return sorted;
  }, [fuelExits]);

  // Summary metrics for weekly consumption
  const weeklyStats = useMemo(() => {
    if (weeklyConsumptionData.length === 0) {
      return { totalWeeks: 0, avgWeeklyLiters: 0, lastWeekLiters: 0, maxWeeklyLiters: 0 };
    }
    const totalWeeks = weeklyConsumptionData.length;
    const totalLiters = weeklyConsumptionData.reduce((sum, w) => sum + w.liters, 0);
    const avgWeeklyLiters = Math.round(totalLiters / totalWeeks);
    const lastWeekLiters = weeklyConsumptionData[weeklyConsumptionData.length - 1]?.liters || 0;
    const prevWeekLiters =
      weeklyConsumptionData.length > 1 ? weeklyConsumptionData[weeklyConsumptionData.length - 2]?.liters : lastWeekLiters;
    const maxWeeklyLiters = Math.max(...weeklyConsumptionData.map((w) => w.liters));
    const growthRate = prevWeekLiters > 0 ? (((lastWeekLiters - prevWeekLiters) / prevWeekLiters) * 100).toFixed(1) : '0';

    return {
      totalWeeks,
      avgWeeklyLiters,
      lastWeekLiters,
      prevWeekLiters,
      maxWeeklyLiters,
      growthRate: Number(growthRate),
    };
  }, [weeklyConsumptionData]);

  // 2. Department Breakdown Data (PieChart / Secteurs)
  const departmentPieData = useMemo(() => {
    const totalLitersAll = totalExitsLiters > 0 ? totalExitsLiters : 1;

    return departments
      .map((dept, index) => {
        const deptExits = fuelExits.filter((e) => e.departmentId === dept.id);
        const totalLiters = deptExits.reduce((sum, e) => sum + e.quantityLiters, 0);
        const percentage = ((totalLiters / totalLitersAll) * 100);

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          manager: dept.manager,
          liters: totalLiters,
          count: deptExits.length,
          percentage: Number(percentage.toFixed(1)),
          color: DEPT_COLORS[index % DEPT_COLORS.length],
        };
      })
      .filter((d) => d.liters > 0)
      .sort((a, b) => b.liters - a.liters);
  }, [departments, fuelExits, totalExitsLiters]);

  // 3. Category Breakdown Data
  const categoryData = useMemo(() => {
    const totalLitersAll = totalExitsLiters > 0 ? totalExitsLiters : 1;
    return categories
      .map((cat) => {
        const catExits = fuelExits.filter((e) => e.categoryId === cat.id);
        const totalLiters = catExits.reduce((sum, e) => sum + e.quantityLiters, 0);
        const percentage = ((totalLiters / totalLitersAll) * 100);
        return {
          id: cat.id,
          name: cat.name,
          value: totalLiters,
          color: cat.color,
          count: catExits.length,
          percentage: Number(percentage.toFixed(1)),
        };
      })
      .filter((c) => c.value > 0);
  }, [categories, fuelExits, totalExitsLiters]);

  // 4. Top Consuming Vehicles
  const topVehicles = useMemo(() => {
    const map = new Map<string, { liters: number; exitsCount: number }>();
    fuelExits.forEach((e) => {
      const existing = map.get(e.vehicleId) || { liters: 0, exitsCount: 0 };
      map.set(e.vehicleId, {
        liters: existing.liters + e.quantityLiters,
        exitsCount: existing.exitsCount + 1,
      });
    });

    return Array.from(map.entries())
      .map(([vId, stats]) => {
        const vehicle = getVehicleById(vId);
        const category = vehicle ? getCategoryById(vehicle.categoryId) : undefined;
        return {
          vehicleId: vId,
          vehicle,
          category,
          liters: stats.liters,
          exitsCount: stats.exitsCount,
        };
      })
      .sort((a, b) => b.liters - a.liters)
      .slice(0, 5);
  }, [fuelExits, getVehicleById, getCategoryById]);

  // Recent 5 fuel exits
  const recentExits = fuelExits.slice(0, 5);

  return (
    <div className="space-y-6" id="dashboard-main-view">
      {/* Alert Banner if stock low */}
      {isCriticalStock ? (
        <div id="banner-critical-stock" className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <p className="font-bold text-sm">NIVEAU CRITIQUE DE LA CUVE ({currentStockLiters.toLocaleString('fr-FR')} L)</p>
              <p className="text-xs text-red-700">Le seuil critique d urgence est atteint ({stockConfig.criticalThreshold} L). Commandez immédiatement une livraison.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('livraisons')}
            id="dash-critical-order-btn"
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Commander / Réceptionner
          </button>
        </div>
      ) : isLowStock ? (
        <div id="banner-low-stock" className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-bold text-xs">Alerte Stock Bas ({currentStockLiters.toLocaleString('fr-FR')} L)</p>
              <p className="text-xs text-amber-700">Capacité restante sous le seuil d alerte ({stockConfig.alertThreshold} L).</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('livraisons')}
            id="dash-low-order-btn"
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Réceptionner Livraison
          </button>
        </div>
      ) : null}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cuve Stock Actuel */}
        <div id="kpi-card-stock" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Stock Cuve Actuel</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Gauge className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {currentStockLiters.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-slate-500">Litres</span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCriticalStock ? 'bg-red-600' : isLowStock ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, stockPercentage))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>{stockPercentage}% de la capacité</span>
              <span>Max {stockConfig.tankCapacity.toLocaleString('fr-FR')} L</span>
            </div>
          </div>
        </div>

        {/* Card 2: Consommation Totale */}
        <div id="kpi-card-exits" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Consommation Totale</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Fuel className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {totalExitsLiters.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-slate-500">Litres</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>{fuelExits.length} distributions</span>
            <button
              onClick={() => onNavigate('sorties')}
              className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] flex items-center gap-0.5 cursor-pointer"
            >
              Historique →
            </button>
          </div>
        </div>

        {/* Card 3: Livraisons Reçues */}
        <div id="kpi-card-deliveries" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Livraisons Fournisseurs</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-950 font-mono tracking-tight">
              +{totalDeliveriesLiters.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-slate-500">Litres</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>{fuelDeliveries.length} réceptions BL</span>
            <button
              onClick={() => onNavigate('livraisons')}
              className="text-emerald-600 hover:text-emerald-800 font-semibold text-[11px] flex items-center gap-0.5 cursor-pointer"
            >
              Fournisseurs →
            </button>
          </div>
        </div>

        {/* Card 4: Parc Véhicules Actifs */}
        <div id="kpi-card-vehicles" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Parc Ravitallé</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-950 font-mono tracking-tight">
              {vehicles.length}
            </span>
            <span className="text-xs font-bold text-slate-500">engins & véhicules</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>{categories.length} catégories</span>
            <button
              onClick={() => onNavigate('base-donnees')}
              className="text-purple-600 hover:text-purple-800 font-semibold text-[11px] flex items-center gap-0.5 cursor-pointer"
            >
              Gérer le parc →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Strip */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-black text-base flex items-center justify-center md:justify-start gap-2">
            <Fuel className="w-5 h-5 text-amber-400" />
            Opérations Rapides de Carburant
          </h3>
          <p className="text-xs text-blue-200">
            Enregistrez une distribution de gasoil avec signature du demandeur ou réceptionnez un bon de livraison.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('nouvelle-sortie')}
            id="dash-quick-exit-btn"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Saisir Sortie Gasoil
          </button>
          <button
            onClick={() => onNavigate('livraisons')}
            id="dash-quick-delivery-btn"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            Réceptionner Livraison
          </button>
          <button
            onClick={() => onNavigate('rapports')}
            id="dash-quick-reports-btn"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Exporter Données
          </button>
        </div>
      </div>

      {/* SECTION 1: GRAPHIQUE LINÉAIRE - Consommation de gasoil par semaine */}
      <div id="section-chart-weekly-linear" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Évolution de la Consommation de Gasoil par Semaine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Graphique linéaire du volume total distribué (en litres) semaine par semaine
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2">
              <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Moyenne Hebdo</span>
              <span className="font-mono font-bold text-xs text-blue-900">
                {weeklyStats.avgWeeklyLiters.toLocaleString('fr-FR')} L
              </span>
            </div>
            {weeklyStats.totalWeeks > 1 && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-medium">Tendance:</span>
                <span
                  className={`font-mono font-bold text-xs flex items-center gap-0.5 ${
                    weeklyStats.growthRate > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {weeklyStats.growthRate > 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {weeklyStats.growthRate > 0 ? `+${weeklyStats.growthRate}%` : `${weeklyStats.growthRate}%`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Linear Chart Container */}
        <div className="h-72 w-full pt-2">
          {weeklyConsumptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyConsumptionData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorWeeklyLiters" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val.toLocaleString('fr-FR')} L`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5">
                          <p className="font-bold text-blue-300">{data.fullLabel}</p>
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 font-mono">
                            <span className="text-slate-300">Volume Total:</span>
                            <span className="font-bold text-amber-400 text-sm">
                              {data.liters.toLocaleString('fr-FR')} Litres
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
                            <span>Distributions:</span>
                            <span className="font-semibold text-slate-200">{data.sorties} pleins</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
                            <span>Engins servis:</span>
                            <span className="font-semibold text-slate-200">{data.vehiculesDistincts} véhicules</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
                            <span>Moyenne par plein:</span>
                            <span className="font-semibold text-slate-200">{data.avgPerExit} L / plein</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="liters"
                  name="Gasoil Consommé"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorWeeklyLiters)"
                  activeDot={{ r: 6, stroke: '#1d4ed8', strokeWidth: 2, fill: '#ffffff' }}
                  dot={{ r: 4, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Aucune distribution enregistrée pour générer le graphique hebdomadaire.
            </div>
          )}
        </div>

        {/* Weekly Footnote / breakdown summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Données agrégées sur <strong>{weeklyStats.totalWeeks} semaines</strong> d exploitation
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Volume hebdomadaire en Litres
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: CHARTS GRID - GRAPHIQUE EN SECTEURS (Par Département) & CATÉGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: GRAPHIQUE EN SECTEURS - Répartition par Département (7 cols) */}
        <div id="section-chart-department-pie" className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                Répartition de la Consommation par Département
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                Graphique en Secteurs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ventilation du volume total de gasoil ({totalExitsLiters.toLocaleString('fr-FR')} L) par centre de coût & chantier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-3">
            {/* Pie Chart */}
            <div className="md:col-span-6 h-64 flex items-center justify-center relative">
              {departmentPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="liters"
                      nameKey="name"
                      onMouseEnter={(_, index) => setHoveredDeptIndex(index)}
                      onMouseLeave={() => setHoveredDeptIndex(null)}
                    >
                      {departmentPieData.map((entry, index) => (
                        <Cell
                          key={`dept-cell-${index}`}
                          fill={entry.color}
                          stroke="#ffffff"
                          strokeWidth={hoveredDeptIndex === index ? 3 : 1}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: hoveredDeptIndex === index ? 'scale(1.04)' : 'scale(1)',
                            transformOrigin: 'center center',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
                              <p className="font-bold text-indigo-300">{data.name}</p>
                              <div className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="text-slate-400">Code:</span>
                                <span className="font-mono font-semibold text-slate-200">{data.code}</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 font-mono">
                                <span className="text-slate-400">Volume:</span>
                                <span className="font-bold text-amber-400">{data.liters.toLocaleString('fr-FR')} L</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="text-slate-400">Part:</span>
                                <span className="font-bold text-emerald-400">{data.percentage}%</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="text-slate-400">Distributions:</span>
                                <span className="text-slate-200">{data.count} pleins</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400">Aucune consommation enregistrée</p>
              )}

              {/* Center Donut Label */}
              {departmentPieData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                  <span className="text-xs font-mono font-black text-slate-800">
                    {totalExitsLiters.toLocaleString('fr-FR')} L
                  </span>
                </div>
              )}
            </div>

            {/* Department Breakdown Legend Cards */}
            <div className="md:col-span-6 space-y-2 max-h-64 overflow-y-auto pr-1">
              {departmentPieData.length > 0 ? (
                departmentPieData.map((dept, idx) => (
                  <div
                    key={dept.id}
                    onMouseEnter={() => setHoveredDeptIndex(idx)}
                    onMouseLeave={() => setHoveredDeptIndex(null)}
                    className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                      hoveredDeptIndex === idx
                        ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                        style={{ backgroundColor: dept.color }}
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{dept.name}</p>
                        <p className="text-[10px] text-slate-400">{dept.count} pleins • Resp: {dept.manager}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="font-mono font-black text-slate-900 block text-xs">
                        {dept.liters.toLocaleString('fr-FR')} L
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                        {dept.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">Aucun département avec des sorties.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
            <span>{departmentPieData.length} départements consommateurs actifs</span>
            <button
              onClick={() => onNavigate('rapports')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer text-[11px]"
            >
              Exporter par département →
            </button>
          </div>
        </div>

        {/* Chart 2: Répartition par Catégorie de Véhicule (5 cols) */}
        <div id="section-chart-category-pie" className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Consommation par Catégorie
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Répartition par type d engin et véhicule
            </p>
          </div>

          <div className="h-56 my-2 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cat-cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${Number(value).toLocaleString('fr-FR')} Litres`, 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Aucune donnée disponible</p>
            )}
          </div>

          {/* Custom Category Legend */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            {categoryData.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-700 font-medium">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold">{c.percentage}%</span>
                  <span className="font-mono font-bold text-slate-900">
                    {c.value.toLocaleString('fr-FR')} L
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 Most Consuming Vehicles & Recent Exits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Vehicles (6 cols) */}
        <div id="section-top-vehicles" className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Top Véhicules & Engins Consommateurs
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">Cumul Litres</span>
          </div>

          <div className="space-y-3 text-xs">
            {topVehicles.length === 0 ? (
              <p className="text-slate-400 py-6 text-center">Aucune donnée de distribution.</p>
            ) : (
              topVehicles.map((item, idx) => (
                <div
                  key={item.vehicleId}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">
                        {item.vehicle?.name || item.vehicleId}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200">
                          {item.vehicle?.plateNumber}
                        </span>
                        <span>• {item.exitsCount} pleins</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-blue-900 block">
                      {item.liters.toLocaleString('fr-FR')} L
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Compteur: {item.vehicle?.currentReading.toLocaleString('fr-FR')} {item.vehicle?.unitType === 'HEURES' ? 'h' : 'km'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Fuel Exits (6 cols) */}
        <div id="section-recent-exits" className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Dernières Sorties Enregistrées
            </h3>
            <button
              onClick={() => onNavigate('sorties')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Tout voir ({fuelExits.length})
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {recentExits.length === 0 ? (
              <p className="text-slate-400 py-6 text-center">Aucune sortie pour le moment.</p>
            ) : (
              recentExits.map((exit) => {
                const vehicle = getVehicleById(exit.vehicleId);
                return (
                  <div
                    key={exit.id}
                    onClick={() => onSelectVoucher(exit)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-900">{exit.ticketNumber}</span>
                        <span className="text-[11px] text-slate-400">• {exit.date}</span>
                      </div>
                      <p className="font-semibold text-slate-800">
                        {vehicle?.name || exit.vehicleId} ({vehicle?.plateNumber})
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Demandeur: <span className="font-medium text-slate-700">{exit.requesterName}</span>
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="font-mono font-black text-sm bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-300 block">
                        {exit.quantityLiters.toLocaleString('fr-FR')} L
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold">
                        Voir bon →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
