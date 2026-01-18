import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, sql, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

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

  // Get sub-counties for a specific county
  app.fastify.get('/api/locations/sub-counties', async (request: FastifyRequest, reply: FastifyReply) => {
    const { county } = request.query as { county: string };
    app.logger.info({ county }, 'Fetching sub-counties');

    try {
      if (!county) {
        return reply.status(400).send({ error: 'County parameter is required' });
      }

      const subCounties = await app.db
        .selectDistinct({
          subCounty: schema.kenyaLocations.subCounty,
        })
        .from(schema.kenyaLocations)
        .where(eq(schema.kenyaLocations.countyName, county))
        .orderBy(schema.kenyaLocations.subCounty);

      app.logger.info({ county, count: subCounties.length }, 'Sub-counties fetched successfully');
      return subCounties;
    } catch (error) {
      app.logger.error({ err: error, county }, 'Failed to fetch sub-counties');
      throw error;
    }
  });

  // Get wards for a specific county and sub-county
  app.fastify.get('/api/locations/wards', async (request: FastifyRequest, reply: FastifyReply) => {
    const { county, subCounty } = request.query as { county: string; subCounty: string };
    app.logger.info({ county, subCounty }, 'Fetching wards');

    try {
      if (!county || !subCounty) {
        return reply.status(400).send({ error: 'County and subCounty parameters are required' });
      }

      const wards = await app.db
        .selectDistinct({
          wardName: schema.kenyaLocations.wardName,
          wardNumber: schema.kenyaLocations.wardNumber,
        })
        .from(schema.kenyaLocations)
        .where(
          and(
            eq(schema.kenyaLocations.countyName, county),
            eq(schema.kenyaLocations.subCounty, subCounty)
          )
        )
        .orderBy(schema.kenyaLocations.wardName);

      app.logger.info({ county, subCounty, count: wards.length }, 'Wards fetched successfully');
      return wards;
    } catch (error) {
      app.logger.error({ err: error, county, subCounty }, 'Failed to fetch wards');
      throw error;
    }
  });

  // Generate farmer ID
  app.fastify.post('/api/locations/generate-farmer-id', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      county: string;
      subCounty: string;
      ward: string;
    };

    app.logger.info({ county: body.county, subCounty: body.subCounty, ward: body.ward }, 'Generating farmer ID');

    try {
      // Get location data to get county code and ward number
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

      // Format: XXX##-##-### (e.g., NKU32-13-743)
      const farmerId = `${location.countyCode}${location.countyNumber}-${location.wardNumber}-${farmerNumberFormatted}`;

      app.logger.info(
        { county: body.county, farmerId, farmerNumber },
        'Farmer ID generated successfully'
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
