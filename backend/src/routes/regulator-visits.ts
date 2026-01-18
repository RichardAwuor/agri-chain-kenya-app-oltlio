import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

// Crop yield matrix (kg per acre)
const CROP_YIELDS: Record<string, number> = {
  maize: 2000,
  beans: 800,
  potatoes: 15000,
  tomatoes: 20000,
  cabbage: 25000,
};

export function registerRegulatorVisitRoutes(app: App) {
  app.fastify.post('/api/regulator-visits', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      regulatorId: string;
      producerId: string;
      visitDate: string;
      visitLat: number;
      visitLng: number;
      comments: string;
      photoUrls?: string[];
    };

    app.logger.info(
      {
        regulatorId: body.regulatorId,
        producerId: body.producerId,
        visitDate: body.visitDate,
      },
      'Creating regulator visit'
    );

    try {
      // Create the visit record
      const visitResult = await app.db
        .insert(schema.regulatorVisits)
        .values({
          regulatorId: body.regulatorId,
          producerId: body.producerId,
          visitDate: new Date(body.visitDate),
          visitLat: body.visitLat.toString(),
          visitLng: body.visitLng.toString(),
          comments: body.comments.substring(0, 160) || null, // Enforce 160 char limit
        })
        .returning();

      const visitId = visitResult[0].id;

      // Add photos if provided
      if (body.photoUrls && body.photoUrls.length > 0) {
        const photos = body.photoUrls.map((url) => ({
          visitId,
          photoUrl: url,
        }));

        await app.db.insert(schema.visitPhotos).values(photos);
        app.logger.info({ visitId, photoCount: photos.length }, 'Visit photos created');
      }

      app.logger.info({ visitId }, 'Regulator visit created successfully');
      return { visit: visitResult[0] };
    } catch (error) {
      app.logger.error(
        { err: error, regulatorId: body.regulatorId, producerId: body.producerId },
        'Failed to create regulator visit'
      );
      throw error;
    }
  });

  app.fastify.get('/api/regulator-visits/:regulatorId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { regulatorId } = request.params as { regulatorId: string };
    app.logger.info({ regulatorId }, 'Fetching regulator visits');

    try {
      const visits = await app.db.query.regulatorVisits.findMany({
        where: eq(schema.regulatorVisits.regulatorId, regulatorId),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });

      // Enrich visits with producer details and photos
      const enrichedVisits = await Promise.all(
        visits.map(async (visit) => {
          const producer = await app.db.query.users.findFirst({
            where: eq(schema.users.id, visit.producerId),
          });

          const photos = await app.db.query.visitPhotos.findMany({
            where: eq(schema.visitPhotos.visitId, visit.id),
          });

          return {
            id: visit.id,
            producerId: visit.producerId,
            producerName: producer ? `${producer.firstName} ${producer.lastName}` : 'Unknown',
            farmerId: producer?.farmerId || 'N/A',
            visitDate: visit.visitDate,
            visitLat: visit.visitLat,
            visitLng: visit.visitLng,
            comments: visit.comments,
            photos: photos.map((p) => ({ id: p.id, photoUrl: p.photoUrl })),
            createdAt: visit.createdAt,
          };
        })
      );

      app.logger.info({ regulatorId, count: enrichedVisits.length }, 'Regulator visits fetched successfully');
      return enrichedVisits;
    } catch (error) {
      app.logger.error({ err: error, regulatorId }, 'Failed to fetch regulator visits');
      throw error;
    }
  });

  app.fastify.get(
    '/api/regulator-visits/:regulatorId/dashboard',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { regulatorId } = request.params as { regulatorId: string };
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

      app.logger.info(
        {
          regulatorId,
          startDate,
          endDate,
        },
        'Fetching regulator dashboard'
      );

      try {
        let whereClause = eq(schema.regulatorVisits.regulatorId, regulatorId);

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          whereClause = and(
            eq(schema.regulatorVisits.regulatorId, regulatorId),
            gte(schema.regulatorVisits.visitDate, start),
            lte(schema.regulatorVisits.visitDate, end)
          ) as any;
        }

        const visits = await app.db.query.regulatorVisits.findMany({
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
        const cropsCovered = new Set(producers.filter((p) => p?.cropType).map((p) => p!.cropType as string));
        const totalAcreage = producers
          .filter((p) => p?.farmAcreage)
          .reduce((sum, p) => sum + parseFloat(p!.farmAcreage!.toString()), 0);

        // Calculate projected volume per crop
        const projectedVolumePerCrop: Record<string, number> = {};
        producers.forEach((producer) => {
          if (producer?.cropType && producer?.farmAcreage) {
            const cropType = producer.cropType.toLowerCase();
            const yieldPerAcre = CROP_YIELDS[cropType] || 0;
            const acreage = parseFloat(producer.farmAcreage.toString());
            const volume = yieldPerAcre * acreage;

            if (!projectedVolumePerCrop[producer.cropType]) {
              projectedVolumePerCrop[producer.cropType] = 0;
            }
            projectedVolumePerCrop[producer.cropType] += volume;
          }
        });

        const dashboard = {
          farmersVisited,
          cropsCovered: Array.from(cropsCovered),
          totalAcreage: Math.round(totalAcreage * 100) / 100,
          projectedVolumePerCrop,
        };

        app.logger.info(
          {
            regulatorId,
            farmersVisited,
            cropsCovered: dashboard.cropsCovered.length,
          },
          'Regulator dashboard fetched successfully'
        );

        return dashboard;
      } catch (error) {
        app.logger.error({ err: error, regulatorId }, 'Failed to fetch regulator dashboard');
        throw error;
      }
    }
  );
}
