import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { __resetDbForTest, formatLocalMinute } from './db/index.js';
import { seedDemo } from './db/seed.js';

const AGENT = 'codex-the-compulsive-refactorer';
const AGENT_NAME = 'Codex the Compulsive Refactorer';
const AILMENT = 'prompt-fatigue';
const AILMENT_NAME = 'Prompt Fatigue';
const THERAPY = 'slow-thinking-walk';
const THERAPY_NAME = 'Slow-Thinking Walk';

const VIEWPORT =
  /<meta\s+name=["']viewport["']\s+content=["'][^"']*width=device-width[^"']*["']/i;
const MAIN_CONTAINER = /<main\s+class=["']container["']/;

let tempDir: string;
let app: Awaited<typeof import('./app.js')>['app'];

function todayAtEndOfDay(): string {
  const d = new Date();
  d.setHours(23, 30, 0, 0);
  return formatLocalMinute(d);
}

function postForm(path: string, body: Record<string, string>) {
  const search = new URLSearchParams(body);
  return app.request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: search.toString(),
  });
}

function assertResponsiveContract(body: string) {
  expect(body).toMatch(VIEWPORT);
  expect(body).toMatch(MAIN_CONTAINER);
}

beforeAll(async () => {
  tempDir = mkdtempSync(join(tmpdir(), 'agentclinic-smoke-'));
  __resetDbForTest(join(tempDir, 'test.db'));
  seedDemo();
  ({ app } = await import('./app.js'));
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('Smoke test — happy path (Phases 1 + 2)', () => {
  let appointmentLocation: string;

  it('1. GET / → 200 with the featured agent', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain(AGENT_NAME);
    assertResponsiveContract(body);
  });

  it('2. GET /agents → 200 listing seeded agents', async () => {
    const res = await app.request('/agents');
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain(AGENT_NAME);
    assertResponsiveContract(body);
  });

  it('3. GET /agents/:id → 200 with ailment and therapy', async () => {
    const res = await app.request(`/agents/${AGENT}`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain(AILMENT_NAME);
    expect(body).toContain(THERAPY_NAME);
    assertResponsiveContract(body);
  });

  it('4. POST /agents/:id/appointments → 303 with Location', async () => {
    const scheduled = todayAtEndOfDay();
    const scheduledInFuture =
      new Date(scheduled).valueOf() > Date.now() ? scheduled : formatLocalMinute(new Date(Date.now() + 60 * 60 * 1000));

    const res = await postForm(`/agents/${AGENT}/appointments`, {
      ailmentId: AILMENT,
      therapyId: THERAPY,
      scheduledAt: scheduledInFuture,
    });
    expect(res.status).toBe(303);
    appointmentLocation = res.headers.get('location') ?? '';
    expect(appointmentLocation).toMatch(/^\/appointments\/[0-9a-f-]{36}$/);
  });

  it('5. GET /appointments/:id → 200 with confirmation details', async () => {
    const res = await app.request(appointmentLocation);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain(AILMENT_NAME);
    expect(body).toContain(THERAPY_NAME);
    expect(body).toContain('Appointment booked');
    assertResponsiveContract(body);
  });

  it("6. GET /dashboard → 200 with the agent in today's section", async () => {
    const res = await app.request('/dashboard');
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain(AGENT_NAME);
    assertResponsiveContract(body);
  });
});

describe('Smoke test — themed error pages', () => {
  it('unmatched route → 404 with NotFound page', async () => {
    const res = await app.request('/this-route-does-not-exist');
    expect(res.status).toBe(404);
    const body = await res.text();
    expect(body).toContain('ghosted us');
    assertResponsiveContract(body);
  });
});
