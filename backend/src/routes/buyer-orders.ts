import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

export function registerBuyerOrderRoutes(app: App) {
  app.fastify.post('/api/buyer-orders', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      buyerId: string;
      cropType: string;
      quantityKg: number;
      deliveryDate: string;
    };

    app.logger.info(
      {
        buyerId: body.buyerId,
        cropType: body.cropType,
        quantityKg: body.quantityKg,
      },
      'Creating buyer order'
    );

    try {
      const result = await app.db
        .insert(schema.buyerOrders)
        .values({
          buyerId: body.buyerId,
          cropType: body.cropType,
          quantityKg: body.quantityKg.toString(),
          deliveryDate: new Date(body.deliveryDate).toISOString().split('T')[0],
          status: 'pending',
        })
        .returning();

      app.logger.info({ orderId: result[0].id }, 'Buyer order created successfully');
      return { order: result[0] };
    } catch (error) {
      app.logger.error({ err: error, buyerId: body.buyerId }, 'Failed to create buyer order');
      throw error;
    }
  });

  app.fastify.get('/api/buyer-orders/:buyerId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { buyerId } = request.params as { buyerId: string };
    app.logger.info({ buyerId }, 'Fetching buyer orders');

    try {
      const orders = await app.db.query.buyerOrders.findMany({
        where: eq(schema.buyerOrders.buyerId, buyerId),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });

      app.logger.info({ buyerId, count: orders.length }, 'Buyer orders fetched successfully');
      return orders;
    } catch (error) {
      app.logger.error({ err: error, buyerId }, 'Failed to fetch buyer orders');
      throw error;
    }
  });

  app.fastify.put('/api/buyer-orders/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    app.logger.info({ orderId: id }, 'Updating buyer order');

    try {
      const body = request.body as {
        status?: string;
        quantityKg?: number;
        deliveryDate?: string;
      };

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (body.status !== undefined) updateData.status = body.status;
      if (body.quantityKg !== undefined) updateData.quantityKg = body.quantityKg.toString();
      if (body.deliveryDate !== undefined)
        updateData.deliveryDate = new Date(body.deliveryDate).toISOString().split('T')[0];

      const result = await app.db
        .update(schema.buyerOrders)
        .set(updateData)
        .where(eq(schema.buyerOrders.id, id))
        .returning();

      if (!result.length) {
        app.logger.warn({ orderId: id }, 'Order not found for update');
        return reply.status(404).send({ error: 'Order not found' });
      }

      app.logger.info({ orderId: id }, 'Buyer order updated successfully');
      return { order: result[0] };
    } catch (error) {
      app.logger.error({ err: error, orderId: id }, 'Failed to update buyer order');
      throw error;
    }
  });
}
