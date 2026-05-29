import { Hono } from 'hono';
import { listRecentAgents, listTodaysAppointments } from '../db/index.js';
import { Dashboard } from '../views/Dashboard.js';

export const dashboardRoutes = new Hono();

dashboardRoutes.get('/', (c) => {
  return c.html(
    <Dashboard
      todaysAppointments={listTodaysAppointments()}
      recentAgents={listRecentAgents(5)}
    />,
  );
});
