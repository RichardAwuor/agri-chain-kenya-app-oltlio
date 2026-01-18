import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { isValidPaidEmailDomain, emailsMatch, isValidCollectionEstimationWeek, kgToLbs } from '../utils/validation.js';

// Crop yield matrix (kg per acre)
const CROP_YIELDS: Record<string, number> = {
  avocado: 5000,
  mango: 10000,
  passionfruit: 3000,
  pineapple: 20000,
  banana: 40000,
};

export function registerServiceProviderRoutes(app: App) {
  // Register service provider
  app.fastify.post('/api/service-providers/register', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Service provider registration initiated');

    try {
      const data = await request.file();
      if (!data) {
        app.logger.warn({}, 'No files provided for service provider registration');
        return reply.status(400).send({ error: 'Work ID files are required' });
      }

      const body = request.body as any;

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

      // Parse core mandates array
      let coreMandates = body.coreMandates;
      if (typeof coreMandates === 'string') {
        try {
          coreMandates = JSON.parse(coreMandates);
        } catch {
          coreMandates = [coreMandates];
        }
      }
      if (!Array.isArray(coreMandates)) {
        coreMandates = [];
      }

      // Upload work ID files
      let workIdFrontUrl = '';
      let workIdBackUrl = '';

      // Note: In a real implementation, we would handle multiple file uploads
      // For now, we'll use placeholder logic
      const buffer = await data.toBuffer();
      const key = `work-ids/sp/${Date.now()}-${data.filename}`;
      const uploadedKey = await app.storage.upload(key, buffer);
      const { url } = await app.storage.getSignedUrl(uploadedKey);
      workIdFrontUrl = url;
      workIdBackUrl = url; // In real scenario, handle separate front/back files

      // Create service provider user
      const result = await app.db
        .insert(schema.users)
        .values({
          userType: 'service_provider',
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
          county: body.county,
          subCounty: body.subCounty,
          ward: body.ward,
          organizationName: body.organizationName,
          coreMandates: coreMandates,
          workIdFrontUrl,
          workIdBackUrl,
          registrationCompleted: true,
        })
        .returning();

      app.logger.info({ serviceProviderId: result[0].id }, 'Service provider registered successfully');

      return {
        id: result[0].id,
        email: result[0].email,
        firstName: result[0].firstName,
        lastName: result[0].lastName,
        organizationName: result[0].organizationName,
        county: result[0].county,
        subCounty: result[0].subCounty,
        ward: result[0].ward,
        coreMandates: result[0].coreMandates,
        workIdFrontUrl: result[0].workIdFrontUrl,
        workIdBackUrl: result[0].workIdBackUrl,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to register service provider');
      throw error;
    }
  });

  // Create service provider visit
  app.fastify.post('/api/service-providers/visits', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      serviceProviderId: string;
      producerId: string;
      visitDate: string;
      visitLat: number;
      visitLng: number;
      collectionEstimationWeek?: number;
      collectedCropType?: string;
      collectedVolumeKg?: number;
      shippedCropType?: string;
      shippedVolumeKg?: number;
      comments?: string;
    };

    app.logger.info(
      {
        serviceProviderId: body.serviceProviderId,
        producerId: body.producerId,
        visitDate: body.visitDate,
      },
      'Creating service provider visit'
    );

    try {
      // Validate collection estimation week
      if (body.collectionEstimationWeek && !isValidCollectionEstimationWeek(body.collectionEstimationWeek)) {
        app.logger.warn(
          { week: body.collectionEstimationWeek },
          'Collection estimation week must be at least 7 days ahead'
        );
        return reply
          .status(400)
          .send({ error: 'Collection estimation week must be at least 7 days ahead' });
      }

      // Create visit
      const visitResult = await app.db
        .insert(schema.serviceProviderVisits)
        .values({
          serviceProviderId: body.serviceProviderId,
          producerId: body.producerId,
          visitDate: new Date(body.visitDate),
          visitLat: body.visitLat.toString(),
          visitLng: body.visitLng.toString(),
          collectionEstimationWeek: body.collectionEstimationWeek || null,
          collectedCropType: body.collectedCropType || null,
          collectedVolumeKg: body.collectedVolumeKg ? body.collectedVolumeKg.toString() : null,
          shippedCropType: body.shippedCropType || null,
          shippedVolumeKg: body.shippedVolumeKg ? body.shippedVolumeKg.toString() : null,
          comments: body.comments?.substring(0, 160) || null,
        })
        .returning();

      const visitId = visitResult[0].id;
      const photos: { id: string; photoUrl: string }[] = [];

      // In a real scenario, handle photo uploads here (max 5)
      // For now, we return empty photos array

      app.logger.info({ visitId }, 'Service provider visit created successfully');

      return {
        id: visitResult[0].id,
        serviceProviderId: visitResult[0].serviceProviderId,
        producerId: visitResult[0].producerId,
        visitDate: visitResult[0].visitDate,
        visitLat: visitResult[0].visitLat,
        visitLng: visitResult[0].visitLng,
        collectionEstimationWeek: visitResult[0].collectionEstimationWeek,
        collectedCropType: visitResult[0].collectedCropType,
        collectedVolumeKg: visitResult[0].collectedVolumeKg,
        shippedCropType: visitResult[0].shippedCropType,
        shippedVolumeKg: visitResult[0].shippedVolumeKg,
        comments: visitResult[0].comments,
        photos,
      };
    } catch (error) {
      app.logger.error(
        { err: error, serviceProviderId: body.serviceProviderId },
        'Failed to create service provider visit'
      );
      throw error;
    }
  });

  // Get service provider visits
  app.fastify.get(
    '/api/service-providers/visits/:serviceProviderId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { serviceProviderId } = request.params as { serviceProviderId: string };
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

      app.logger.info({ serviceProviderId }, 'Fetching service provider visits');

      try {
        let whereClause = eq(schema.serviceProviderVisits.serviceProviderId, serviceProviderId);

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          whereClause = and(
            eq(schema.serviceProviderVisits.serviceProviderId, serviceProviderId),
            gte(schema.serviceProviderVisits.visitDate, start),
            lte(schema.serviceProviderVisits.visitDate, end)
          ) as any;
        }

        const visits = await app.db.query.serviceProviderVisits.findMany({
          where: whereClause,
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        });

        // Enrich with producer details
        const enrichedVisits = await Promise.all(
          visits.map(async (visit) => {
            const producer = await app.db.query.users.findFirst({
              where: eq(schema.users.id, visit.producerId),
            });

            const photos = await app.db.query.serviceProviderVisitPhotos.findMany({
              where: eq(schema.serviceProviderVisitPhotos.visitId, visit.id),
            });

            return {
              id: visit.id,
              producerId: visit.producerId,
              producerFarmerId: producer?.farmerId || 'N/A',
              producerName: producer ? `${producer.firstName} ${producer.lastName}` : 'Unknown',
              visitDate: visit.visitDate,
              visitLat: visit.visitLat,
              visitLng: visit.visitLng,
              collectionEstimationWeek: visit.collectionEstimationWeek,
              collectedCropType: visit.collectedCropType,
              collectedVolumeKg: visit.collectedVolumeKg,
              shippedCropType: visit.shippedCropType,
              shippedVolumeKg: visit.shippedVolumeKg,
              comments: visit.comments,
              photos: photos.map((p) => p.photoUrl),
            };
          })
        );

        app.logger.info({ serviceProviderId, count: enrichedVisits.length }, 'Visits fetched successfully');
        return enrichedVisits;
      } catch (error) {
        app.logger.error({ err: error, serviceProviderId }, 'Failed to fetch service provider visits');
        throw error;
      }
    }
  );

  // Get nearby farmers
  app.fastify.get('/api/service-providers/nearby-farmers', async (request: FastifyRequest, reply: FastifyReply) => {
    const { lat, lng, radius } = request.query as { lat?: string; lng?: string; radius?: string };

    app.logger.info({ lat, lng, radius }, 'Searching for nearby farmers');

    try {
      if (!lat || !lng || !radius) {
        return reply.status(400).send({ error: 'lat, lng, and radius query parameters are required' });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusMeters = parseFloat(radius);

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
            };
          }

          return null;
        })
        .filter(Boolean)
        .sort((a, b) => (a?.distance || 0) - (b?.distance || 0));

      app.logger.info({ count: nearby.length }, 'Nearby farmers found');
      return nearby;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to find nearby farmers');
      throw error;
    }
  });

  // Service provider dashboard
  app.fastify.get(
    '/api/service-providers/dashboard/:serviceProviderId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { serviceProviderId } = request.params as { serviceProviderId: string };
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

      app.logger.info({ serviceProviderId }, 'Fetching service provider dashboard');

      try {
        let whereClause = eq(schema.serviceProviderVisits.serviceProviderId, serviceProviderId);

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          whereClause = and(
            eq(schema.serviceProviderVisits.serviceProviderId, serviceProviderId),
            gte(schema.serviceProviderVisits.visitDate, start),
            lte(schema.serviceProviderVisits.visitDate, end)
          ) as any;
        }

        const visits = await app.db.query.serviceProviderVisits.findMany({
          where: whereClause,
        });

        // Get unique producers visited
        const producerIds = new Set(visits.map((v) => v.producerId));
        const farmersVisited = producerIds.size;

        // Get producer details
        const producers = await Promise.all(
          Array.from(producerIds).map((id) =>
            app.db.query.users.findFirst({
              where: eq(schema.users.id, id),
            })
          )
        );

        // Calculate stats
        const cropsCovered = new Set(
          producers.filter((p) => p?.cropType).map((p) => p!.cropType as string)
        );
        const totalAcreage = producers
          .filter((p) => p?.farmAcreage)
          .reduce((sum, p) => sum + parseFloat(p!.farmAcreage!.toString()), 0);

        // Projected production by crop (from producer data)
        const projectedProductionByCrop: { cropType: string; volumeKg: number }[] = [];
        const cropMap = new Map<string, number>();
        producers.forEach((producer) => {
          if (producer?.cropType && producer?.farmAcreage) {
            const cropType = producer.cropType.toLowerCase();
            const yieldPerAcre = CROP_YIELDS[cropType] || 0;
            const acreage = parseFloat(producer.farmAcreage.toString());
            const volume = yieldPerAcre * acreage;

            const existing = cropMap.get(producer.cropType) || 0;
            cropMap.set(producer.cropType, existing + volume);
          }
        });

        cropMap.forEach((volumeKg, cropType) => {
          projectedProductionByCrop.push({ cropType, volumeKg: Math.round(volumeKg * 100) / 100 });
        });

        // Collection estimation by crop
        const collectionEstimationByCrop: { cropType: string; weekNumber: number; volumeKg: number }[] = [];
        visits.forEach((visit) => {
          if (visit.collectedCropType && visit.collectionEstimationWeek && visit.collectedVolumeKg) {
            collectionEstimationByCrop.push({
              cropType: visit.collectedCropType,
              weekNumber: visit.collectionEstimationWeek,
              volumeKg: parseFloat(visit.collectedVolumeKg.toString()),
            });
          }
        });

        // Collection volumes by crop (actual collected)
        const collectionVolumesByCrop: { cropType: string; volumeKg: number }[] = [];
        const collectionMap = new Map<string, number>();
        visits.forEach((visit) => {
          if (visit.collectedCropType && visit.collectedVolumeKg) {
            const existing = collectionMap.get(visit.collectedCropType) || 0;
            collectionMap.set(
              visit.collectedCropType,
              existing + parseFloat(visit.collectedVolumeKg.toString())
            );
          }
        });
        collectionMap.forEach((volumeKg, cropType) => {
          collectionVolumesByCrop.push({ cropType, volumeKg });
        });

        // Shipped volumes by crop
        const shippedVolumesByCrop: { cropType: string; volumeKg: number }[] = [];
        const shippedMap = new Map<string, number>();
        visits.forEach((visit) => {
          if (visit.shippedCropType && visit.shippedVolumeKg) {
            const existing = shippedMap.get(visit.shippedCropType) || 0;
            shippedMap.set(
              visit.shippedCropType,
              existing + parseFloat(visit.shippedVolumeKg.toString())
            );
          }
        });
        shippedMap.forEach((volumeKg, cropType) => {
          shippedVolumesByCrop.push({ cropType, volumeKg });
        });

        // Buyer orders by crop (placeholder)
        const buyerOrdersByCrop: { cropType: string; volumeLbs: number }[] = [];

        const dashboard = {
          farmersVisited,
          cropsCovered: cropsCovered.size,
          totalAcreage: Math.round(totalAcreage * 100) / 100,
          projectedProductionByCrop,
          collectionEstimationByCrop,
          collectionVolumesByCrop,
          shippedVolumesByCrop,
          buyerOrdersByCrop,
        };

        app.logger.info(
          {
            serviceProviderId,
            farmersVisited,
            cropsCovered: cropsCovered.size,
          },
          'Service provider dashboard fetched successfully'
        );

        return dashboard;
      } catch (error) {
        app.logger.error({ err: error, serviceProviderId }, 'Failed to fetch service provider dashboard');
        throw error;
      }
    }
  );
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
