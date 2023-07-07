import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ethers } from 'ethers';
import { AppModule } from '../src/app.module';

describe('Wallets (e2e)', () => {
  let app: INestApplication;
  let token: string;
  const email = `wallet_test_${Date.now()}@example.com`;
  const password = 'password123';
  const signer = ethers.Wallet.createRandom();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password });
    token = register.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/wallets (POST) rejects an invalid address', () => {
    return request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: 'not-an-address' })
      .expect(400);
  });

  it('/wallets (POST) adds a wallet', () => {
    return request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: signer.address, label: 'main' })
      .expect(201)
      .expect((res) => {
        expect(res.body.address).toBe(signer.address.toLowerCase());
        expect(res.body.verified).toBe(false);
      });
  });

  it('/wallets (POST) fails on duplicate address for same user', () => {
    return request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: signer.address })
      .expect(409);
  });

  it('/wallets (GET) lists wallets', () => {
    return request(app.getHttpServer())
      .get('/wallets')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(1);
      });
  });

  it('verify-message + verify confirms ownership by signature', async () => {
    const list = await request(app.getHttpServer())
      .get('/wallets')
      .set('Authorization', `Bearer ${token}`);
    const walletId = list.body[0].id;

    const messageRes = await request(app.getHttpServer())
      .get(`/wallets/${walletId}/verify-message`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const signature = await signer.signMessage(messageRes.body.message);

    return request(app.getHttpServer())
      .post(`/wallets/${walletId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ signature })
      .expect(201)
      .expect((res) => {
        expect(res.body.verified).toBe(true);
      });
  });

  it('/wallets/:id/verify (POST) fails with a wrong signature', async () => {
    const list = await request(app.getHttpServer())
      .get('/wallets')
      .set('Authorization', `Bearer ${token}`);
    const walletId = list.body[0].id;

    await request(app.getHttpServer())
      .get(`/wallets/${walletId}/verify-message`)
      .set('Authorization', `Bearer ${token}`);

    const otherSigner = ethers.Wallet.createRandom();
    const wrongSignature =
      await otherSigner.signMessage('some other message');

    return request(app.getHttpServer())
      .post(`/wallets/${walletId}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ signature: wrongSignature })
      .expect(400);
  });

  it('/wallets/:id (DELETE) is not allowed for a different user', async () => {
    const list = await request(app.getHttpServer())
      .get('/wallets')
      .set('Authorization', `Bearer ${token}`);
    const walletId = list.body[0].id;

    const other = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: `wallet_other_${Date.now()}@example.com`, password });

    return request(app.getHttpServer())
      .delete(`/wallets/${walletId}`)
      .set('Authorization', `Bearer ${other.body.accessToken}`)
      .expect(404);
  });
});
