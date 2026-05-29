import type { Agent, AppointmentWithDetails } from '../db/index.js';
import { Layout } from './Layout.js';

type DashboardProps = {
  todaysAppointments: AppointmentWithDetails[];
  recentAgents: Agent[];
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return iso;
  return d.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function Dashboard({ todaysAppointments, recentAgents }: DashboardProps) {
  return (
    <Layout title="Dashboard — AgentClinic" currentPath="/dashboard">
      <hgroup>
        <h1>Dashboard</h1>
        <p>Today at the clinic, and who has joined the books recently.</p>
      </hgroup>

      <div class="split-grid">
        <section aria-labelledby="today-heading">
          <article>
            <header>
              <h2 id="today-heading">Today's appointments</h2>
            </header>
            {todaysAppointments.length === 0 ? (
              <p>
                <em>No appointments today.</em>
              </p>
            ) : (
              <ul>
                {todaysAppointments.map((appt) => (
                  <li>
                    <strong>{formatTime(appt.scheduledAt)}</strong>
                    {' — '}
                    <a href={`/agents/${appt.agentId}`}>{appt.agentName}</a>
                    {' for '}
                    {appt.ailmentName}
                    {', treated with '}
                    {appt.therapyName}.
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <section aria-labelledby="recent-heading">
          <article>
            <header>
              <h2 id="recent-heading">Recently added agents</h2>
            </header>
            {recentAgents.length === 0 ? (
              <p>
                <em>No agents on the books yet.</em>
              </p>
            ) : (
              <ul>
                {recentAgents.map((agent) => (
                  <li>
                    <a href={`/agents/${agent.id}`}>
                      <strong>{agent.name}</strong>
                    </a>
                    {' — '}
                    {agent.specialty}
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </div>
    </Layout>
  );
}
