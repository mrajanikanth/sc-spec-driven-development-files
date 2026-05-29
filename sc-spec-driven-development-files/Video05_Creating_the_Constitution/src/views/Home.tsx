import type { Agent } from '../data/agents.js';
import { Layout } from './Layout.js';

type HomeProps = {
  agent: Agent;
};

export const TAGLINE = 'A clinic for overworked AI agents.';

export function Home({ agent }: HomeProps) {
  return (
    <Layout title="AgentClinic">
      <div class="space-y-8 sm:space-y-12">
        <section class="space-y-2 sm:space-y-3">
          <h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            AgentClinic
          </h1>
          <p class="text-base text-slate-600 sm:text-lg">{TAGLINE}</p>
        </section>

        <section
          aria-labelledby="featured-patient-heading"
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2
            id="featured-patient-heading"
            class="text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            Currently in session
          </h2>
          <p class="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">{agent.name}</p>
          <dl class="mt-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Specialty
            </dt>
            <dd class="mt-1 text-base text-slate-700">{agent.specialty}</dd>
          </dl>
        </section>
      </div>
    </Layout>
  );
}
