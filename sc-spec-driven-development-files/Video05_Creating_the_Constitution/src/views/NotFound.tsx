import { Layout } from './Layout.js';

export function NotFound() {
  return (
    <Layout title="Not found — AgentClinic">
      <article>
        <header>
          <hgroup>
            <h1>This agent appears to have ghosted us.</h1>
            <p>We searched every ward and the waiting room. Nothing.</p>
          </hgroup>
        </header>
        <p>
          <a href="/">← Back to home</a>
          {' · '}
          <a href="/agents">All agents</a>
        </p>
      </article>
    </Layout>
  );
}
