import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

export function registerUserRoutes(app: App) {
  app.fastify.post('/api/users/register', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info(
      {
        userType: (request.body as any).userType,
        county: (request.body as any).county,
      },
      'Registering new user'
    );

    try {
      const body = request.body as {
        userType: string;
        email?: string;
        phone?: string;
        firstName: string;
        lastName: string;
        dateOfBirth?: string;
        idNumber?: string;
        county: string;
        subCounty: string;
        ward: string;
        addressLat?: number;
        addressLng?: number;
        farmAcreage?: number;
        cropType?: string;
        organizationName?: string;
        coreMandate?: string;
        workIdFrontUrl?: string;
        workIdBackUrl?: string;
      };

      const result = await app.db
        .insert(schema.users)
        .values({
          userType: body.userType,
          email: body.email || null,
          phone: body.phone || null,
          firstName: body.firstName,
          lastName: body.lastName,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth).toISOString().split('T')[0] : null,
          idNumber: body.idNumber || null,
          county: body.county,
          subCounty: body.subCounty,
          ward: body.ward,
          addressLat: body.addressLat ? body.addressLat.toString() : null,
          addressLng: body.addressLng ? body.addressLng.toString() : null,
          farmAcreage: body.farmAcreage ? body.farmAcreage.toString() : null,
          cropType: body.cropType || null,
          organizationName: body.organizationName || null,
          coreMandate: body.coreMandate || null,
          workIdFrontUrl: body.workIdFrontUrl || null,
          workIdBackUrl: body.workIdBackUrl || null,
        })
        .returning();

      app.logger.info({ userId: result[0].id }, 'User registered successfully');
      return { user: result[0] };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to register user');
      throw error;
    }
  });

  app.fastify.get('/api/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    app.logger.info({ userId: id }, 'Fetching user');

    try {
      const user = await app.db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });

      if (!user) {
        app.logger.warn({ userId: id }, 'User not found');
        return reply.status(404).send({ error: 'User not found' });
      }

      app.logger.info({ userId: id }, 'User fetched successfully');
      return { user };
    } catch (error) {
      app.logger.error({ err: error, userId: id }, 'Failed to fetch user');
      throw error;
    }
  });

  app.fastify.put('/api/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    app.logger.info({ userId: id }, 'Updating user');

    try {
      const body = request.body as {
        cropType?: string;
        farmAcreage?: number;
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
      };

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (body.cropType !== undefined) updateData.cropType = body.cropType;
      if (body.farmAcreage !== undefined) updateData.farmAcreage = body.farmAcreage.toString();
      if (body.email !== undefined) updateData.email = body.email;
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.firstName !== undefined) updateData.firstName = body.firstName;
      if (body.lastName !== undefined) updateData.lastName = body.lastName;

      const result = await app.db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, id))
        .returning();

      if (!result.length) {
        app.logger.warn({ userId: id }, 'User not found for update');
        return reply.status(404).send({ error: 'User not found' });
      }

      app.logger.info({ userId: id }, 'User updated successfully');
      return { user: result[0] };
    } catch (error) {
      app.logger.error({ err: error, userId: id }, 'Failed to update user');
      throw error;
    }
  });

  app.fastify.put('/api/users/:id/complete-registration', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    app.logger.info({ userId: id }, 'Completing user registration');

    try {
      const result = await app.db
        .update(schema.users)
        .set({
          registrationCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, id))
        .returning();

      if (!result.length) {
        app.logger.warn({ userId: id }, 'User not found for registration completion');
        return reply.status(404).send({ error: 'User not found' });
      }

      app.logger.info({ userId: id }, 'User registration completed');
      return { user: result[0] };
    } catch (error) {
      app.logger.error({ err: error, userId: id }, 'Failed to complete user registration');
      throw error;
    }
  });
}
