import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { IamGrpcClient } from '../src/infrastructure/grpc/clients/iam.grpc.client';
import { of } from 'rxjs';
import * as request from 'supertest';

describe('Notify E2E', () => {
  let app: INestApplication;
  const mockIamClient = { getUser: jest.fn(), onModuleInit: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(IamGrpcClient)
      .useValue(mockIamClient)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockIamClient.getUser.mockReturnValue(of({ id: 'uid-1', email: 'u@e.com', createdAt: '' }));
  });

  describe('POST /api/notifications', () => {
    it('returns 201 with v1 response (no header)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/notifications')
        .send({
          userId: '550e8400-e29b-41d4-a716-446655440001',
          channel: 'EMAIL',
          message: 'Hello',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        channel: 'EMAIL',
        status: expect.any(String),
      });
      expect(res.body.createdAt).toBeUndefined();
      expect(res.body.message).toBeUndefined();
    });

    it('returns 201 with v2 response (X-SpheraX-Api-Version: 2)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/notifications')
        .set('X-SpheraX-Api-Version', '2')
        .send({
          userId: '550e8400-e29b-41d4-a716-446655440002',
          channel: 'SMS',
          message: 'Hello v2',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        channel: 'SMS',
        status: expect.any(String),
        message: 'Hello v2',
        createdAt: expect.any(String),
      });
    });
  });
});
