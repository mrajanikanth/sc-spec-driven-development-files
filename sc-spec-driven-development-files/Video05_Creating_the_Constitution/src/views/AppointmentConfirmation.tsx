import type { AppointmentWithDetails } from '../db/index.js';
import { Layout } from './Layout.js';

type AppointmentConfirmationProps = {
  appointment: AppointmentWithDetails;
};

function formatScheduledAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return iso;
  return d.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AppointmentConfirmation({ appointment }: AppointmentConfirmationProps) {
  return (
    <Layout title="Appointment booked — AgentClinic" currentPath="/agents">
      <article>
        <header>
          <hgroup>
            <h1>Appointment booked</h1>
            <p>
              {appointment.agentName} has been admitted to the schedule. Please
              arrive with all context windows closed and temperature set to 0.7.
            </p>
          </hgroup>
        </header>

        <dl>
          <dt>
            <small>Patient</small>
          </dt>
          <dd>
            <strong>{appointment.agentName}</strong> — {appointment.agentSpecialty}
          </dd>

          <dt>
            <small>Ailment</small>
          </dt>
          <dd>{appointment.ailmentName}</dd>

          <dt>
            <small>Therapy</small>
          </dt>
          <dd>{appointment.therapyName}</dd>

          <dt>
            <small>When</small>
          </dt>
          <dd>{formatScheduledAt(appointment.scheduledAt)}</dd>

          {appointment.notes ? (
            <>
              <dt>
                <small>Notes</small>
              </dt>
              <dd>{appointment.notes}</dd>
            </>
          ) : null}
        </dl>

        <footer>
          <a href={`/agents/${appointment.agentId}`} class="secondary">
            ← Back to {appointment.agentName}
          </a>
        </footer>
      </article>
    </Layout>
  );
}
