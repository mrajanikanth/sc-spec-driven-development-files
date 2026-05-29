import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  __clearAppointmentsForTest,
  __resetDbForTest,
  createAppointment,
  formatLocalMinute,
  listRecentAgents,
} from '../db/index.js';
import { seedDemo } from '../db/seed.js';

let tempDir: string;
let app: Awaited<typeof import('../app.js')>['app'];

beforeAll(async () => {
  tempDir = mkdtempSync(join(tmpdir(), 'agentclinic-dashboard-'));
  __resetDbForTest(join(tempDir, 'test.db'));
  seedDemo();
  ({ app } = await import('../app.js'));
});

beforeEach(() => {
  __clearAppointmentsForTest();
  seedDemo();
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return formatLocalMinute(d);
}

describe('GET /dashboard', () => {
  it('lists today’s appointments and the five most-recently-added agents', async () => {
    const scheduled = todayAt(23, 30);
    createAppointment({
      agentId: 'sonnet-the-stoic',
      ailmentId: 'tool-call-hesitancy',
      therapyId: 'committed-action-circuit',
      scheduledAt: scheduled,
      notes: null,
    });

    const res = await app.request('/dashboard');
    expect(res.status).toBe(200);
    const body = await res.text();

    expect(body).toContain('Today');
    expect(body).toContain('Sonnet the Stoic');
    expect(body).toContain('Committed-Action Circuit');

    expect(body).toContain('Recently added agents');
    for (const a of listRecentAgents(5)) {
      expect(body).toContain(a.name);
    }

    // The two sections sit inside a responsive split grid.
    expect(body).toMatch(/<div\s+class=["']split-grid["']/);
    expect(body).toMatch(/aria-current=["']page["'][\s\S]{0,200}Dashboard/);
  });

  it('renders explicit empty-state copy when there are no appointments today', async () => {
    // beforeEach clears appointments and re-seeds, so this test starts from
    // an empty appointments table regardless of what previous tests booked.
    const res = await app.request('/dashboard');
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('No appointments today.');
  });
});
