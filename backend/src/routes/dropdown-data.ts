import type { FastifyRequest, FastifyReply } from 'fastify';
import type { App } from '../index.js';

export function registerDropdownDataRoutes(app: App) {
  app.fastify.get(
    '/api/dropdown-data/service-provider-organizations',
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'Fetching service provider organizations');

      try {
        const organizations = ['Agronomist', 'Aggregator'];
        app.logger.info({ count: organizations.length }, 'Service provider organizations fetched');
        return organizations;
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch service provider organizations');
        throw error;
      }
    }
  );

  app.fastify.get(
    '/api/dropdown-data/buyer-organizations',
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'Fetching buyer organizations');

      try {
        const organizations = [
          'Costco wholesale',
          'Walmart',
          'Whole Foods Market',
          'The Kroger Co.',
          'Sprouts Farmers Market',
          'Trader Joe\'s',
          'Albertsons Co.',
          'Target',
          'Publix Super Markets',
          'ALDI',
        ];
        app.logger.info({ count: organizations.length }, 'Buyer organizations fetched');
        return organizations;
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch buyer organizations');
        throw error;
      }
    }
  );

  app.fastify.get(
    '/api/dropdown-data/core-mandates',
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'Fetching core mandates');

      try {
        const mandates = [
          'Advisory (Agronomist)',
          'Collection estimation (Agronomist/Aggregator)',
          'Collection (Aggregator)',
          'Shipment (Aggregator)',
        ];
        app.logger.info({ count: mandates.length }, 'Core mandates fetched');
        return mandates;
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch core mandates');
        throw error;
      }
    }
  );

  app.fastify.get(
    '/api/dropdown-data/major-airports',
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'Fetching major airports');

      try {
        const airports = [
          'Jomo Kenyatta International Airport (NBO)',
          'Moi International Airport (MBA)',
          'Kisumu International Airport (KIS)',
          'Eldoret International Airport (EDL)',
        ];
        app.logger.info({ count: airports.length }, 'Major airports fetched');
        return airports;
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch major airports');
        throw error;
      }
    }
  );

  app.fastify.get(
    '/api/dropdown-data/crop-types',
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'Fetching crop types');

      try {
        const cropTypes = ['Avocado', 'Mango', 'Passion Fruit', 'Pineapple', 'Banana', 'NONE'];
        app.logger.info({ count: cropTypes.length }, 'Crop types fetched');
        return cropTypes;
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch crop types');
        throw error;
      }
    }
  );
}
