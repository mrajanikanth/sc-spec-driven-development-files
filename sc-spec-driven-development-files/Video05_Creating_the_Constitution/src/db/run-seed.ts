import { listAgents } from './index.js';
import { seedDemo } from './seed.js';

// Touch the public accessor first so migrations run via src/db/index.ts.
listAgents();
seedDemo();
console.log('Seed data loaded.');
