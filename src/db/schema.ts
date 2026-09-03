import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// 1. Users Table (Authentication & Accounts)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or system ID
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().default('POMPISTE'), // ADMIN, GESTIONNAIRE, SUPERVISEUR, POMPISTE
  department: text('department').notNull().default(''),
  active: boolean('active').notNull().default(true),
  avatar: text('avatar'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Company Profile Table
export const companyProfiles = pgTable('company_profiles', {
  id: serial('id').primaryKey(),
  isConfigured: boolean('is_configured').notNull().default(false),
  name: text('name').notNull().default(''),
  legalStatus: text('legal_status'),
  taxId: text('tax_id'),
  activity: text('activity'),
  logoUrl: text('logo_url'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  currency: text('currency').default('DZD'),
  headerTagline: text('header_tagline'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Stock Configuration Table
export const stockConfigs = pgTable('stock_configs', {
  id: serial('id').primaryKey(),
  initialStock: doublePrecision('initial_stock').notNull().default(0),
  initialStockDate: text('initial_stock_date').notNull().default(''),
  tankCapacity: doublePrecision('tank_capacity').notNull().default(20000),
  alertThreshold: doublePrecision('alert_threshold').notNull().default(3000),
  criticalThreshold: doublePrecision('critical_threshold').notNull().default(1500),
  tankName: text('tank_name').notNull().default('Cuve Principale'),
  location: text('location').notNull().default('Dépôt Central'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Vehicle Categories Table
export const vehicleCategories = pgTable('vehicle_categories', {
  id: text('id').primaryKey(), // custom string ID e.g. "cat-1"
  name: text('name').notNull(),
  unitType: text('unit_type').notNull().default('KM'), // KM or HEURES
  defaultTargetRate: doublePrecision('default_target_rate').notNull().default(30),
  description: text('description'),
  color: text('color').notNull().default('#3b82f6'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Departments Table
export const departments = pgTable('departments', {
  id: text('id').primaryKey(), // custom string ID e.g. "dept-1"
  name: text('name').notNull(),
  manager: text('manager').notNull().default(''),
  code: text('code').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Vehicles Table
export const vehicles = pgTable('vehicles', {
  id: text('id').primaryKey(), // custom string ID e.g. "v-1"
  code: text('code').notNull(),
  plateNumber: text('plate_number').notNull(),
  name: text('name').notNull(),
  categoryId: text('category_id').references(() => vehicleCategories.id),
  departmentId: text('department_id').references(() => departments.id),
  tankCapacity: doublePrecision('tank_capacity').notNull().default(200),
  currentReading: doublePrecision('current_reading').notNull().default(0),
  unitType: text('unit_type').notNull().default('KM'),
  assignedDriver: text('assigned_driver'),
  status: text('status').notNull().default('ACTIF'), // ACTIF, EN_MAINTENANCE, HORS_SERVICE
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Suppliers Table
export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey(), // custom string ID e.g. "sup-1"
  name: text('name').notNull(),
  contactName: text('contact_name').notNull().default(''),
  phone: text('phone').notNull().default(''),
  email: text('email'),
  address: text('address'),
  pricePerLiter: doublePrecision('price_per_liter').notNull().default(30),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Fuel Exits (Distributions) Table
export const fuelExits = pgTable('fuel_exits', {
  id: text('id').primaryKey(),
  ticketNumber: text('ticket_number').notNull().unique(),
  date: text('date').notNull(), // YYYY-MM-DD
  time: text('time').notNull().default('12:00'),
  vehicleId: text('vehicle_id').references(() => vehicles.id),
  categoryId: text('category_id'),
  departmentId: text('department_id'),
  quantityLiters: doublePrecision('quantity_liters').notNull(),
  previousReading: doublePrecision('previous_reading').notNull().default(0),
  currentReading: doublePrecision('current_reading').notNull().default(0),
  distanceOrHours: doublePrecision('distance_or_hours').notNull().default(0),
  calculatedConsumption: doublePrecision('calculated_consumption').notNull().default(0),
  requesterName: text('requester_name').notNull().default(''),
  pumpOperatorName: text('pump_operator_name').notNull().default(''),
  signatureDataUrl: text('signature_data_url'),
  purpose: text('purpose'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Fuel Deliveries (Receptions) Table
export const fuelDeliveries = pgTable('fuel_deliveries', {
  id: text('id').primaryKey(),
  deliveryNumber: text('delivery_number').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  time: text('time').notNull().default('12:00'),
  supplierId: text('supplier_id').references(() => suppliers.id),
  quantityLiters: doublePrecision('quantity_liters').notNull(),
  unitPrice: doublePrecision('unit_price').notNull().default(0),
  totalCost: doublePrecision('total_cost').notNull().default(0),
  tankName: text('tank_name').notNull().default('Cuve Principale'),
  driverName: text('driver_name'),
  truckPlate: text('truck_plate'),
  receiverName: text('receiver_name').notNull().default(''),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. Stock Adjustments Table
export const stockAdjustments = pgTable('stock_adjustments', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  previousStock: doublePrecision('previous_stock').notNull(),
  newStock: doublePrecision('new_stock').notNull(),
  difference: doublePrecision('difference').notNull(),
  reason: text('reason').notNull().default(''),
  adjustedBy: text('adjusted_by').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  category: one(vehicleCategories, {
    fields: [vehicles.categoryId],
    references: [vehicleCategories.id],
  }),
  department: one(departments, {
    fields: [vehicles.departmentId],
    references: [departments.id],
  }),
  exits: many(fuelExits),
}));

export const fuelExitsRelations = relations(fuelExits, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [fuelExits.vehicleId],
    references: [vehicles.id],
  }),
}));

export const fuelDeliveriesRelations = relations(fuelDeliveries, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [fuelDeliveries.supplierId],
    references: [suppliers.id],
  }),
}));
