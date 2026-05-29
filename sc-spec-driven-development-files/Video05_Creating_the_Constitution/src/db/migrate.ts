import { listAgents } from './index.js';

// Importing any accessor triggers lazy connection + migration runner. Calling
// a cheap one here makes the script verify the DB is reachable before exiting.
listAgents();
console.log('Migrations applied.');
