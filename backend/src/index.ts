import { createApplication } from "@specific-dev/framework";
import * as schema from './db/schema.js';
import { registerUserRoutes } from './routes/users.js';
import { registerLocationRoutes } from './routes/locations.js';
import { registerProducerReportRoutes } from './routes/producer-reports.js';
import { registerRegulatorVisitRoutes } from './routes/regulator-visits.js';
import { registerBuyerOrderRoutes } from './routes/buyer-orders.js';
import { registerUploadRoutes } from './routes/upload.js';
import { registerSeedRoutes } from './routes/seed.js';

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

await app.run();
app.logger.info('Agricultural supply chain application started');
