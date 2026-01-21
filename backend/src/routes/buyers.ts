import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, lte } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { isValidPaidEmailDomain, emailsMatch, lbsToKg, kgToLbs } from '../utils/validation.js';

const CROP_PRICE_PER_LB = 2; // $2/lb for all crops

export function registerBuyerRoutes(app: App) {
  // Register buyer
  app.fastify.post('/api/buyers/register', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Buyer registration initiated');

    try {
      // Parse multipart form data
      const parts = request.parts();
      const formFields: Record<string, string> = {};
      let workIdFrontFile: any = null;
      let workIdBackFile: any = null;

      // Iterate through all parts (fields and files)
      for await (const part of parts) {
        if (part.type === 'field') {
          // Handle form fields
          formFields[part.fieldname] = String(part.value);
        } else if (part.type === 'file') {
          // Handle file uploads
          if (part.fieldname === 'workIdFront') {
            workIdFrontFile = part;
          } else if (part.fieldname === 'workIdBack') {
            workIdBackFile = part;
          }
        }
      }

      // Validate required fields
      if (!formFields.email || !formFields.firstName || !formFields.lastName) {
        app.logger.warn({}, 'Missing required form fields for buyer registration');
        return reply.status(400).send({ error: 'Missing required form fields' });
      }

      // Validate email domain
      if (!isValidPaidEmailDomain(formFields.email)) {
        app.logger.warn({ email: formFields.email }, 'Invalid email domain');
        return reply.status(400).send({ error: 'Email domain must be paid (not free)' });
      }

      // Validate emails match
      if (!emailsMatch(formFields.email, formFields.confirmEmail)) {
        app.logger.warn({}, 'Email confirmation mismatch');
        return reply.status(400).send({ error: 'Emails do not match' });
      }

      // Handle work ID file uploads (optional)
      let workIdFrontUrl: string | null = null;
      let workIdBackUrl: string | null = null;

      if (workIdFrontFile && workIdBackFile) {
        app.logger.info({ email: formFields.email }, 'Starting file uploads');

        // Upload work ID front file
        app.logger.debug({ filename: workIdFrontFile.filename }, 'Converting front file to buffer');
        const frontBuffer = await workIdFrontFile.toBuffer();
        app.logger.debug({ size: frontBuffer.length }, 'Front file buffer created');

        const frontKey = `work-ids/buyers/${Date.now()}-front-${workIdFrontFile.filename}`;
        app.logger.debug({ key: frontKey }, 'Uploading front file to storage');
        const uploadedFrontKey = await app.storage.upload(frontKey, frontBuffer);
        app.logger.debug({ uploadedKey: uploadedFrontKey }, 'Front file uploaded, getting signed URL');

        const frontUrlResult = await app.storage.getSignedUrl(uploadedFrontKey);
        workIdFrontUrl = frontUrlResult.url;
        app.logger.info({ workIdFront: frontKey }, 'Work ID front uploaded successfully');

        // Upload work ID back file
        app.logger.debug({ filename: workIdBackFile.filename }, 'Converting back file to buffer');
        const backBuffer = await workIdBackFile.toBuffer();
        app.logger.debug({ size: backBuffer.length }, 'Back file buffer created');

        const backKey = `work-ids/buyers/${Date.now()}-back-${workIdBackFile.filename}`;
        app.logger.debug({ key: backKey }, 'Uploading back file to storage');
        const uploadedBackKey = await app.storage.upload(backKey, backBuffer);
        app.logger.debug({ uploadedKey: uploadedBackKey }, 'Back file uploaded, getting signed URL');

        const backUrlResult = await app.storage.getSignedUrl(uploadedBackKey);
        workIdBackUrl = backUrlResult.url;
        app.logger.info({ workIdBack: backKey }, 'Work ID back uploaded successfully');
      } else if (workIdFrontFile || workIdBackFile) {
        app.logger.warn(
          { hasFront: !!workIdFrontFile, hasBack: !!workIdBackFile },
          'Both work ID files must be provided together if uploading'
        );
        return reply.status(400).send({ error: 'Both work ID front and back files must be provided together' });
      } else {
        app.logger.info({ email: formFields.email }, 'Work ID files not provided (optional)');
      }

      // Create buyer user
      const result = await app.db
        .insert(schema.users)
        .values({
          userType: 'buyer',
          email: formFields.email,
          firstName: formFields.firstName,
          lastName: formFields.lastName,
          organizationName: formFields.organizationName || null,
          county: 'N/A',
          subCounty: 'N/A',
          ward: 'N/A',
          mainOfficeAddress: formFields.mainOfficeAddress || null,
          officeState: formFields.officeState || null,
          officeCity: formFields.officeCity || null,
          officeZipCode: formFields.officeZipCode || null,
          deliveryAirport: formFields.deliveryAirport || null,
          workIdFrontUrl: workIdFrontUrl || null,
          workIdBackUrl: workIdBackUrl || null,
          registrationCompleted: true,
        })
        .returning();

      app.logger.info(
        {
          buyerId: result[0].id,
          email: formFields.email,
        },
        'Buyer registered successfully'
      );

      return {
        id: result[0].id,
        email: result[0].email,
        firstName: result[0].firstName,
        lastName: result[0].lastName,
        organizationName: result[0].organizationName,
        mainOfficeAddress: result[0].mainOfficeAddress,
        officeState: result[0].officeState,
        officeCity: result[0].officeCity,
        officeZipCode: result[0].officeZipCode,
        deliveryAirport: result[0].deliveryAirport,
        workIdFrontUrl: result[0].workIdFrontUrl,
        workIdBackUrl: result[0].workIdBackUrl,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to register buyer');
      throw error;
    }
  });

  // Create buyer order
  app.fastify.post('/api/buyers/orders', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      buyerId: string;
      cropType: string;
      volumeLbs: number;
      deliveryDate: string;
    };

    app.logger.info(
      {
        buyerId: body.buyerId,
        cropType: body.cropType,
        volumeLbs: body.volumeLbs,
      },
      'Creating buyer order'
    );

    try {
      // Get buyer details
      const buyer = await app.db.query.users.findFirst({
        where: eq(schema.users.id, body.buyerId),
      });

      if (!buyer) {
        app.logger.warn({ buyerId: body.buyerId }, 'Buyer not found');
        return reply.status(404).send({ error: 'Buyer not found' });
      }

      // Calculate invoice amount
      const estimatedInvoiceAmount = parseFloat((body.volumeLbs * CROP_PRICE_PER_LB).toFixed(2));
      const farmerPayment = parseFloat((estimatedInvoiceAmount * 0.4).toFixed(2));
      const serviceProviderPayment = parseFloat((estimatedInvoiceAmount * 0.4).toFixed(2));
      const gokPayment = parseFloat((estimatedInvoiceAmount * 0.2).toFixed(2));

      // Convert lbs to kg for storage
      const quantityKg = lbsToKg(body.volumeLbs);

      // Create order
      const result = await app.db
        .insert(schema.buyerOrders)
        .values({
          buyerId: body.buyerId,
          cropType: body.cropType,
          quantityKg: quantityKg.toString(),
          deliveryDate: new Date(body.deliveryDate).toISOString().split('T')[0],
          status: 'pending',
          estimatedInvoiceAmount: estimatedInvoiceAmount.toString(),
          farmerPayment: farmerPayment.toString(),
          serviceProviderPayment: serviceProviderPayment.toString(),
          gokPayment: gokPayment.toString(),
          deliveryAirport: buyer.deliveryAirport,
        })
        .returning();

      app.logger.info(
        {
          orderId: result[0].id,
          estimatedInvoiceAmount,
        },
        'Buyer order created successfully'
      );

      return {
        id: result[0].id,
        buyerId: result[0].buyerId,
        buyerOrganizationName: buyer.organizationName,
        buyerAddress: buyer.mainOfficeAddress,
        deliveryAirport: result[0].deliveryAirport,
        cropType: result[0].cropType,
        volumeLbs: body.volumeLbs,
        deliveryDate: result[0].deliveryDate,
        estimatedInvoiceAmount,
        farmerPayment,
        serviceProviderPayment,
        gokPayment,
      };
    } catch (error) {
      app.logger.error({ err: error, buyerId: body.buyerId }, 'Failed to create buyer order');
      throw error;
    }
  });

  // Get buyer orders
  app.fastify.get('/api/buyers/orders/:buyerId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { buyerId } = request.params as { buyerId: string };
    app.logger.info({ buyerId }, 'Fetching buyer orders');

    try {
      const orders = await app.db.query.buyerOrders.findMany({
        where: eq(schema.buyerOrders.buyerId, buyerId),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });

      // Convert to response format with lbs
      const enrichedOrders = orders.map((order) => ({
        id: order.id,
        cropType: order.cropType,
        volumeLbs: kgToLbs(parseFloat(order.quantityKg.toString())),
        deliveryDate: order.deliveryDate,
        estimatedInvoiceAmount: parseFloat(order.estimatedInvoiceAmount?.toString() || '0'),
        farmerPayment: parseFloat(order.farmerPayment?.toString() || '0'),
        serviceProviderPayment: parseFloat(order.serviceProviderPayment?.toString() || '0'),
        gokPayment: parseFloat(order.gokPayment?.toString() || '0'),
        createdAt: order.createdAt,
      }));

      app.logger.info({ buyerId, count: enrichedOrders.length }, 'Buyer orders fetched successfully');
      return enrichedOrders;
    } catch (error) {
      app.logger.error({ err: error, buyerId }, 'Failed to fetch buyer orders');
      throw error;
    }
  });

  // Buyer dashboard
  app.fastify.get('/api/buyers/dashboard/:buyerId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { buyerId } = request.params as { buyerId: string };
    const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

    app.logger.info({ buyerId }, 'Fetching buyer dashboard');

    try {
      // Get all service provider visits (could filter by service providers with matching crops)
      let whereClause = undefined;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        whereClause = and(
          gte(schema.serviceProviderVisits.visitDate, start),
          lte(schema.serviceProviderVisits.visitDate, end)
        );
      }

      const visits = await app.db.query.serviceProviderVisits.findMany({
        where: whereClause,
      });

      // Calculate estimated collections by crop and week
      const estimatedCollectionsByCrop: {
        cropType: string;
        weekNumber: number;
        volumeKg: number;
        volumeLbs: number;
      }[] = [];

      visits.forEach((visit) => {
        if (visit.collectedCropType && visit.collectionEstimationWeek && visit.collectedVolumeKg) {
          const volumeKg = parseFloat(visit.collectedVolumeKg.toString());
          estimatedCollectionsByCrop.push({
            cropType: visit.collectedCropType,
            weekNumber: visit.collectionEstimationWeek,
            volumeKg,
            volumeLbs: kgToLbs(volumeKg),
          });
        }
      });

      const dashboard = {
        estimatedCollectionsByCrop,
      };

      app.logger.info(
        {
          buyerId,
          collectionsCount: estimatedCollectionsByCrop.length,
        },
        'Buyer dashboard fetched successfully'
      );

      return dashboard;
    } catch (error) {
      app.logger.error({ err: error, buyerId }, 'Failed to fetch buyer dashboard');
      throw error;
    }
  });
}
