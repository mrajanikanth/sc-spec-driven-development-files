import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { getFeaturedAgent } from './db/index.js';
import { Home } from './views/Home.js';
import { Layout } from './views/Layout.js';
import { agentsRoutes } from './routes/agents.js';
import { appointmentsRoutes } from './routes/appointments.js';
import { dashboardRoutes } from './routes/dashboard.js';

export function createApp() {
  const app = new Hono();

  app.use('/pico.min.css', serveStatic({ path: './public/pico.min.css' }));
  app.use('/styles.css', serveStatic({ path: './public/styles.css' }));

  app.get('/', (c) => {
    const agent = getFeaturedAgent();
    if (!agent) {
      return c.html(
        <Layout title="AgentClinic" currentPath="/">
          <hgroup>
            <h1>AgentClinic</h1>
            <p>The waiting room is empty. Run pnpm db:seed to admit some agents.</p>
          </hgroup>
        </Layout>,
      );
    }
    return c.html(<Home agent={agent} />);
  });

  app.route('/agents', agentsRoutes);
  app.route('/dashboard', dashboardRoutes);
  app.route('/', appointmentsRoutes);

  return app;
}

export const app = createApp();
