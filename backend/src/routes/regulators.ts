import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { isValidPaidEmailDomain, emailsMatch } from '../utils/validation.js';

export function registerRegulatorRoutes(app: App) {
  // Register regulator
  app.fastify.post('/api/regulators/register', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Regulator registration initiated');

    try {
      const body = request.body as {
        email: string;
        confirmEmail: string;
        firstName: string;
        lastName: string;
        organizationName?: string;
        workIdFrontUrl?: string;
        workIdBackUrl?: string;
        county: string;
        subCounty: string;
        ward: string;
        coreMandates?: string[];
      };

      // Validate required fields
      if (!body.email || !body.firstName || !body.lastName) {
        app.logger.warn({}, 'Missing required form fields for regulator registration');
        return reply.status(400).send({ error: 'Missing required fields (email, firstName, lastName)' });
      }

      // Validate email domain
      if (!isValidPaidEmailDomain(body.email)) {
        app.logger.warn({ email: body.email }, 'Invalid email domain');
        return reply.status(400).send({ error: 'Email domain must be paid (not free)' });
      }

      // Validate emails match
      if (!emailsMatch(body.email, body.confirmEmail)) {
        app.logger.warn({}, 'Email confirmation mismatch');
        return reply.status(400).send({ error: 'Emails do not match' });
      }

      // Validate work ID files - both or neither
      if ((body.workIdFrontUrl && !body.workIdBackUrl) || (!body.workIdFrontUrl && body.workIdBackUrl)) {
        app.logger.warn(
          { hasFront: !!body.workIdFrontUrl, hasBack: !!body.workIdBackUrl },
          'Both work ID URLs must be provided together if uploading'
        );
        return reply.status(400).send({ error: 'Both work ID front and back URLs must be provided together' });
      }

      if (body.workIdFrontUrl || body.workIdBackUrl) {
        app.logger.info({ email: body.email }, 'Work ID files provided during registration');
      } else {
        app.logger.info({ email: body.email }, 'Work ID files not provided (optional)');
      }

      // Create regulator user
      const result = await app.db
        .insert(schema.users)
        .values({
          userType: 'regulator',
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
          organizationName: body.organizationName || null,
          county: body.county,
          subCounty: body.subCounty,
          ward: body.ward,
          workIdFrontUrl: body.workIdFrontUrl || null,
          workIdBackUrl: body.workIdBackUrl || null,
          coreMandates: body.coreMandates && body.coreMandates.length > 0 ? body.coreMandates : null,
          registrationCompleted: true,
        })
        .returning();

      app.logger.info(
        {
          regulatorId: result[0].id,
          email: body.email,
        },
        'Regulator registered successfully'
      );

      return {
        id: result[0].id,
        email: result[0].email,
        firstName: result[0].firstName,
        lastName: result[0].lastName,
        organizationName: result[0].organizationName,
        county: result[0].county,
        subCounty: result[0].subCounty,
        ward: result[0].ward,
        workIdFrontUrl: result[0].workIdFrontUrl,
        workIdBackUrl: result[0].workIdBackUrl,
        coreMandates: result[0].coreMandates,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to register regulator');
      throw error;
    }
  });

  // Get nearby farmers
  app.fastify.get('/api/regulators/nearby-farmers', async (request: FastifyRequest, reply: FastifyReply) => {
    const { lat, lng, radius } = request.query as { lat?: string; lng?: string; radius?: string };

    app.logger.info({ lat, lng, radius }, 'Searching for nearby farmers');

    try {
      if (!lat || !lng) {
        return reply.status(400).send({ error: 'lat and lng query parameters are required' });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusMeters = radius ? parseFloat(radius) : 10000; // Default 10km

      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
        return reply.status(400).send({ error: 'Invalid lat, lng, or radius values' });
      }

      // Get all producers
      const producers = await app.db.query.users.findMany({
        where: eq(schema.users.userType, 'producer'),
      });

      // Calculate distances and filter
      const nearby = producers
        .map((producer) => {
          if (!producer.addressLat || !producer.addressLng) return null;

          const farmerLat = parseFloat(producer.addressLat.toString());
          const farmerLng = parseFloat(producer.addressLng.toString());

          const distance = calculateDistance(latitude, longitude, farmerLat, farmerLng);

          if (distance <= radiusMeters) {
            return {
              id: producer.id,
              farmerId: producer.farmerId,
              firstName: producer.firstName,
              lastName: producer.lastName,
              distance: Math.round(distance),
              lat: farmerLat,
              lng: farmerLng,
            };
          }

          return null;
        })
        .filter(Boolean)
        .sort((a, b) => (a?.distance || 0) - (b?.distance || 0));

      app.logger.info({ count: nearby.length, radiusMeters }, 'Nearby farmers found');
      return nearby;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to find nearby farmers');
      throw error;
    }
  });
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
