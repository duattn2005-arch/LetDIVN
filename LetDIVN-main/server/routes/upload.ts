import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Images uploaded with the old on-page admin editor, served at /uploads/.
// Pages may still point at them; new images are uploaded through Decap.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
