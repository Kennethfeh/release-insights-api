const express = require('express');

const createApp = () => {
  const app = express();
  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.get('/build-info', (_req, res) => {
    res.json({
      service: 'release-insights-api',
      commit: process.env.GIT_COMMIT || 'local',
      version: process.env.APP_VERSION || '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
  return app;
};

const port = process.env.PORT || 4100;

if (require.main === module) {
  const app = createApp();
  app.listen(port, () => {
    console.info(`Release insights API listening on ${port}`);
  });
}

module.exports = { createApp };
