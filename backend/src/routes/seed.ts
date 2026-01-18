import type { FastifyRequest, FastifyReply } from 'fastify';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

const SEED_DATA = [
  // Mombasa County (MSA, 01)
  {
    countyName: 'Mombasa County',
    countyCode: 'MSA',
    countyNumber: '01',
    subCounty: 'Mombasa Sub-County',
    wardName: 'Kisauni Ward',
    wardNumber: '01',
  },
  {
    countyName: 'Mombasa County',
    countyCode: 'MSA',
    countyNumber: '01',
    subCounty: 'Mombasa Sub-County',
    wardName: 'Changamwe Ward',
    wardNumber: '02',
  },
  {
    countyName: 'Mombasa County',
    countyCode: 'MSA',
    countyNumber: '01',
    subCounty: 'Mombasa Sub-County',
    wardName: 'Jomvu Ward',
    wardNumber: '03',
  },
  {
    countyName: 'Mombasa County',
    countyCode: 'MSA',
    countyNumber: '01',
    subCounty: 'Likoni Sub-County',
    wardName: 'Likoni Ward',
    wardNumber: '04',
  },
  // Nakuru County (NKU, 32)
  {
    countyName: 'Nakuru County',
    countyCode: 'NKU',
    countyNumber: '32',
    subCounty: 'Nakuru Town Sub-County',
    wardName: 'Langas Ward',
    wardNumber: '01',
  },
  {
    countyName: 'Nakuru County',
    countyCode: 'NKU',
    countyNumber: '32',
    subCounty: 'Nakuru Town Sub-County',
    wardName: 'Barut Ward',
    wardNumber: '02',
  },
  {
    countyName: 'Nakuru County',
    countyCode: 'NKU',
    countyNumber: '32',
    subCounty: 'Kuresoi North Sub-County',
    wardName: 'Kilibwoni Ward',
    wardNumber: '13',
  },
  {
    countyName: 'Nakuru County',
    countyCode: 'NKU',
    countyNumber: '32',
    subCounty: 'Kuresoi South Sub-County',
    wardName: 'Molo Ward',
    wardNumber: '14',
  },
  // Nairobi County (NRB, 47)
  {
    countyName: 'Nairobi County',
    countyCode: 'NRB',
    countyNumber: '47',
    subCounty: 'Westlands Sub-County',
    wardName: 'Kitisuru Ward',
    wardNumber: '01',
  },
  {
    countyName: 'Nairobi County',
    countyCode: 'NRB',
    countyNumber: '47',
    subCounty: 'Westlands Sub-County',
    wardName: 'Karura Ward',
    wardNumber: '02',
  },
  {
    countyName: 'Nairobi County',
    countyCode: 'NRB',
    countyNumber: '47',
    subCounty: 'Makadara Sub-County',
    wardName: 'Makadara Ward',
    wardNumber: '13',
  },
  {
    countyName: 'Nairobi County',
    countyCode: 'NRB',
    countyNumber: '47',
    subCounty: 'Kamukunji Sub-County',
    wardName: 'Pumwani Ward',
    wardNumber: '14',
  },
];

export function registerSeedRoutes(app: App) {
  app.fastify.post('/api/seed/locations', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Seeding kenya_locations table');

    try {
      // Check if data already exists
      const existingCount = await app.db.query.kenyaLocations.findMany({
        limit: 1,
      });

      if (existingCount.length > 0) {
        app.logger.info({}, 'Kenya locations already seeded, skipping');
        return { message: 'Kenya locations already seeded' };
      }

      // Insert seed data
      await app.db.insert(schema.kenyaLocations).values(SEED_DATA);

      app.logger.info({ count: SEED_DATA.length }, 'Kenya locations seeded successfully');
      return { message: 'Kenya locations seeded successfully', count: SEED_DATA.length };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to seed kenya_locations');
      throw error;
    }
  });
}
