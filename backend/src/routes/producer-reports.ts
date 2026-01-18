import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
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

export function registerProducerReportRoutes(app: App) {
  app.fastify.post('/api/producer-reports', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      producerId: string;
      reportType: string;
      weekNumber: number;
      year: number;
      notes?: string;
    };

    app.logger.info(
      {
        producerId: body.producerId,
        reportType: body.reportType,
        weekNumber: body.weekNumber,
        year: body.year,
      },
      'Creating producer report'
    );

    try {
      const result = await app.db
        .insert(schema.producerReports)
        .values({
          producerId: body.producerId,
          reportType: body.reportType,
          weekNumber: body.weekNumber,
          year: body.year,
          notes: body.notes || null,
        })
        .returning();

      app.logger.info({ reportId: result[0].id }, 'Producer report created successfully');
      return { report: result[0] };
    } catch (error) {
      app.logger.error({ err: error, producerId: body.producerId }, 'Failed to create producer report');
      throw error;
    }
  });

  app.fastify.get('/api/producer-reports/:producerId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { producerId } = request.params as { producerId: string };
    app.logger.info({ producerId }, 'Fetching producer reports');

    try {
      const reports = await app.db.query.producerReports.findMany({
        where: eq(schema.producerReports.producerId, producerId),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });

      app.logger.info({ producerId, count: reports.length }, 'Producer reports fetched successfully');
      return reports;
    } catch (error) {
      app.logger.error({ err: error, producerId }, 'Failed to fetch producer reports');
      throw error;
    }
  });

  app.fastify.get(
    '/api/producer-reports/:producerId/projected-harvest',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { producerId } = request.params as { producerId: string };
      app.logger.info({ producerId }, 'Calculating projected harvest');

      try {
        // Get producer details
        const producer = await app.db.query.users.findFirst({
          where: eq(schema.users.id, producerId),
        });

        if (!producer) {
          app.logger.warn({ producerId }, 'Producer not found');
          return reply.status(404).send({ error: 'Producer not found' });
        }

        if (!producer.cropType || !producer.farmAcreage) {
          app.logger.info({ producerId }, 'Producer missing crop type or acreage for projection');
          return { projectedVolumeKg: 0 };
        }

        const yieldPerAcre = CROP_YIELDS[producer.cropType.toLowerCase()] || 0;
        const acreage = parseFloat(producer.farmAcreage.toString());
        const projectedVolume = yieldPerAcre * acreage;

        app.logger.info(
          {
            producerId,
            cropType: producer.cropType,
            acreage,
            yieldPerAcre,
            projectedVolume,
          },
          'Projected harvest calculated successfully'
        );

        return { projectedVolumeKg: projectedVolume };
      } catch (error) {
        app.logger.error({ err: error, producerId }, 'Failed to calculate projected harvest');
        throw error;
      }
    }
  );
}
