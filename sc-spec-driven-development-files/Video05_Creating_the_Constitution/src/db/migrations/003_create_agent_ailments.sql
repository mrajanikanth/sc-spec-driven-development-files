CREATE TABLE agent_ailments (
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  ailment_id TEXT NOT NULL REFERENCES ailments(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, ailment_id)
);
