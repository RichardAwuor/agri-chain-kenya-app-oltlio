import type { FastifyRequest, FastifyReply } from 'fastify';
import type { App } from '../index.js';

export function registerUploadRoutes(app: App) {
  app.fastify.post('/api/upload/work-id', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Uploading work ID image');

    try {
      const data = await request.file();
      if (!data) {
        app.logger.warn({}, 'No file provided for work ID upload');
        return reply.status(400).send({ error: 'No file provided' });
      }

      const buffer = await data.toBuffer();
      const key = `work-ids/${Date.now()}-${data.filename}`;

      // Upload file
      const uploadedKey = await app.storage.upload(key, buffer);

      // Generate signed URL
      const { url } = await app.storage.getSignedUrl(uploadedKey);

      app.logger.info({ filename: data.filename, key: uploadedKey }, 'Work ID image uploaded successfully');
      return { url, filename: data.filename };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to upload work ID image');
      throw error;
    }
  });

  app.fastify.post('/api/upload/visit-photo', async (request: FastifyRequest, reply: FastifyReply) => {
    app.logger.info({}, 'Uploading visit photo');

    try {
      const data = await request.file();
      if (!data) {
        app.logger.warn({}, 'No file provided for visit photo upload');
        return reply.status(400).send({ error: 'No file provided' });
      }

      const buffer = await data.toBuffer();
      const key = `visit-photos/${Date.now()}-${data.filename}`;

      // Upload file
      const uploadedKey = await app.storage.upload(key, buffer);

      // Generate signed URL
      const { url } = await app.storage.getSignedUrl(uploadedKey);

      app.logger.info({ filename: data.filename, key: uploadedKey }, 'Visit photo uploaded successfully');
      return { url, filename: data.filename };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to upload visit photo');
      throw error;
    }
  });
}
