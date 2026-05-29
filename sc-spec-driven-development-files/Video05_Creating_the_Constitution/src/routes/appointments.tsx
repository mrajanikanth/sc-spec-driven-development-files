import { Hono } from 'hono';
import {
  createAppointment,
  dedupeTherapies,
  getAgent,
  getAppointment,
  listAilmentsWithTherapiesForAgent,
  listAppointmentsForAgent,
} from '../db/index.js';
import { AgentDetail } from '../views/AgentDetail.js';
import { AppointmentConfirmation } from '../views/AppointmentConfirmation.js';
import { Layout } from '../views/Layout.js';
import type {
  AppointmentFormErrors,
  AppointmentFormValues,
} from '../views/AppointmentForm.js';

export const appointmentsRoutes = new Hono();

appointmentsRoutes.post('/agents/:id/appointments', async (c) => {
  const id = c.req.param('id');
  const agent = getAgent(id);
  if (!agent) {
    return c.html(
      <Layout title="Agent not found — AgentClinic" currentPath="/agents">
        <hgroup>
          <h1>Agent not found</h1>
          <p>No patient with id <code>{id}</code> on the books.</p>
        </hgroup>
        <p>
          <a href="/agents">← Back to the directory</a>
        </p>
      </Layout>,
      404,
    );
  }

  const form = await c.req.formData();
  const values: AppointmentFormValues = {
    ailmentId: stringOrUndefined(form.get('ailmentId')),
    therapyId: stringOrUndefined(form.get('therapyId')),
    scheduledAt: stringOrUndefined(form.get('scheduledAt')),
    notes: stringOrUndefined(form.get('notes')),
  };

  const ailments = listAilmentsWithTherapiesForAgent(id);
  const errors = validate(values, ailments);

  if (Object.keys(errors).length > 0) {
    return c.html(
      <AgentDetail
        agent={agent}
        ailments={ailments}
        upcomingAppointments={listAppointmentsForAgent(id)}
        form={{
          actionPath: `/agents/${id}/appointments`,
          ailmentOptions: ailments.map(({ ailment }) => ({
            id: ailment.id,
            name: ailment.name,
          })),
          therapyOptions: dedupeTherapies(ailments),
          values,
          errors,
        }}
      />,
      400,
    );
  }

  const newId = createAppointment({
    agentId: id,
    ailmentId: values.ailmentId!,
    therapyId: values.therapyId!,
    scheduledAt: values.scheduledAt!,
    notes: values.notes ?? null,
  });

  return c.redirect(`/appointments/${newId}`, 303);
});

appointmentsRoutes.get('/appointments/:id', (c) => {
  const id = c.req.param('id');
  const appointment = getAppointment(id);
  if (!appointment) {
    return c.html(
      <Layout title="Appointment not found — AgentClinic">
        <hgroup>
          <h1>Appointment not found</h1>
          <p>No appointment with id <code>{id}</code> on the books.</p>
        </hgroup>
        <p>
          <a href="/agents">← Back to the directory</a>
        </p>
      </Layout>,
      404,
    );
  }
  return c.html(<AppointmentConfirmation appointment={appointment} />);
});

function stringOrUndefined(v: FormDataEntryValue | null): string | undefined {
  if (v === null) return undefined;
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  return trimmed === '' ? undefined : trimmed;
}

function validate(
  values: AppointmentFormValues,
  ailments: ReturnType<typeof listAilmentsWithTherapiesForAgent>,
): AppointmentFormErrors {
  const errors: AppointmentFormErrors = {};

  if (!values.ailmentId) {
    errors.ailmentId = 'Pick an ailment to treat.';
  } else if (!ailments.some(({ ailment }) => ailment.id === values.ailmentId)) {
    errors.ailmentId = 'That ailment is not on this agent.';
  }

  if (!values.therapyId) {
    errors.therapyId = 'Pick a therapy.';
  } else if (!errors.ailmentId) {
    const chosenAilment = ailments.find(
      ({ ailment }) => ailment.id === values.ailmentId,
    );
    const therapyOnAilment = chosenAilment?.therapies.some(
      (t) => t.id === values.therapyId,
    );
    if (!therapyOnAilment) {
      errors.therapyId = 'That therapy is not offered for the chosen ailment.';
    }
  }

  if (!values.scheduledAt) {
    errors.scheduledAt = 'Pick a date and time.';
  } else {
    const scheduled = new Date(values.scheduledAt);
    if (Number.isNaN(scheduled.valueOf())) {
      errors.scheduledAt = 'That is not a recognisable date and time.';
    } else if (scheduled.valueOf() <= Date.now()) {
      errors.scheduledAt = 'Appointments must be scheduled in the future.';
    }
  }

  return errors;
}

