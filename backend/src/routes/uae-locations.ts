import type { FastifyRequest, FastifyReply } from 'fastify';
import type { App } from '../index.js';

// UAE Emirates data
const UAE_EMIRATES = [
  { id: '1', emirateName: 'Abu Dhabi' },
  { id: '2', emirateName: 'Dubai' },
  { id: '3', emirateName: 'Sharjah' },
  { id: '4', emirateName: 'Ajman' },
  { id: '5', emirateName: 'Umm Al Quwain' },
  { id: '6', emirateName: 'Ras Al Khaimah' },
  { id: '7', emirateName: 'Fujairah' },
];

// Airport data mapped by emirate
const UAE_AIRPORTS_BY_EMIRATE: Record<string, Array<{ id: string; airportName: string; airportCode: string; emirate: string }>> = {
  'Abu Dhabi': [
    { id: '1', airportName: 'Abu Dhabi International Airport', airportCode: 'AUH', emirate: 'Abu Dhabi' },
    { id: '2', airportName: 'Al Ain International Airport', airportCode: 'AAN', emirate: 'Abu Dhabi' },
  ],
  'Dubai': [
    { id: '3', airportName: 'Dubai International Airport', airportCode: 'DXB', emirate: 'Dubai' },
    { id: '4', airportName: 'Al Maktoum International Airport', airportCode: 'DWC', emirate: 'Dubai' },
  ],
  'Sharjah': [
    { id: '5', airportName: 'Sharjah International Airport', airportCode: 'SHJ', emirate: 'Sharjah' },
  ],
  'Ajman': [
    { id: '6', airportName: 'Sharjah International Airport (SHJ) - Nearest', airportCode: 'SHJ', emirate: 'Ajman' },
  ],
  'Umm Al Quwain': [
    { id: '7', airportName: 'Sharjah International Airport (SHJ) - Nearest', airportCode: 'SHJ', emirate: 'Umm Al Quwain' },
  ],
  'Ras Al Khaimah': [
    { id: '8', airportName: 'Ras Al Khaimah International Airport', airportCode: 'RKT', emirate: 'Ras Al Khaimah' },
  ],
  'Fujairah': [
    { id: '9', airportName: 'Fujairah International Airport', airportCode: 'FJR', emirate: 'Fujairah' },
  ],
};

export function registerUaeLocationsRoutes(app: App) {
  // Get all UAE Emirates
  app.fastify.get('/api/locations/uae-emirates', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Fetching all UAE Emirates');

    try {
      app.logger.info({ count: UAE_EMIRATES.length }, 'UAE Emirates fetched successfully');
      return UAE_EMIRATES;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch UAE Emirates');
      throw error;
    }
  });

  // Get UAE airports by emirate
  app.fastify.get('/api/locations/uae-airports', async (request: FastifyRequest, reply: FastifyReply) => {
    const { emirate } = request.query as { emirate: string };

    app.logger.info({ emirate }, 'Fetching UAE airports for emirate');

    try {
      if (!emirate) {
        app.logger.warn({}, 'Emirate parameter is required');
        return reply.status(400).send({ error: 'Emirate parameter is required' });
      }

      const airports = UAE_AIRPORTS_BY_EMIRATE[emirate];

      if (!airports) {
        app.logger.warn({ emirate }, 'No airports found for emirate');
        return reply.status(404).send({ error: 'Emirate not found' });
      }

      app.logger.info({ emirate, count: airports.length }, 'UAE airports fetched successfully');
      return airports;
    } catch (error) {
      app.logger.error({ err: error, emirate }, 'Failed to fetch UAE airports');
      throw error;
    }
  });
}
