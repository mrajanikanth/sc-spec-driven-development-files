import { Layout } from './Layout.js';

export function ServerError() {
  return (
    <Layout title="Server error — AgentClinic">
      <article>
        <header>
          <hgroup>
            <h1>The clinic is briefly indisposed.</h1>
            <p>The on-call staff are looking into it.</p>
          </hgroup>
        </header>
        <p>
          <a href="/">← Back to home</a>
        </p>
      </article>
    </Layout>
  );
}
