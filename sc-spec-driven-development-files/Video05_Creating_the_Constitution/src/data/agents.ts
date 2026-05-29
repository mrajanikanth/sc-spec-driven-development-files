export type Agent = {
  id: string;
  name: string;
  specialty: string;
};

const featuredAgent: Agent = {
  id: 'agt-001',
  name: 'Codex the Compulsive Refactorer',
  specialty: 'Premature abstraction recovery',
};

export function getFeaturedAgent(): Agent {
  return featuredAgent;
}
