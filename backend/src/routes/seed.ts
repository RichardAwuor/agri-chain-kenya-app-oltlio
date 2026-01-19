import type { FastifyRequest, FastifyReply } from 'fastify';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

const SEED_DATA = [
  // All 47 Kenyan Counties with placeholder sub-counties and wards
  { countyName: 'Mombasa', countyCode: 'MSA', countyNumber: '01', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Kwale', countyCode: 'KWL', countyNumber: '02', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Kilifi', countyCode: 'KLF', countyNumber: '03', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Tana River', countyCode: 'TRV', countyNumber: '04', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Lamu', countyCode: 'LMU', countyNumber: '05', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Taita/Taveta', countyCode: 'TVT', countyNumber: '06', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Garissa', countyCode: 'GRS', countyNumber: '07', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Wajir', countyCode: 'WJR', countyNumber: '08', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Mandera', countyCode: 'MDR', countyNumber: '09', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Marsabit', countyCode: 'MST', countyNumber: '10', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Isiolo', countyCode: 'ISO', countyNumber: '11', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Meru', countyCode: 'MRU', countyNumber: '12', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Tharaka-Nithi', countyCode: 'TKN', countyNumber: '13', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Embu', countyCode: 'EMB', countyNumber: '14', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Kitui', countyCode: 'KTI', countyNumber: '15', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Machakos', countyCode: 'MCK', countyNumber: '16', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Makueni', countyCode: 'MKN', countyNumber: '17', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Nyandarua', countyCode: 'NRA', countyNumber: '18', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Nyeri', countyCode: 'NYR', countyNumber: '19', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Kirinyaga', countyCode: 'KRG', countyNumber: '20', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Murang\'a', countyCode: 'MRA', countyNumber: '21', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Kiambu', countyCode: 'KBU', countyNumber: '22', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Turkana', countyCode: 'TKN', countyNumber: '23', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'West Pokot', countyCode: 'WPT', countyNumber: '24', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Samburu', countyCode: 'SMR', countyNumber: '25', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Trans Nzoia', countyCode: 'TNR', countyNumber: '26', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Uasin Gishu', countyCode: 'UGU', countyNumber: '27', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Elgeyo/Marakwet', countyCode: 'ELM', countyNumber: '28', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Nandi', countyCode: 'NDI', countyNumber: '29', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Baringo', countyCode: 'BRO', countyNumber: '30', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Laikipia', countyCode: 'LKP', countyNumber: '31', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Nakuru', countyCode: 'NRU', countyNumber: '32', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Narok', countyCode: 'NRK', countyNumber: '33', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Kajiado', countyCode: 'KJO', countyNumber: '34', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Kericho', countyCode: 'KRC', countyNumber: '35', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Bomet', countyCode: 'BOM', countyNumber: '36', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Kakamega', countyCode: 'KKG', countyNumber: '37', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Vihiga', countyCode: 'VHG', countyNumber: '38', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Bungoma', countyCode: 'BGA', countyNumber: '39', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Busia', countyCode: 'BSA', countyNumber: '40', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Siaya', countyCode: 'SYA', countyNumber: '41', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Kisumu', countyCode: 'KSM', countyNumber: '42', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Homa Bay', countyCode: 'HBY', countyNumber: '43', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Migori', countyCode: 'MGR', countyNumber: '44', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Kisii', countyCode: 'KSI', countyNumber: '45', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Nyamira', countyCode: 'NYM', countyNumber: '46', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
  { countyName: 'Nairobi City', countyCode: 'NBI', countyNumber: '47', subCounty: 'Default Sub-County', wardName: 'Default Ward', wardNumber: '01' },
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
