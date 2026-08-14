import { createServer } from 'node:http';

import { createApp } from './app.js';
import { getConfig } from './config/env.js';
import { closeDriver } from './db/driver.js';

const config = getConfig();
const httpServer = createServer(createApp({ config }));
let shuttingDown = false;

httpServer.listen(config.port, '0.0.0.0', () => {
  console.log(`PathForge server listening on 0.0.0.0:${config.port}`);
  if (!config.database.configured) {
    console.log('CognoDB is not configured; health will report not_configured.');
  }
});

httpServer.on('error', (error) => {
  console.error(`PathForge server failed: ${error.message}`);
  process.exitCode = 1;
});

async function shutDown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; closing PathForge cleanly.`);

  const forceExitTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out.');
    process.exitCode = 1;
    httpServer.closeAllConnections();
  }, 10_000);
  forceExitTimer.unref();

  httpServer.close(async (serverError) => {
    try {
      await closeDriver();
      if (serverError) {
        console.error(`HTTP shutdown failed: ${serverError.message}`);
        process.exitCode = 1;
      }
    } catch {
      console.error('The database driver did not close cleanly.');
      process.exitCode = 1;
    } finally {
      clearTimeout(forceExitTimer);
    }
  });
}

process.once('SIGINT', () => void shutDown('SIGINT'));
process.once('SIGTERM', () => void shutDown('SIGTERM'));
