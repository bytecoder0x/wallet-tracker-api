import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) creates a user and returns a token', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });

  it('/auth/register (POST) fails on duplicate email', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(409);
  });

  it('/auth/login (POST) returns a token for correct credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });

  it('/auth/login (POST) fails on wrong password', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrongpass' })
      .expect(401);
  });

  it('/auth/nonce (GET) returns a nonce', () => {
    return request(app.getHttpServer())
      .get('/auth/nonce')
      .expect(200)
      .expect((res) => {
        expect(res.body.nonce).toBeDefined();
      });
  });

  it('/auth/siwe (POST) returns a token for a valid signature', async () => {
    const nonceRes = await request(app.getHttpServer()).get('/auth/nonce');
    const wallet = ethers.Wallet.createRandom();

    const siweMessage = new SiweMessage({
      domain: 'localhost',
      address: wallet.address,
      statement: 'Sign in to wallet-tracker',
      uri: 'http://localhost:3000',
      version: '1',
      chainId: 1,
      nonce: nonceRes.body.nonce,
    });
    const message = siweMessage.prepareMessage();
    const signature = await wallet.signMessage(message);

    return request(app.getHttpServer())
      .post('/auth/siwe')
      .send({ message, signature })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });

  it('/users/me (GET) requires auth', () => {
    return request(app.getHttpServer()).get('/users/me').expect(401);
  });

  it('/users/me (GET) returns profile with a valid token', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });

    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(email);
        expect(res.body.wallets).toBeDefined();
      });
  });
});
