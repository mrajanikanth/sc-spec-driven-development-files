import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { __resetDbForTest, getFeaturedAgent } from './db/index.js';
import { seedDemo } from './db/seed.js';
import { TAGLINE } from './views/Home.js';

let tempDir: string;

beforeAll(async () => {
  tempDir = mkdtempSync(join(tmpdir(), 'agentclinic-app-'));
  __resetDbForTest(join(tempDir, 'test.db'));
  seedDemo();
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

async function fetchHome() {
  // app.tsx must be imported *after* the DB has been pointed at the test
  // file, otherwise route handlers close over the wrong path.
  const { app } = await import('./app.js');
  return app.request('/');
}

describe('GET /', () => {
  it('renders the AgentClinic home page from seeded data', async () => {
    const res = await fetchHome();
    expect(res.status).toBe(200);

    const body = await res.text();
    expect(body).toContain('AgentClinic');
    expect(body).toContain(TAGLINE);

    const featured = getFeaturedAgent();
    expect(featured).not.toBeNull();
    expect(body).toContain(featured!.name);
  });

  it('ships the responsive contract from tech-stack.md (PicoCSS)', async () => {
    const body = await (await fetchHome()).text();

    expect(body).toMatch(
      /<meta\s+name=["']viewport["']\s+content=["'][^"']*width=device-width[^"']*["']/i,
    );
    // PicoCSS stylesheet link — proves the responsive styling layer reached
    // the page (replaces the old `sm:`-utility assertion).
    expect(body).toMatch(/<link[^>]+href=["']\/pico\.min\.css["']/);

    // No Tailwind-style utility tokens anywhere in the rendered markup.
    const tailwindTokens = /\bclass=["'][^"']*(?:\bsm:|\bmd:|\bpx-\d|\bpy-\d|\btext-\w+-\d)/;
    expect(body).not.toMatch(tailwindTokens);
  });

  it('renders the featured agent inside an <article>', async () => {
    const body = await (await fetchHome()).text();
    const featured = getFeaturedAgent();
    expect(featured).not.toBeNull();

    // The featured agent's name must appear inside an <article> (Pico styles
    // articles as cards by default — this is the visual contract that
    // replaces the Tailwind card classes).
    const articleRegex = new RegExp(
      `<article[\\s\\S]*?${escapeRegExp(featured!.name)}[\\s\\S]*?</article>`,
    );
    expect(body).toMatch(articleRegex);
  });
});

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
