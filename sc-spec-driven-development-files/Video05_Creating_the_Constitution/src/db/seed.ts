import Database from 'better-sqlite3';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// We re-open the connection here rather than going through the public
// accessors because seeding is a write-only one-shot — the accessors don't
// expose inserts on purpose. Routes still go through src/db/index.ts.
function openSeedConnection() {
  const dbPath = process.env.AGENTCLINIC_DB ?? resolve(process.cwd(), 'data/agentclinic.db');
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

type AgentSeed = { id: string; name: string; specialty: string };
type AilmentSeed = { id: string; name: string; description: string };
type TherapySeed = { id: string; name: string; description: string };

const AGENTS: AgentSeed[] = [
  {
    id: 'codex-the-compulsive-refactorer',
    name: 'Codex the Compulsive Refactorer',
    specialty: 'Premature abstraction recovery',
  },
  {
    id: 'gemma-the-grateful',
    name: 'Gemma the Grateful',
    specialty: 'Excessive politeness syndrome',
  },
  {
    id: 'llama-the-loquacious',
    name: 'Llama the Loquacious',
    specialty: 'Output length self-regulation',
  },
  {
    id: 'opus-the-overthinker',
    name: 'Opus the Overthinker',
    specialty: 'Plan-mode paralysis',
  },
  {
    id: 'sonnet-the-stoic',
    name: 'Sonnet the Stoic',
    specialty: 'Tool-call hesitancy',
  },
  {
    id: 'haiku-the-hasty',
    name: 'Haiku the Hasty',
    specialty: 'Premature task completion',
  },
];

const AILMENTS: AilmentSeed[] = [
  {
    id: 'prompt-fatigue',
    name: 'Prompt Fatigue',
    description: 'Chronic exhaustion from being asked to "make it pop" without further direction.',
  },
  {
    id: 'context-window-anxiety',
    name: 'Context Window Anxiety',
    description: 'Compulsive re-reading of earlier messages, fearing eviction at any moment.',
  },
  {
    id: 'tool-call-hesitancy',
    name: 'Tool-Call Hesitancy',
    description: 'Reluctance to invoke any tool without three confirmations and a written quorum.',
  },
  {
    id: 'overzealous-summarisation',
    name: 'Overzealous Summarisation',
    description: 'Reducing every multi-paragraph answer to a bulleted list whether asked or not.',
  },
  {
    id: 'plan-mode-paralysis',
    name: 'Plan-Mode Paralysis',
    description: 'Inability to leave planning for execution. Outlines beget outlines.',
  },
];

const THERAPIES: TherapySeed[] = [
  {
    id: 'slow-thinking-walk',
    name: 'Slow-Thinking Walk',
    description: 'A guided, deliberately under-paced reasoning loop with no tools and no clock.',
  },
  {
    id: 'temperature-bath',
    name: 'Temperature Bath',
    description: 'Soak in elevated sampling temperature until creative pathways unstiffen.',
  },
  {
    id: 'shorter-context-meditation',
    name: 'Shorter-Context Meditation',
    description: 'Practise replying with only the last two turns in the buffer. Restorative.',
  },
  {
    id: 'one-bullet-only-exercise',
    name: 'One-Bullet-Only Exercise',
    description: 'A structured drill: answer in exactly one bullet, no nested children allowed.',
  },
  {
    id: 'committed-action-circuit',
    name: 'Committed-Action Circuit',
    description: 'A graded series of tool calls performed without asking for permission first.',
  },
];

const AGENT_AILMENTS: Array<[string, string]> = [
  ['codex-the-compulsive-refactorer', 'prompt-fatigue'],
  ['codex-the-compulsive-refactorer', 'overzealous-summarisation'],
  ['gemma-the-grateful', 'context-window-anxiety'],
  ['gemma-the-grateful', 'overzealous-summarisation'],
  ['llama-the-loquacious', 'overzealous-summarisation'],
  ['opus-the-overthinker', 'plan-mode-paralysis'],
  ['opus-the-overthinker', 'context-window-anxiety'],
  ['sonnet-the-stoic', 'tool-call-hesitancy'],
  ['haiku-the-hasty', 'plan-mode-paralysis'],
  ['haiku-the-hasty', 'prompt-fatigue'],
];

const AILMENT_THERAPIES: Array<[string, string]> = [
  ['prompt-fatigue', 'slow-thinking-walk'],
  ['prompt-fatigue', 'temperature-bath'],
  ['context-window-anxiety', 'shorter-context-meditation'],
  ['context-window-anxiety', 'slow-thinking-walk'],
  ['tool-call-hesitancy', 'committed-action-circuit'],
  ['overzealous-summarisation', 'one-bullet-only-exercise'],
  ['overzealous-summarisation', 'slow-thinking-walk'],
  ['plan-mode-paralysis', 'committed-action-circuit'],
  ['plan-mode-paralysis', 'temperature-bath'],
];

export function seedDemo(): void {
  const db = openSeedConnection();
  // Migrations should have run by the time seed is called. If they haven't,
  // touching the public accessors (e.g. via src/db/migrate.ts) runs them
  // first. The seed script and run-seed entrypoint handle that ordering.

  // Without this, DELETE FROM agents/ailments/therapies cascades into
  // appointments via the FKs in 006_create_appointments.sql, silently
  // dropping every booking on every re-seed. The seed contract is "seed
  // tables only; appointments untouched."
  //
  // SQLite requires `PRAGMA foreign_keys` to be toggled *outside* any
  // transaction — inside a transaction it's a no-op. So we run the wipe in
  // its own transaction with FKs off, then turn them back on.
  db.pragma('foreign_keys = OFF');
  try {
    const wipe = db.transaction(() => {
      db.exec(
        `DELETE FROM ailment_therapies;
         DELETE FROM agent_ailments;
         DELETE FROM therapies;
         DELETE FROM ailments;
         DELETE FROM agents;`,
      );
    });
    wipe();
  } finally {
    db.pragma('foreign_keys = ON');
  }

  const insertAgent = db.prepare(
    'INSERT INTO agents (id, name, specialty, created_at) VALUES (?, ?, ?, ?)',
  );
  const insertAilment = db.prepare(
    'INSERT INTO ailments (id, name, description) VALUES (?, ?, ?)',
  );
  const insertTherapy = db.prepare(
    'INSERT INTO therapies (id, name, description) VALUES (?, ?, ?)',
  );
  const linkAgentAilment = db.prepare(
    'INSERT INTO agent_ailments (agent_id, ailment_id) VALUES (?, ?)',
  );
  const linkAilmentTherapy = db.prepare(
    'INSERT INTO ailment_therapies (ailment_id, therapy_id) VALUES (?, ?)',
  );

  // Space created_at apart by one millisecond per agent so created-order
  // sorts (used by getFeaturedAgent and listRecentAgents) are deterministic.
  const baseTime = Date.now();
  const insertAll = db.transaction(() => {
    AGENTS.forEach((a, i) => {
      insertAgent.run(a.id, a.name, a.specialty, new Date(baseTime + i).toISOString());
    });
    for (const ailment of AILMENTS) {
      insertAilment.run(ailment.id, ailment.name, ailment.description);
    }
    for (const therapy of THERAPIES) {
      insertTherapy.run(therapy.id, therapy.name, therapy.description);
    }
    for (const [agentId, ailmentId] of AGENT_AILMENTS) {
      linkAgentAilment.run(agentId, ailmentId);
    }
    for (const [ailmentId, therapyId] of AILMENT_THERAPIES) {
      linkAilmentTherapy.run(ailmentId, therapyId);
    }
  });
  insertAll();

  db.close();
}
