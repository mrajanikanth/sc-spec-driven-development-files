import type {
  Agent,
  AilmentWithTherapies,
  AppointmentWithDetails,
} from '../db/index.js';
import { Layout } from './Layout.js';
import { AppointmentForm, type AppointmentFormProps } from './AppointmentForm.js';

type AgentDetailProps = {
  agent: Agent;
  ailments: AilmentWithTherapies[];
  upcomingAppointments: AppointmentWithDetails[];
  form: AppointmentFormProps;
};

function formatScheduledAt(iso: string): string {
  // scheduled_at is stored as the ISO string the browser submitted, which
  // parses as a local Date. We render it in the user's locale.
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return iso;
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AgentDetail({
  agent,
  ailments,
  upcomingAppointments,
  form,
}: AgentDetailProps) {
  return (
    <Layout title={`${agent.name} — AgentClinic`} currentPath="/agents">
      <hgroup>
        <h1>{agent.name}</h1>
        <p>
          <small>Specialty</small>
          <br />
          {agent.specialty}
        </p>
      </hgroup>

      <section aria-labelledby="ailments-heading">
        <h2 id="ailments-heading">Ailments</h2>
        {ailments.length === 0 ? (
          <article>
            <p>This agent isn't currently treating any ailments.</p>
          </article>
        ) : (
          ailments.map(({ ailment, therapies }) => (
            <article aria-labelledby={`ailment-${ailment.id}`}>
              <header>
                <h3 id={`ailment-${ailment.id}`}>{ailment.name}</h3>
                <p>{ailment.description}</p>
              </header>
              <h4>
                <small>Available therapies</small>
              </h4>
              {therapies.length === 0 ? (
                <p>
                  <em>No therapies on offer for this ailment yet.</em>
                </p>
              ) : (
                <ul>
                  {therapies.map((t) => (
                    <li>
                      <strong>{t.name}.</strong> {t.description}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))
        )}
      </section>

      <section aria-labelledby="book-heading">
        <h2 id="book-heading">Book an appointment</h2>
        <AppointmentForm {...form} />
      </section>

      <section aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading">Upcoming appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <p>
            <em>No upcoming appointments. Book one above.</em>
          </p>
        ) : (
          <ul>
            {upcomingAppointments.map((appt) => (
              <li>
                <strong>{formatScheduledAt(appt.scheduledAt)}</strong>
                {' — '}
                {appt.ailmentName}, treated with {appt.therapyName}.
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
