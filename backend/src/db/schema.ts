import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  decimal,
  integer,
  date,
  unique,
  index,
  numeric,
} from 'drizzle-orm/pg-core';

// Users table with support for 4 user types
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userType: text('user_type').notNull(), // 'producer', 'regulator', 'service_provider', 'buyer'
    email: text('email'),
    phone: text('phone'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    dateOfBirth: date('date_of_birth'),
    idNumber: text('id_number'), // encrypted
    farmerId: text('farmer_id'), // 10-digit code: XXX##-##-###
    county: text('county').notNull(),
    subCounty: text('sub_county').notNull(),
    ward: text('ward').notNull(),
    addressLat: decimal('address_lat', { precision: 10, scale: 8 }),
    addressLng: decimal('address_lng', { precision: 11, scale: 8 }),
    farmAcreage: decimal('farm_acreage', { precision: 8, scale: 2 }),
    cropType: text('crop_type'),
    organizationName: text('organization_name'),
    coreMandate: text('core_mandate'), // 'compliance', 'productivity_uplift', 'media_reporting', 'various'
    workIdFrontUrl: text('work_id_front_url'),
    workIdBackUrl: text('work_id_back_url'),
    registrationCompleted: boolean('registration_completed').default(false),
    // Service provider fields
    coreMandates: text('core_mandates').array(),
    // Buyer fields
    mainOfficeAddress: text('main_office_address'),
    officeState: text('office_state'),
    officeCity: text('office_city'),
    officeZipCode: text('office_zip_code'),
    deliveryAirport: text('delivery_airport'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('idx_users_email').on(table.email),
    phoneIdx: index('idx_users_phone').on(table.phone),
    farmerIdIdx: unique('uq_users_farmer_id').on(table.farmerId),
    userTypeIdx: index('idx_users_user_type').on(table.userType),
    countyIdx: index('idx_users_county').on(table.county),
  })
);

// Producer reports table
export const producerReports = pgTable(
  'producer_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    producerId: uuid('producer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    reportType: text('report_type').notNull(), // 'planting', 'tending', 'harvesting', 'shipping'
    weekNumber: integer('week_number').notNull(),
    year: integer('year').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    producerIdIdx: index('idx_producer_reports_producer_id').on(table.producerId),
  })
);

// Regulator visits table
export const regulatorVisits = pgTable(
  'regulator_visits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    regulatorId: uuid('regulator_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    producerId: uuid('producer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    visitDate: timestamp('visit_date').notNull(),
    visitLat: decimal('visit_lat', { precision: 10, scale: 8 }).notNull(),
    visitLng: decimal('visit_lng', { precision: 11, scale: 8 }).notNull(),
    comments: text('comments'),
    spacingCompliant: boolean('spacing_compliant'),
    standardsAdherenceNotes: text('standards_adherence_notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    regulatorIdIdx: index('idx_regulator_visits_regulator_id').on(table.regulatorId),
    producerIdIdx: index('idx_regulator_visits_producer_id').on(table.producerId),
  })
);

// Visit photos table
export const visitPhotos = pgTable(
  'visit_photos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    visitId: uuid('visit_id')
      .notNull()
      .references(() => regulatorVisits.id, { onDelete: 'cascade' }),
    photoUrl: text('photo_url').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    visitIdIdx: index('idx_visit_photos_visit_id').on(table.visitId),
  })
);

// Buyer orders table
export const buyerOrders = pgTable(
  'buyer_orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    buyerId: uuid('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cropType: text('crop_type').notNull(),
    quantityKg: decimal('quantity_kg', { precision: 12, scale: 2 }).notNull(),
    deliveryDate: date('delivery_date').notNull(),
    status: text('status').default('pending'), // 'pending', 'confirmed', 'delivered', 'cancelled'
    estimatedInvoiceAmount: numeric('estimated_invoice_amount', { precision: 12, scale: 2 }),
    farmerPayment: numeric('farmer_payment', { precision: 12, scale: 2 }), // 40%
    serviceProviderPayment: numeric('service_provider_payment', { precision: 12, scale: 2 }), // 40%
    gokPayment: numeric('gok_payment', { precision: 12, scale: 2 }), // 20%
    deliveryAirport: text('delivery_airport'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    buyerIdIdx: index('idx_buyer_orders_buyer_id').on(table.buyerId),
    statusIdx: index('idx_buyer_orders_status').on(table.status),
  })
);

// Service provider visits table
export const serviceProviderVisits = pgTable(
  'service_provider_visits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    serviceProviderId: uuid('service_provider_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    producerId: uuid('producer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    visitDate: timestamp('visit_date').notNull(),
    visitLat: numeric('visit_lat', { precision: 10, scale: 8 }).notNull(),
    visitLng: numeric('visit_lng', { precision: 11, scale: 8 }).notNull(),
    collectionEstimationWeek: integer('collection_estimation_week'),
    collectedCropType: text('collected_crop_type'),
    collectedVolumeKg: numeric('collected_volume_kg', { precision: 12, scale: 2 }),
    shippedCropType: text('shipped_crop_type'),
    shippedVolumeKg: numeric('shipped_volume_kg', { precision: 12, scale: 2 }),
    comments: text('comments'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    serviceProviderIdIdx: index('idx_sp_visits_sp_id').on(table.serviceProviderId),
    producerIdIdx: index('idx_sp_visits_producer_id').on(table.producerId),
  })
);

// Service provider visit photos table
export const serviceProviderVisitPhotos = pgTable(
  'service_provider_visit_photos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    visitId: uuid('visit_id')
      .notNull()
      .references(() => serviceProviderVisits.id, { onDelete: 'cascade' }),
    photoUrl: text('photo_url').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    visitIdIdx: index('idx_sp_visit_photos_visit_id').on(table.visitId),
  })
);

// Kenya locations reference data
export const kenyaLocations = pgTable(
  'kenya_locations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    countyName: text('county_name').notNull(),
    countyCode: text('county_code').notNull(), // e.g., 'MSA', 'NKU'
    countyNumber: text('county_number').notNull(), // e.g., '01', '32'
    subCounty: text('sub_county').notNull(),
    wardName: text('ward_name').notNull(),
    wardNumber: text('ward_number').notNull(), // e.g., '01', '13'
  },
  (table) => ({
    countyCodeIdx: index('idx_locations_county_code').on(table.countyCode),
    countyNameIdx: index('idx_locations_county_name').on(table.countyName),
  })
);

// US states reference data
export const usStates = pgTable(
  'us_states',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stateName: text('state_name').notNull(),
    stateCode: text('state_code').notNull(), // 2-letter abbreviation like 'CA', 'NY'
  },
  (table) => ({
    stateCodeIdx: index('idx_us_states_code').on(table.stateCode),
  })
);

// US cities reference data
export const usCities = pgTable(
  'us_cities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stateCode: text('state_code').notNull(),
    cityName: text('city_name').notNull(),
  },
  (table) => ({
    stateCodeIdx: index('idx_us_cities_state_code').on(table.stateCode),
    cityNameIdx: index('idx_us_cities_city_name').on(table.cityName),
  })
);

// US zip codes reference data
export const usZipCodes = pgTable(
  'us_zip_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cityName: text('city_name').notNull(),
    stateCode: text('state_code').notNull(),
    zipCode: text('zip_code').notNull(),
  },
  (table) => ({
    cityNameIdx: index('idx_us_zip_codes_city_name').on(table.cityName),
    stateCodeIdx: index('idx_us_zip_codes_state_code').on(table.stateCode),
    zipCodeIdx: index('idx_us_zip_codes_zip_code').on(table.zipCode),
  })
);

// US airports reference data
export const usAirports = pgTable(
  'us_airports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    airportName: text('airport_name').notNull(),
    airportCode: text('airport_code').notNull(), // 3-letter IATA code
    city: text('city'),
    stateCode: text('state_code'),
  },
  (table) => ({
    airportCodeIdx: index('idx_us_airports_code').on(table.airportCode),
    stateCodeIdx: index('idx_us_airports_state_code').on(table.stateCode),
  })
);
