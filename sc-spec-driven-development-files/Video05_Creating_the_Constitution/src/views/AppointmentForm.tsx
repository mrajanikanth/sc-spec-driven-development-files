export type AppointmentFormValues = {
  ailmentId?: string;
  therapyId?: string;
  scheduledAt?: string;
  notes?: string;
};

export type AppointmentFormErrors = Partial<
  Record<'ailmentId' | 'therapyId' | 'scheduledAt', string>
>;

export type AppointmentFormProps = {
  actionPath: string;
  ailmentOptions: Array<{ id: string; name: string }>;
  therapyOptions: Array<{ id: string; name: string }>;
  values?: AppointmentFormValues;
  errors?: AppointmentFormErrors;
};

// Inline-error pattern: <small id="x-error"> renders inside the <label>
// directly after the form control. CSS in public/styles.css picks it up via
// [aria-invalid='true'] + small, and the field references it via
// aria-describedby so screen readers announce the message.
export function AppointmentForm({
  actionPath,
  ailmentOptions,
  therapyOptions,
  values,
  errors,
}: AppointmentFormProps) {
  return (
    <form method="post" action={actionPath}>
      <label>
        Ailment
        <select
          name="ailmentId"
          required
          aria-invalid={errors?.ailmentId ? 'true' : undefined}
          aria-describedby={errors?.ailmentId ? 'ailmentId-error' : undefined}
        >
          <option value="" selected={!values?.ailmentId}>
            Choose an ailment…
          </option>
          {ailmentOptions.map((a) => (
            <option value={a.id} selected={values?.ailmentId === a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {errors?.ailmentId && <small id="ailmentId-error">{errors.ailmentId}</small>}
      </label>

      <label>
        Therapy
        <select
          name="therapyId"
          required
          aria-invalid={errors?.therapyId ? 'true' : undefined}
          aria-describedby={errors?.therapyId ? 'therapyId-error' : undefined}
        >
          <option value="" selected={!values?.therapyId}>
            Choose a therapy…
          </option>
          {therapyOptions.map((t) => (
            <option value={t.id} selected={values?.therapyId === t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {errors?.therapyId && <small id="therapyId-error">{errors.therapyId}</small>}
      </label>

      <label>
        When
        <input
          type="datetime-local"
          name="scheduledAt"
          required
          value={values?.scheduledAt ?? ''}
          aria-invalid={errors?.scheduledAt ? 'true' : undefined}
          aria-describedby={errors?.scheduledAt ? 'scheduledAt-error' : undefined}
        />
        {errors?.scheduledAt && <small id="scheduledAt-error">{errors.scheduledAt}</small>}
      </label>

      <label>
        Notes (optional)
        <textarea name="notes" rows={3} maxlength={1000}>
          {values?.notes ?? ''}
        </textarea>
      </label>

      <button type="submit">Book appointment</button>
    </form>
  );
}
