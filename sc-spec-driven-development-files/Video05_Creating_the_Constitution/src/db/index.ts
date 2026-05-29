import Database from 'better-sqlite3';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export type Agent = {
  id: string;
  name: string;
  specialty: string;
  createdAt: string;
};

export type Ailment = {
  id: string;
  name: string;
  description: string;
};

export type Therapy = {
  id: string;
  name: string;
  description: string;
};

export type Appointment = {
  id: string;
  agentId: string;
  ailmentId: string;
  therapyId: string;
  scheduledAt: string;
  notes: string | null;
  createdAt: string;
};

export type AppointmentWithDetails = Appointment & {
  agentName: string;
  agentSpecialty: string;
  ailmentName: string;
  therapyName: string;
};

export type AilmentWithTherapies = {
  ailment: Ailment;
  therapies: Therapy[];
};

const DEFAULT_DB_PATH = resolve(process.cwd(), 'data/agentclinic.db');
const MIGRATIONS_DIR = resolve(process.cwd(), 'src/db/migrations');

let dbInstance: Database.Database | null = null;
let dbPath: string = process.env.AGENTCLINIC_DB ?? DEFAULT_DB_PATH;

function getDb(): Database.Database {
  if (dbInstance) return dbInstance;
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  dbInstance = db;
  return db;
}

function runMigrations(db: Database.Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS applied_migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`);

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const applied = new Set(
    (db.prepare('SELECT id FROM applied_migrations').all() as { id: string }[]).map((r) => r.id),
  );

  const insertApplied = db.prepare(
    'INSERT INTO applied_migrations (id, applied_at) VALUES (?, ?)',
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      insertApplied.run(file, new Date().toISOString());
    })();
  }
}

// Test-only: swap the DB to a different path and force re-open. Tests use a
// temp file per suite; production code never calls this. We also push the
// path into AGENTCLINIC_DB so the seed module (which opens its own connection
// using that env var) lands on the same file.
export function __clearAppointmentsForTest(): void {
  getDb().prepare('DELETE FROM appointments').run();
}

export function __resetDbForTest(newPath: string): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  dbPath = newPath;
  process.env.AGENTCLINIC_DB = newPath;
  // Force open + run migrations so the test sees a ready DB before any
  // other module (e.g. the seed) opens its own connection to the same file.
  getDb();
}

const AGENT_COLS =
  'id, name, specialty, created_at AS createdAt';

const AILMENT_COLS = 'id, name, description';

const THERAPY_COLS = 'id, name, description';

const APPOINTMENT_COLS =
  'id, agent_id AS agentId, ailment_id AS ailmentId, therapy_id AS therapyId, ' +
  'scheduled_at AS scheduledAt, notes, created_at AS createdAt';

export function listAgents(): Agent[] {
  return getDb()
    .prepare(`SELECT ${AGENT_COLS} FROM agents ORDER BY name ASC`)
    .all() as Agent[];
}

export function getAgent(id: string): Agent | null {
  const row = getDb()
    .prepare(`SELECT ${AGENT_COLS} FROM agents WHERE id = ?`)
    .get(id) as Agent | undefined;
  return row ?? null;
}

export function getFeaturedAgent(): Agent | null {
  const row = getDb()
    .prepare(
      `SELECT ${AGENT_COLS} FROM agents ORDER BY created_at ASC, id ASC LIMIT 1`,
    )
    .get() as Agent | undefined;
  return row ?? null;
}

export function listRecentAgents(limit = 5): Agent[] {
  return getDb()
    .prepare(`SELECT ${AGENT_COLS} FROM agents ORDER BY created_at DESC, id DESC LIMIT ?`)
    .all(limit) as Agent[];
}

export function listAilmentsForAgent(agentId: string): Ailment[] {
  return getDb()
    .prepare(
      `SELECT ${AILMENT_COLS}
       FROM ailments
       JOIN agent_ailments ON agent_ailments.ailment_id = ailments.id
       WHERE agent_ailments.agent_id = ?
       ORDER BY ailments.name ASC`,
    )
    .all(agentId) as Ailment[];
}

export function listTherapiesForAilment(ailmentId: string): Therapy[] {
  return getDb()
    .prepare(
      `SELECT ${THERAPY_COLS}
       FROM therapies
       JOIN ailment_therapies ON ailment_therapies.therapy_id = therapies.id
       WHERE ailment_therapies.ailment_id = ?
       ORDER BY therapies.name ASC`,
    )
    .all(ailmentId) as Therapy[];
}

// Flatten the per-ailment therapies into a single de-duplicated list sorted by
// name. Used to populate the booking form's therapy <select>, which shows the
// union across all of the agent's ailments (the form has no client JS, so the
// server validates the pairing on submit).
export function dedupeTherapies(
  ailments: AilmentWithTherapies[],
): Array<{ id: string; name: string }> {
  const seen = new Map<string, string>();
  for (const { therapies } of ailments) {
    for (const t of therapies) {
      if (!seen.has(t.id)) seen.set(t.id, t.name);
    }
  }
  return [...seen.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listAilmentsWithTherapiesForAgent(agentId: string): AilmentWithTherapies[] {
  type JoinedRow = {
    aId: string;
    aName: string;
    aDesc: string;
    tId: string | null;
    tName: string | null;
    tDesc: string | null;
  };

  const rows = getDb()
    .prepare(
      `SELECT
         a.id AS aId, a.name AS aName, a.description AS aDesc,
         t.id AS tId, t.name AS tName, t.description AS tDesc
       FROM ailments a
       JOIN agent_ailments aa ON aa.ailment_id = a.id
       LEFT JOIN ailment_therapies at ON at.ailment_id = a.id
       LEFT JOIN therapies t ON t.id = at.therapy_id
       WHERE aa.agent_id = ?
       ORDER BY a.name ASC, t.name ASC`,
    )
    .all(agentId) as JoinedRow[];

  const result: AilmentWithTherapies[] = [];
  const indexById = new Map<string, number>();
  for (const r of rows) {
    let idx = indexById.get(r.aId);
    if (idx === undefined) {
      idx = result.length;
      indexById.set(r.aId, idx);
      result.push({
        ailment: { id: r.aId, name: r.aName, description: r.aDesc },
        therapies: [],
      });
    }
    if (r.tId && r.tName !== null && r.tDesc !== null) {
      result[idx]!.therapies.push({ id: r.tId, name: r.tName, description: r.tDesc });
    }
  }
  return result;
}

export type CreateAppointmentInput = {
  agentId: string;
  ailmentId: string;
  therapyId: string;
  scheduledAt: string;
  notes?: string | null;
};

export function createAppointment(input: CreateAppointmentInput): string {
  const id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO appointments
         (id, agent_id, ailment_id, therapy_id, scheduled_at, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.agentId,
      input.ailmentId,
      input.therapyId,
      input.scheduledAt,
      input.notes ?? null,
      new Date().toISOString(),
    );
  return id;
}

const APPOINTMENT_WITH_DETAILS_SELECT =
  `SELECT
     ap.id, ap.agent_id AS agentId, ap.ailment_id AS ailmentId, ap.therapy_id AS therapyId,
     ap.scheduled_at AS scheduledAt, ap.notes, ap.created_at AS createdAt,
     ag.name AS agentName, ag.specialty AS agentSpecialty,
     ai.name AS ailmentName, th.name AS therapyName
   FROM appointments ap
   JOIN agents ag ON ag.id = ap.agent_id
   JOIN ailments ai ON ai.id = ap.ailment_id
   JOIN therapies th ON th.id = ap.therapy_id`;

export function getAppointment(id: string): AppointmentWithDetails | null {
  const row = getDb()
    .prepare(`${APPOINTMENT_WITH_DETAILS_SELECT} WHERE ap.id = ?`)
    .get(id) as AppointmentWithDetails | undefined;
  return row ?? null;
}

export function listAppointmentsForAgent(agentId: string): AppointmentWithDetails[] {
  const nowLocal = formatLocalMinute(new Date());
  return getDb()
    .prepare(
      `${APPOINTMENT_WITH_DETAILS_SELECT}
       WHERE ap.agent_id = ? AND ap.scheduled_at >= ?
       ORDER BY ap.scheduled_at ASC`,
    )
    .all(agentId, nowLocal) as AppointmentWithDetails[];
}

export function listTodaysAppointments(): AppointmentWithDetails[] {
  const { start, end } = localDayBounds(new Date());
  return getDb()
    .prepare(
      `${APPOINTMENT_WITH_DETAILS_SELECT}
       WHERE ap.scheduled_at >= ? AND ap.scheduled_at < ?
       ORDER BY ap.scheduled_at ASC`,
    )
    .all(start, end) as AppointmentWithDetails[];
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatLocalMinute(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localDayBounds(d: Date): { start: string; end: string } {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return { start: formatLocalMinute(start), end: formatLocalMinute(end) };
}
