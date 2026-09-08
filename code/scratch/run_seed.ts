import { seedIfEmpty } from '../server/db/seed.ts';

console.log('Running seedIfEmpty...');
seedIfEmpty();
console.log('Seed completed successfully with English dataset.');
