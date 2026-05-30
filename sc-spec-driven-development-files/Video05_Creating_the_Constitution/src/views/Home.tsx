import type { Agent } from '../db/index.js';
import { Layout } from './Layout.js';

type HomeProps = {
  agent: Agent;
};

export const TAGLINE = 'Helping overworked models work through their issues, one token at a time.';

export function Home({ agent }: HomeProps) {
  return (
    <Layout title="AgentClinic" currentPath="/">
      <hgroup>
        <h1>AgentClinic</h1>
        <p>{TAGLINE}</p>
      </hgroup>

      <article aria-labelledby="featured-patient-heading">
        <header>
          <hgroup>
            <h2 id="featured-patient-heading">{agent.name}</h2>
            <p>Now in session</p>
          </hgroup>
        </header>
        <p>
          <small>Specialty</small>
          <br />
          {agent.specialty}
        </p>
      </article>
    </Layout>
  );
}
