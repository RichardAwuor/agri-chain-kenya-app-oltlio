import { createApplication } from "@specific-dev/framework";
import * as schema from './db/schema.js';
import { registerUserRoutes } from './routes/users.js';
import { registerLocationRoutes } from './routes/locations.js';
import { registerProducerReportRoutes } from './routes/producer-reports.js';
import { registerRegulatorVisitRoutes } from './routes/regulator-visits.js';
import { registerBuyerOrderRoutes } from './routes/buyer-orders.js';
import { registerUploadRoutes } from './routes/upload.js';
import { registerSeedRoutes } from './routes/seed.js';
import { registerServiceProviderRoutes } from './routes/service-providers.js';
import { registerBuyerRoutes } from './routes/buyers.js';
import { registerDropdownDataRoutes } from './routes/dropdown-data.js';
import { registerRegulatorRoutes } from './routes/regulators.js';
import { registerUsLocationsRoutes } from './routes/us-locations.js';
import { registerServiceProviderReportsRoutes } from './routes/service-provider-reports.js';
import { registerUaeLocationsRoutes } from './routes/uae-locations.js';

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable storage for file uploads
app.withStorage();

// Register all route modules
registerUserRoutes(app);
registerLocationRoutes(app);
registerProducerReportRoutes(app);
registerRegulatorVisitRoutes(app);
registerBuyerOrderRoutes(app);
registerUploadRoutes(app);
registerSeedRoutes(app);
registerServiceProviderRoutes(app);
registerBuyerRoutes(app);
registerDropdownDataRoutes(app);
registerRegulatorRoutes(app);
registerUsLocationsRoutes(app);
registerUaeLocationsRoutes(app);
registerServiceProviderReportsRoutes(app);

await app.run();
app.logger.info('Agricultural supply chain application started');
