import { Hono } from 'hono';
import {
  dedupeTherapies,
  getAgent,
  listAgents,
  listAilmentsWithTherapiesForAgent,
  listAppointmentsForAgent,
} from '../db/index.js';
import { AgentsList } from '../views/AgentsList.js';
import { AgentDetail } from '../views/AgentDetail.js';
import { Layout } from '../views/Layout.js';

export const agentsRoutes = new Hono();

agentsRoutes.get('/', (c) => {
  return c.html(<AgentsList agents={listAgents()} />);
});

agentsRoutes.get('/:id', (c) => {
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

  const ailments = listAilmentsWithTherapiesForAgent(id);
  const upcomingAppointments = listAppointmentsForAgent(id);

  return c.html(
    <AgentDetail
      agent={agent}
      ailments={ailments}
      upcomingAppointments={upcomingAppointments}
      form={{
        actionPath: `/agents/${id}/appointments`,
        ailmentOptions: ailments.map(({ ailment }) => ({
          id: ailment.id,
          name: ailment.name,
        })),
        therapyOptions: dedupeTherapies(ailments),
      }}
    />,
  );
});
