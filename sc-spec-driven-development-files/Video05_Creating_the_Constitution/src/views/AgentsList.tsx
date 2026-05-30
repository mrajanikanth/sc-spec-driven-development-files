import type { Agent } from '../db/index.js';
import { Layout } from './Layout.js';

type AgentsListProps = {
  agents: Agent[];
};

export function AgentsList({ agents }: AgentsListProps) {
  return (
    <Layout title="Agents — AgentClinic" currentPath="/agents">
      <hgroup>
        <h1>Agents</h1>
        <p>Every patient currently on the books at AgentClinic.</p>
      </hgroup>

      {agents.length === 0 ? (
        <article class="empty">
          <p>No agents on the books yet. The waiting room is suspiciously quiet.</p>
        </article>
      ) : (
        <div class="card-grid">
          {agents.map((agent) => (
            <article>
              <header>
                <h2>
                  <a href={`/agents/${agent.id}`}>{agent.name}</a>
                </h2>
                <p>
                  <small>Specialty</small>
                  <br />
                  {agent.specialty}
                </p>
              </header>
              <a href={`/agents/${agent.id}`} class="secondary">
                View chart →
              </a>
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
}
