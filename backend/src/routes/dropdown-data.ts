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
        const cropTypes = ['Lettuce', 'Tomato', 'Cucumber', 'Capsicum', 'Cabbage', 'Broccoli', 'Green onion', 'Potato', 'NONE'];
        app.logger.info({ count: cropTypes.length }, 'Crop types fetched');
        return cropTypes;
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch crop types');
        throw error;
      }
    }
  );

  app.fastify.get(
    '/api/dropdown-data/crop-matrix',
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'Fetching crop matrix');

      try {
        const cropMatrix = [
          {
            cropName: 'Lettuce',
            perCapitaConsumptionLbs: 12,
            annualVolMillionMetricTons: 2,
            onePercentMarketShareMetricTons: 18000,
            dailyDemandMetricTons: 49,
            maturityPeriodDays: 70,
            plantSpacingMeters: '0.5X0.5',
            plantsInHalfAcre: 8000,
            producePerPlantLbs: 1,
            storeBuyingPerLb: 1,
            revenuePerSeason: 8000,
            farmerRevenuePerYear: 24000,
            averageEarningsPerMonth: 2000,
            farmerShare40Percent: 9600,
            serviceProviderShare40Percent: 9600,
            gokTax20Percent: 4800,
            farmerEarningPerMonth: 800,
          },
          {
            cropName: 'Tomato',
            perCapitaConsumptionLbs: 31,
            annualVolMillionMetricTons: 5,
            onePercentMarketShareMetricTons: 46500,
            dailyDemandMetricTons: 127,
            maturityPeriodDays: 80,
            plantSpacingMeters: '1X1',
            plantsInHalfAcre: 2000,
            producePerPlantLbs: 5,
            storeBuyingPerLb: 1,
            revenuePerSeason: 10000,
            farmerRevenuePerYear: 30000,
            averageEarningsPerMonth: 2500,
            farmerShare40Percent: 12000,
            serviceProviderShare40Percent: 12000,
            gokTax20Percent: 6000,
            farmerEarningPerMonth: 1000,
          },
          {
            cropName: 'Cucumber',
            perCapitaConsumptionLbs: 12,
            annualVolMillionMetricTons: 2,
            onePercentMarketShareMetricTons: 18000,
            dailyDemandMetricTons: 49,
            maturityPeriodDays: 60,
            plantSpacingMeters: '0.7X0.7',
            plantsInHalfAcre: 4000,
            producePerPlantLbs: 5,
            storeBuyingPerLb: 1,
            revenuePerSeason: 20000,
            farmerRevenuePerYear: 60000,
            averageEarningsPerMonth: 5000,
            farmerShare40Percent: 24000,
            serviceProviderShare40Percent: 24000,
            gokTax20Percent: 12000,
            farmerEarningPerMonth: 2000,
          },
          {
            cropName: 'Capsicum',
            perCapitaConsumptionLbs: 11,
            annualVolMillionMetricTons: 2,
            onePercentMarketShareMetricTons: 16500,
            dailyDemandMetricTons: 45,
            maturityPeriodDays: 70,
            plantSpacingMeters: '0.7X0.7',
            plantsInHalfAcre: 4000,
            producePerPlantLbs: 2.5,
            storeBuyingPerLb: 2,
            revenuePerSeason: 20000,
            farmerRevenuePerYear: 60000,
            averageEarningsPerMonth: 5000,
            farmerShare40Percent: 24000,
            serviceProviderShare40Percent: 24000,
            gokTax20Percent: 12000,
            farmerEarningPerMonth: 2000,
          },
          {
            cropName: 'Cabbage',
            perCapitaConsumptionLbs: 6,
            annualVolMillionMetricTons: 1,
            onePercentMarketShareMetricTons: 9000,
            dailyDemandMetricTons: 25,
            maturityPeriodDays: 90,
            plantSpacingMeters: '0.5X0.5',
            plantsInHalfAcre: 8000,
            producePerPlantLbs: 1.5,
            storeBuyingPerLb: 1,
            revenuePerSeason: 12000,
            farmerRevenuePerYear: 36000,
            averageEarningsPerMonth: 3000,
            farmerShare40Percent: 14400,
            serviceProviderShare40Percent: 14400,
            gokTax20Percent: 7200,
            farmerEarningPerMonth: 1200,
          },
          {
            cropName: 'Broccoli',
            perCapitaConsumptionLbs: 6,
            annualVolMillionMetricTons: 1,
            onePercentMarketShareMetricTons: 9000,
            dailyDemandMetricTons: 25,
            maturityPeriodDays: 75,
            plantSpacingMeters: '0.5X0.5',
            plantsInHalfAcre: 8000,
            producePerPlantLbs: 1,
            storeBuyingPerLb: 2,
            revenuePerSeason: 16000,
            farmerRevenuePerYear: 48000,
            averageEarningsPerMonth: 4000,
            farmerShare40Percent: 19200,
            serviceProviderShare40Percent: 19200,
            gokTax20Percent: 9600,
            farmerEarningPerMonth: 1600,
          },
          {
            cropName: 'Green onion',
            perCapitaConsumptionLbs: 12,
            annualVolMillionMetricTons: 2,
            onePercentMarketShareMetricTons: 18000,
            dailyDemandMetricTons: 49,
            maturityPeriodDays: 50,
            plantSpacingMeters: '0.25X0.25',
            plantsInHalfAcre: 32000,
            producePerPlantLbs: 0.03,
            storeBuyingPerLb: 10,
            revenuePerSeason: 9600,
            farmerRevenuePerYear: 28800,
            averageEarningsPerMonth: 2400,
            farmerShare40Percent: 11520,
            serviceProviderShare40Percent: 11520,
            gokTax20Percent: 5760,
            farmerEarningPerMonth: 960,
          },
          {
            cropName: 'Potato',
            perCapitaConsumptionLbs: 29,
            annualVolMillionMetricTons: 4,
            onePercentMarketShareMetricTons: 43500,
            dailyDemandMetricTons: 119,
            maturityPeriodDays: 90,
            plantSpacingMeters: '0.7X0.7',
            plantsInHalfAcre: 4000,
            producePerPlantLbs: 2.5,
            storeBuyingPerLb: 0.5,
            revenuePerSeason: 5000,
            farmerRevenuePerYear: 15000,
            averageEarningsPerMonth: 1250,
            farmerShare40Percent: 6000,
            serviceProviderShare40Percent: 6000,
            gokTax20Percent: 3000,
            farmerEarningPerMonth: 500,
          },
        ];
        app.logger.info({ count: cropMatrix.length }, 'Crop matrix fetched');
        return cropMatrix;
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch crop matrix');
        throw error;
      }
    }
  );
}
