import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('returns 201 with v1 response (no header)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: `e2e-v1-${Date.now()}@test.com`, password: 'SecureP4ss' })
        .expect(201);

      expect(res.body).toMatchObject({ id: expect.any(String), email: expect.any(String) });
      expect(res.body.roles).toBeUndefined();
      expect(res.body.createdAt).toBeUndefined();
      createdUserId = res.body.id;
    });

    it('returns 201 with v2 response (X-SpheraX-Api-Version: 2)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .set('X-SpheraX-Api-Version', '2')
        .send({ email: `e2e-v2-${Date.now()}@test.com`, password: 'SecureP4ss' })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        roles: expect.any(Array),
        createdAt: expect.any(String),
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('returns 404 for unknown user', () => {
      return request(app.getHttpServer())
        .get('/api/users/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('returns v1 response for known user (no header)', async () => {
      if (!createdUserId) return;
      const res = await request(app.getHttpServer()).get(`/api/users/${createdUserId}`).expect(200);
      expect(res.body).toMatchObject({ id: createdUserId, email: expect.any(String) });
      expect(res.body.roles).toBeUndefined();
    });

    it('returns v2 response for known user (X-SpheraX-Api-Version: 2)', async () => {
      if (!createdUserId) return;
      const res = await request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .set('X-SpheraX-Api-Version', '2')
        .expect(200);
      expect(res.body).toMatchObject({
        id: createdUserId,
        email: expect.any(String),
        roles: expect.any(Array),
        createdAt: expect.any(String),
      });
    });
  });
});
