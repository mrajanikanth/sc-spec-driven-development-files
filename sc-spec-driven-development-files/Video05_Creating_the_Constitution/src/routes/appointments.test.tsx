import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  __resetDbForTest,
  formatLocalMinute,
  getAppointment,
} from '../db/index.js';
import { seedDemo } from '../db/seed.js';

const AGENT = 'codex-the-compulsive-refactorer';
const AILMENT = 'prompt-fatigue';
const THERAPY_ON_AILMENT = 'slow-thinking-walk';
const THERAPY_NOT_ON_AILMENT = 'committed-action-circuit';
const AILMENT_NOT_ON_AGENT = 'tool-call-hesitancy';

let tempDir: string;
let app: Awaited<typeof import('../app.js')>['app'];

beforeAll(async () => {
  tempDir = mkdtempSync(join(tmpdir(), 'agentclinic-appts-'));
  __resetDbForTest(join(tempDir, 'test.db'));
  seedDemo();
  ({ app } = await import('../app.js'));
});

beforeEach(() => {
  // Each test re-seeds so previous appointments do not bleed into the next
  // test's "upcoming" list. seedDemo wipes the seed tables and re-inserts;
  // appointments cascade-delete via the agent FK.
  seedDemo();
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

function inOneDay(): string {
  return formatLocalMinute(new Date(Date.now() + 1000 * 60 * 60 * 24));
}

function yesterday(): string {
  return formatLocalMinute(new Date(Date.now() - 1000 * 60 * 60 * 24));
}

function postForm(path: string, body: Record<string, string>) {
  const search = new URLSearchParams(body);
  return app.request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: search.toString(),
  });
}

describe('POST /agents/:id/appointments — happy path', () => {
  it('303-redirects to /appointments/:id and persists the row', async () => {
    const scheduled = inOneDay();
    const res = await postForm(`/agents/${AGENT}/appointments`, {
      ailmentId: AILMENT,
      therapyId: THERAPY_ON_AILMENT,
      scheduledAt: scheduled,
      notes: 'first try',
    });
    expect(res.status).toBe(303);

    const location = res.headers.get('location');
    expect(location).toMatch(/^\/appointments\/[0-9a-f-]{36}$/);

    const id = location!.split('/').pop()!;
    const row = getAppointment(id);
    expect(row).not.toBeNull();
    expect(row!.agentId).toBe(AGENT);
    expect(row!.ailmentId).toBe(AILMENT);
    expect(row!.therapyId).toBe(THERAPY_ON_AILMENT);
    expect(row!.scheduledAt).toBe(scheduled);
    expect(row!.notes).toBe('first try');
  });
});

describe('GET /appointments/:id', () => {
  it('renders the confirmation with the agent, ailment, therapy, and time inside an <article>', async () => {
    const scheduled = inOneDay();
    const postRes = await postForm(`/agents/${AGENT}/appointments`, {
      ailmentId: AILMENT,
      therapyId: THERAPY_ON_AILMENT,
      scheduledAt: scheduled,
    });
    const id = postRes.headers.get('location')!.split('/').pop()!;

    const res = await app.request(`/appointments/${id}`);
    expect(res.status).toBe(200);
    const body = await res.text();

    expect(body).toContain('Appointment booked');
    expect(body).toContain('Codex the Compulsive Refactorer');
    expect(body).toContain('Prompt Fatigue');
    expect(body).toContain('Slow-Thinking Walk');
    // The confirmation copy sits inside an <article>.
    expect(body).toMatch(/<article[\s\S]*?Appointment booked[\s\S]*?<\/article>/);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await app.request('/appointments/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('POST /agents/:id/appointments — validation failures', () => {
  function expectInvalid(body: string, fieldName: string, errorFragment: string) {
    // The failing field gets aria-invalid="true" and an inline <small> error
    // appears in the body.
    const invalidRe = new RegExp(
      `name=["']${fieldName}["'][^>]*aria-invalid=["']true["']|aria-invalid=["']true["'][^>]*name=["']${fieldName}["']`,
    );
    expect(body).toMatch(invalidRe);
    expect(body).toContain(errorFragment);
  }

  it('missing ailmentId → 400, error rendered, scheduledAt preserved', async () => {
    const scheduled = inOneDay();
    const res = await postForm(`/agents/${AGENT}/appointments`, {
      ailmentId: '',
      therapyId: THERAPY_ON_AILMENT,
      scheduledAt: scheduled,
    });
    expect(res.status).toBe(400);
    const body = await res.text();
    expectInvalid(body, 'ailmentId', 'Pick an ailment');
    // The user's scheduledAt is rendered back into the input.
    expect(body).toMatch(
      new RegExp(`name=["']scheduledAt["'][^>]+value=["']${scheduled}["']`),
    );
  });

  it('missing therapyId → 400 with inline error', async () => {
    const res = await postForm(`/agents/${AGENT}/appointments`, {
      ailmentId: AILMENT,
      therapyId: '',
      scheduledAt: inOneDay(),
    });
    expect(res.status).toBe(400);
    expectInvalid(await res.text(), 'therapyId', 'Pick a therapy');
  });

  it('missing scheduledAt → 400 with inline error', async () => {
    const res = await postForm(`/agents/${AGENT}/appointments`, {
      ailmentId: AILMENT,
      therapyId: THERAPY_ON_AILMENT,
      scheduledAt: '',
    });
    expect(res.status).toBe(400);
    expectInvalid(await res.text(), 'scheduledAt', 'Pick a date and time');
  });

  it('therapyId not on chosen ailmentId → 400 with mismatch error', async () => {
    const res = await postForm(`/agents/${AGENT}/appointments`, {
      ailmentId: AILMENT,
      therapyId: THERAPY_NOT_ON_AILMENT,
      scheduledAt: inOneDay(),
    });
    expect(res.status).toBe(400);
    expectInvalid(
      await res.text(),
      'therapyId',
      'That therapy is not offered for the chosen ailment',
    );
  });

  it('ailmentId not on agent → 400 with mismatch error', async () => {
    const res = await postForm(`/agents/${AGENT}/appointments`, {
      ailmentId: AILMENT_NOT_ON_AGENT,
      therapyId: THERAPY_ON_AILMENT,
      scheduledAt: inOneDay(),
    });
    expect(res.status).toBe(400);
    expectInvalid(
      await res.text(),
      'ailmentId',
      'That ailment is not on this agent',
    );
  });

  it('scheduledAt in the past → 400 with future-only error', async () => {
    const res = await postForm(`/agents/${AGENT}/appointments`, {
      ailmentId: AILMENT,
      therapyId: THERAPY_ON_AILMENT,
      scheduledAt: yesterday(),
    });
    expect(res.status).toBe(400);
    expectInvalid(
      await res.text(),
      'scheduledAt',
      'Appointments must be scheduled in the future',
    );
  });
});
