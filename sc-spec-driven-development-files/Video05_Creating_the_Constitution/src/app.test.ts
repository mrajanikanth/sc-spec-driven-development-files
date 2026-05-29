import { describe, expect, it } from 'vitest';
import { app } from './app.js';
import { getFeaturedAgent } from './data/agents.js';
import { TAGLINE } from './views/Home.js';

describe('GET /', () => {
  it('renders the AgentClinic home page', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);

    const body = await res.text();
    expect(body).toContain('AgentClinic');
    expect(body).toContain(TAGLINE);
    expect(body).toContain(getFeaturedAgent().name);
  });
});
