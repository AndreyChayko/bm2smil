import { createApp } from './app.js';
import { PORT } from './config.js';

/**
 * Server entry point — creates the app and starts listening on configured port.
 */
const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`bm2smil server running on http://localhost:${PORT}`);
});
