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
import { NotFound } from '../views/NotFound.js';

export const agentsRoutes = new Hono();

agentsRoutes.get('/', (c) => {
  return c.html(<AgentsList agents={listAgents()} />);
});

agentsRoutes.get('/:id', (c) => {
  const id = c.req.param('id');
  const agent = getAgent(id);
  if (!agent) {
    return c.html(<NotFound />, 404);
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
