import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { kgToLbs } from '../utils/validation.js';

export function registerServiceProviderReportsRoutes(app: App) {
  // Get available volumes by crop type for buyers
  app.fastify.get(
    '/api/service-provider-reports/available-volumes',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

      app.logger.info(
        {
          startDate,
          endDate,
        },
        'Fetching available volumes by crop type'
      );

      try {
        let whereClause = undefined;

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          whereClause = and(
            gte(schema.serviceProviderVisits.visitDate, start),
            lte(schema.serviceProviderVisits.visitDate, end)
          );
        }

        // Get all service provider visits with collection estimation
        const visits = await app.db.query.serviceProviderVisits.findMany({
          where: whereClause,
        });

        // Aggregate volumes by crop type and collection week
        const volumesByItem: Record<
          string,
          { cropType: string; volumeLbs: number; collectionWeek: number }
        > = {};

        visits.forEach((visit) => {
          if (visit.collectedCropType && visit.collectionEstimationWeek && visit.collectedVolumeKg) {
            const key = `${visit.collectedCropType}-${visit.collectionEstimationWeek}`;
            const volumeKg = parseFloat(visit.collectedVolumeKg.toString());
            const volumeLbs = kgToLbs(volumeKg);

            if (!volumesByItem[key]) {
              volumesByItem[key] = {
                cropType: visit.collectedCropType,
                volumeLbs: 0,
                collectionWeek: visit.collectionEstimationWeek,
              };
            }
            volumesByItem[key].volumeLbs += volumeLbs;
          }
        });

        const availableVolumes = Object.values(volumesByItem).sort((a, b) => {
          if (a.cropType !== b.cropType) {
            return a.cropType.localeCompare(b.cropType);
          }
          return a.collectionWeek - b.collectionWeek;
        });

        app.logger.info(
          {
            count: availableVolumes.length,
            startDate,
            endDate,
          },
          'Available volumes fetched successfully'
        );

        return availableVolumes;
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch available volumes');
        throw error;
      }
    }
  );
}
