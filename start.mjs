import { createServer } from 'vite';
import fs from 'fs';

const log = (msg) => fs.appendFileSync('c:/Client/Bussiness/server_log2.txt', `${msg}\n`);

try {
  const server = await createServer({
    configFile: './vite.config.js',
    root: process.cwd(),
    server: { port: 5173, host: true }
  });
  await server.listen();
  server.printUrls();
  log('SERVER STARTED ON PORT 5173');
  
  // Keep alive
  setInterval(() => {}, 1000 * 60 * 60);
} catch (e) {
  log(`ERROR: ${e.message}\n${e.stack}`);
  process.exit(1);
}
