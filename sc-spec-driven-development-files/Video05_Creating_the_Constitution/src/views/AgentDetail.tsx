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
        <hgroup>
          <h2 id="ailments-heading">Currently being treated for</h2>
        </hgroup>
        {ailments.length === 0 ? (
          <article class="empty">
            <p>This agent isn't currently treating any ailments.</p>
          </article>
        ) : (
          ailments.map(({ ailment, therapies }) => (
            <article aria-labelledby={`ailment-${ailment.id}`}>
              <header>
                <h3 id={`ailment-${ailment.id}`}>{ailment.name}</h3>
                <p>{ailment.description}</p>
              </header>
              <hgroup>
                <h4>Available therapies</h4>
              </hgroup>
              {therapies.length === 0 ? (
                <article class="empty">
                  <p>No therapies on offer for this ailment yet.</p>
                </article>
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
        <hgroup>
          <h2 id="book-heading">Book an appointment</h2>
        </hgroup>
        <AppointmentForm {...form} />
      </section>

      <section aria-labelledby="upcoming-heading">
        <hgroup>
          <h2 id="upcoming-heading">Upcoming appointments</h2>
        </hgroup>
        {upcomingAppointments.length === 0 ? (
          <article class="empty">
            <p>No upcoming appointments. Book one below.</p>
          </article>
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
