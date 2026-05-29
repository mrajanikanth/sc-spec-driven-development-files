CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  ailment_id TEXT NOT NULL REFERENCES ailments(id) ON DELETE CASCADE,
  therapy_id TEXT NOT NULL REFERENCES therapies(id) ON DELETE CASCADE,
  scheduled_at TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX appointments_by_agent ON appointments(agent_id, scheduled_at);
CREATE INDEX appointments_by_time ON appointments(scheduled_at);
