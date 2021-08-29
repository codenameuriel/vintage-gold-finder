import * as path from 'path';
import * as url from 'url';

// create filepath and directory path
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const approotdir = __dirname;
