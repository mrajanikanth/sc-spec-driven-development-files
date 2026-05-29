import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { getFeaturedAgent } from './data/agents.js';
import { Home } from './views/Home.js';

export function createApp() {
  const app = new Hono();

  app.use('/styles.css', serveStatic({ path: './public/styles.css' }));
  app.use('/static/*', serveStatic({ root: './public' }));

  app.get('/', (c) => {
    const agent = getFeaturedAgent();
    return c.html(<Home agent={agent} />);
  });

  return app;
}

export const app = createApp();
