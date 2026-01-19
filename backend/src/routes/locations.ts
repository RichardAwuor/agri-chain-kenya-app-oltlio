import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, sql, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

/**
 * Helper function to get all sub-counties for a county and assign dynamic numbers based on alphabetical ordering
 */
async function getSubCountiesWithNumbers(app: App, county: string) {
  const subCounties = await app.db
    .selectDistinct({
      subCounty: schema.kenyaLocations.subCounty,
    })
    .from(schema.kenyaLocations)
    .where(eq(schema.kenyaLocations.countyName, county))
    .orderBy(schema.kenyaLocations.subCounty);

  // Assign numbers based on alphabetical position
  return subCounties.map((item, index) => ({
    subCounty: item.subCounty,
    subCountyNumber: (index + 1).toString().padStart(2, '0'),
  }));
}

/**
 * Helper function to get all wards for a county+subcounty and assign dynamic numbers based on alphabetical ordering
 */
async function getWardsWithNumbers(app: App, county: string, subCounty: string) {
  const wards = await app.db
    .selectDistinct({
      wardName: schema.kenyaLocations.wardName,
    })
    .from(schema.kenyaLocations)
    .where(
      and(
        eq(schema.kenyaLocations.countyName, county),
        eq(schema.kenyaLocations.subCounty, subCounty)
      )
    )
    .orderBy(schema.kenyaLocations.wardName);

  // Assign numbers based on alphabetical position
  return wards.map((item, index) => ({
    wardName: item.wardName,
    wardNumber: (index + 1).toString().padStart(3, '0'),
  }));
}

/**
 * Helper function to get the sub-county number for a specific sub-county
 */
async function getSubCountyNumber(app: App, county: string, subCounty: string) {
  const subCounties = await getSubCountiesWithNumbers(app, county);
  const found = subCounties.find((sc) => sc.subCounty === subCounty);
  return found?.subCountyNumber || '00';
}

/**
 * Helper function to get the ward number for a specific ward
 */
async function getWardNumber(app: App, county: string, subCounty: string, ward: string) {
  const wards = await getWardsWithNumbers(app, county, subCounty);
  const found = wards.find((w) => w.wardName === ward);
  return found?.wardNumber || '000';
}

export function registerLocationRoutes(app: App) {
  // Get unique counties
  app.fastify.get('/api/locations/counties', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Fetching unique counties');

    try {
      const counties = await app.db
        .selectDistinct({
          countyName: schema.kenyaLocations.countyName,
          countyCode: schema.kenyaLocations.countyCode,
          countyNumber: schema.kenyaLocations.countyNumber,
        })
        .from(schema.kenyaLocations)
        .orderBy(schema.kenyaLocations.countyName);

      app.logger.info({ count: counties.length }, 'Counties fetched successfully');
      return counties;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch counties');
      throw error;
    }
  });

  // Get sub-counties for a specific county with dynamic numbers based on alphabetical ordering
  app.fastify.get('/api/locations/sub-counties', async (request: FastifyRequest, reply: FastifyReply) => {
    const { county } = request.query as { county: string };
    app.logger.info({ county }, 'Fetching sub-counties with dynamic numbering');

    try {
      if (!county) {
        app.logger.warn({}, 'County parameter is required for sub-counties');
        return reply.status(400).send({ error: 'County parameter is required' });
      }

      const subCounties = await getSubCountiesWithNumbers(app, county);

      app.logger.info({ county, count: subCounties.length }, 'Sub-counties fetched successfully with dynamic numbering');
      return subCounties;
    } catch (error) {
      app.logger.error({ err: error, county }, 'Failed to fetch sub-counties');
      throw error;
    }
  });

  // Get wards for a specific county and sub-county with dynamic numbers based on alphabetical ordering
  app.fastify.get('/api/locations/wards', async (request: FastifyRequest, reply: FastifyReply) => {
    const { county, subCounty } = request.query as { county: string; subCounty: string };
    app.logger.info({ county, subCounty }, 'Fetching wards with dynamic numbering');

    try {
      if (!county || !subCounty) {
        app.logger.warn({}, 'County and subCounty parameters are required for wards');
        return reply.status(400).send({ error: 'County and subCounty parameters are required' });
      }

      const wards = await getWardsWithNumbers(app, county, subCounty);

      app.logger.info(
        { county, subCounty, count: wards.length },
        'Wards fetched successfully with dynamic numbering'
      );
      return wards;
    } catch (error) {
      app.logger.error({ err: error, county, subCounty }, 'Failed to fetch wards');
      throw error;
    }
  });

  // Generate farmer ID with dynamically calculated sub-county and ward numbers
  app.fastify.post('/api/locations/generate-farmer-id', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      county: string;
      subCounty: string;
      ward: string;
    };

    app.logger.info(
      { county: body.county, subCounty: body.subCounty, ward: body.ward },
      'Generating farmer ID with dynamic numbering'
    );

    try {
      // Get location data to get county code and county number
      const location = await app.db.query.kenyaLocations.findFirst({
        where: and(
          eq(schema.kenyaLocations.countyName, body.county),
          eq(schema.kenyaLocations.subCounty, body.subCounty),
          eq(schema.kenyaLocations.wardName, body.ward)
        ),
      });

      if (!location) {
        app.logger.warn(
          { county: body.county, subCounty: body.subCounty, ward: body.ward },
          'Location not found for farmer ID generation'
        );
        return reply.status(404).send({ error: 'Location not found' });
      }

      // Get dynamically calculated sub-county number based on alphabetical ordering
      const subCountyNumber = await getSubCountyNumber(app, body.county, body.subCounty);

      // Get dynamically calculated ward number based on alphabetical ordering
      const wardNumber = await getWardNumber(app, body.county, body.subCounty, body.ward);

      // Count existing farmers in this ward to generate the next farmer number
      const existingCount = await app.db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.county, body.county),
            eq(schema.users.subCounty, body.subCounty),
            eq(schema.users.ward, body.ward),
            eq(schema.users.userType, 'producer')
          )
        );

      const farmerNumber = (existingCount[0].count || 0) + 1;
      const farmerNumberFormatted = farmerNumber.toString().padStart(3, '0');

      // Format: XXXNN-NN-NNN (e.g., NRU32-05-003-001)
      const farmerId = `${location.countyCode}${location.countyNumber}-${subCountyNumber}-${wardNumber}-${farmerNumberFormatted}`;

      app.logger.info(
        {
          county: body.county,
          subCounty: body.subCounty,
          ward: body.ward,
          farmerId,
          farmerNumber,
          subCountyNumber,
          wardNumber,
        },
        'Farmer ID generated successfully with dynamic numbering'
      );

      return { farmerId };
    } catch (error) {
      app.logger.error(
        { err: error, county: body.county, subCounty: body.subCounty, ward: body.ward },
        'Failed to generate farmer ID'
      );
      throw error;
    }
  });
}
