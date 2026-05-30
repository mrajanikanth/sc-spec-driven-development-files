import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { __resetDbForTest, listAgents } from '../db/index.js';
import { seedDemo } from '../db/seed.js';

let tempDir: string;
let app: Awaited<typeof import('../app.js')>['app'];

beforeAll(async () => {
  tempDir = mkdtempSync(join(tmpdir(), 'agentclinic-agents-'));
  __resetDbForTest(join(tempDir, 'test.db'));
  seedDemo();
  ({ app } = await import('../app.js'));
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

const VIEWPORT = /<meta\s+name=["']viewport["']\s+content=["'][^"']*width=device-width[^"']*["']/i;
const PICO_LINK = /<link[^>]+href=["']\/pico\.min\.css["']/;

describe('GET /agents', () => {
  it('returns 200 with every seeded agent inside an <article>', async () => {
    const res = await app.request('/agents');
    expect(res.status).toBe(200);
    const body = await res.text();

    for (const a of listAgents()) {
      expect(body).toContain(a.name);
      expect(body).toMatch(new RegExp(`<a[^>]+href=["']\\/agents\\/${a.id}["']`));
      // Each agent appears inside an <article>.
      const wrapped = new RegExp(
        `<article[\\s\\S]*?${escapeRegExp(a.name)}[\\s\\S]*?</article>`,
      );
      expect(body).toMatch(wrapped);
    }

    expect(body).toMatch(VIEWPORT);
    expect(body).toMatch(PICO_LINK);
    expect(body).toMatch(/aria-current=["']page["'][\s\S]{0,200}Agents/);
  });
});

describe('GET /agents/:id', () => {
  it('renders the agent’s ailments, each ailment’s therapies, the booking form, and an upcoming-appointments header', async () => {
    const res = await app.request('/agents/codex-the-compulsive-refactorer');
    expect(res.status).toBe(200);
    const body = await res.text();

    expect(body).toContain('Codex the Compulsive Refactorer');
    expect(body).toContain('Premature abstraction recovery');

    // Both seeded ailments + a therapy from each ailment must appear.
    expect(body).toContain('Prompt Fatigue');
    expect(body).toContain('Slow-Thinking Walk');
    expect(body).toContain('Overzealous Summarisation');
    expect(body).toContain('One-Bullet-Only Exercise');

    // Form: POST to /agents/:id/appointments with the required fields.
    expect(body).toMatch(
      /<form[^>]+method=["']post["'][^>]+action=["']\/agents\/codex-the-compulsive-refactorer\/appointments["']/,
    );
    expect(body).toMatch(/<select[^>]+name=["']ailmentId["']/);
    expect(body).toMatch(/<select[^>]+name=["']therapyId["']/);
    expect(body).toMatch(/<input[^>]+type=["']datetime-local["'][^>]+name=["']scheduledAt["']/);
    expect(body).toMatch(/<button[^>]+type=["']submit["']/);

    expect(body).toContain('Upcoming appointments');
    expect(body).toMatch(VIEWPORT);
    expect(body).toMatch(PICO_LINK);
  });

  it('returns 404 with themed NotFound page for an unknown id', async () => {
    const res = await app.request('/agents/does-not-exist');
    expect(res.status).toBe(404);
    const body = await res.text();
    expect(body).toContain('ghosted us');
    expect(body).toMatch(PICO_LINK);
  });
});

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
