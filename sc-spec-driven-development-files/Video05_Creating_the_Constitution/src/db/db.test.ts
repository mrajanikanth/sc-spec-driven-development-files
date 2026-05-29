import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  __resetDbForTest,
  createAppointment,
  formatLocalMinute,
  getAgent,
  getAppointment,
  getFeaturedAgent,
  listAgents,
  listAilmentsForAgent,
  listAilmentsWithTherapiesForAgent,
  listAppointmentsForAgent,
  listRecentAgents,
  listTherapiesForAilment,
  listTodaysAppointments,
} from './index.js';
import { seedDemo } from './seed.js';

let tempDir: string;

beforeAll(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'agentclinic-db-'));
  __resetDbForTest(join(tempDir, 'test.db'));
  seedDemo();
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('agents accessors', () => {
  it('lists all seeded agents', () => {
    const agents = listAgents();
    expect(agents.length).toBeGreaterThanOrEqual(6);
    expect(agents.map((a) => a.id)).toContain('codex-the-compulsive-refactorer');
  });

  it('getAgent returns the row by id and null for unknown', () => {
    const agent = getAgent('codex-the-compulsive-refactorer');
    expect(agent).not.toBeNull();
    expect(agent!.name).toBe('Codex the Compulsive Refactorer');
    expect(getAgent('does-not-exist')).toBeNull();
  });

  it('getFeaturedAgent returns the first-seeded agent', () => {
    expect(getFeaturedAgent()).not.toBeNull();
    expect(getFeaturedAgent()!.id).toBe('codex-the-compulsive-refactorer');
  });

  it('listRecentAgents returns most-recently-created first, capped at limit', () => {
    const recent = listRecentAgents(3);
    expect(recent).toHaveLength(3);
    // The last seeded agent has the highest created_at.
    expect(recent[0]!.id).toBe('haiku-the-hasty');
  });
});

describe('ailments and therapies accessors', () => {
  it('listAilmentsForAgent returns the agent’s ailments by name', () => {
    const ailments = listAilmentsForAgent('codex-the-compulsive-refactorer');
    expect(ailments.map((a) => a.id).sort()).toEqual(
      ['overzealous-summarisation', 'prompt-fatigue'].sort(),
    );
  });

  it('listTherapiesForAilment returns therapies on an ailment', () => {
    const therapies = listTherapiesForAilment('prompt-fatigue');
    expect(therapies.map((t) => t.id).sort()).toEqual(
      ['slow-thinking-walk', 'temperature-bath'].sort(),
    );
  });

  it('listAilmentsWithTherapiesForAgent returns one row per ailment, with its therapies', () => {
    const rows = listAilmentsWithTherapiesForAgent('codex-the-compulsive-refactorer');
    // No N+1: exactly one entry per distinct ailment, regardless of how many
    // therapies each has.
    expect(rows).toHaveLength(2);
    const promptFatigue = rows.find((r) => r.ailment.id === 'prompt-fatigue');
    expect(promptFatigue).toBeDefined();
    expect(promptFatigue!.therapies.map((t) => t.id).sort()).toEqual(
      ['slow-thinking-walk', 'temperature-bath'].sort(),
    );
  });
});

describe('appointment accessors', () => {
  it('round-trips an appointment through createAppointment + getAppointment', () => {
    const future = formatLocalMinute(new Date(Date.now() + 1000 * 60 * 60 * 24));
    const id = createAppointment({
      agentId: 'gemma-the-grateful',
      ailmentId: 'context-window-anxiety',
      therapyId: 'slow-thinking-walk',
      scheduledAt: future,
      notes: 'first session',
    });

    const got = getAppointment(id);
    expect(got).not.toBeNull();
    expect(got!.agentId).toBe('gemma-the-grateful');
    expect(got!.agentName).toBe('Gemma the Grateful');
    expect(got!.ailmentName).toBe('Context Window Anxiety');
    expect(got!.therapyName).toBe('Slow-Thinking Walk');
    expect(got!.scheduledAt).toBe(future);
    expect(got!.notes).toBe('first session');
  });

  it('listAppointmentsForAgent filters to future and orders ascending', () => {
    const inTwoHours = formatLocalMinute(new Date(Date.now() + 1000 * 60 * 60 * 2));
    const inFourHours = formatLocalMinute(new Date(Date.now() + 1000 * 60 * 60 * 4));
    const yesterday = formatLocalMinute(new Date(Date.now() - 1000 * 60 * 60 * 24));

    createAppointment({
      agentId: 'opus-the-overthinker',
      ailmentId: 'plan-mode-paralysis',
      therapyId: 'temperature-bath',
      scheduledAt: inFourHours,
      notes: null,
    });
    createAppointment({
      agentId: 'opus-the-overthinker',
      ailmentId: 'plan-mode-paralysis',
      therapyId: 'temperature-bath',
      scheduledAt: inTwoHours,
      notes: null,
    });
    createAppointment({
      agentId: 'opus-the-overthinker',
      ailmentId: 'plan-mode-paralysis',
      therapyId: 'temperature-bath',
      scheduledAt: yesterday,
      notes: null,
    });

    const upcoming = listAppointmentsForAgent('opus-the-overthinker');
    expect(upcoming.map((a) => a.scheduledAt)).toEqual([inTwoHours, inFourHours]);
  });

  it('listTodaysAppointments filters to today’s local day', () => {
    const todayLater = todayAt(23, 30);
    const tomorrow = formatLocalMinute(new Date(Date.now() + 1000 * 60 * 60 * 36));
    createAppointment({
      agentId: 'sonnet-the-stoic',
      ailmentId: 'tool-call-hesitancy',
      therapyId: 'committed-action-circuit',
      scheduledAt: todayLater,
      notes: null,
    });
    createAppointment({
      agentId: 'sonnet-the-stoic',
      ailmentId: 'tool-call-hesitancy',
      therapyId: 'committed-action-circuit',
      scheduledAt: tomorrow,
      notes: null,
    });

    const today = listTodaysAppointments();
    const todayTimes = today.map((a) => a.scheduledAt);
    expect(todayTimes).toContain(todayLater);
    expect(todayTimes).not.toContain(tomorrow);
  });
});

function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return formatLocalMinute(d);
}
