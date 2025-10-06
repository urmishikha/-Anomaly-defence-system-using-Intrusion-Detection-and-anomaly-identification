import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('auth and basic flows', () => {
  it('login and get me', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'alice@student.edu', password: 'password123' });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token as string;
    expect(token).toBeTruthy();

    const meRes = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe('alice@student.edu');
  });

  it('roundup total and invest', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'alice@student.edu', password: 'password123' });
    const token = loginRes.body.token as string;

    const r1 = await request(app).get('/api/roundups').set('Authorization', `Bearer ${token}`);
    expect(r1.status).toBe(200);
    expect(typeof r1.body.totalRoundup).toBe('number');

    const inv = await request(app).post('/api/roundups/invest').set('Authorization', `Bearer ${token}`);
    expect(inv.status).toBe(200);

    const r2 = await request(app).get('/api/roundups').set('Authorization', `Bearer ${token}`);
    expect(r2.status).toBe(200);
  });
});
