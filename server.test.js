const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { once } = require('node:events');
const { createApp } = require('./server');

const listen = async (t) => {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  return request(server);
};

test('build-info returns metadata', async (t) => {
  const agent = await listen(t);
  const res = await agent.get('/build-info');
  assert.equal(res.status, 200);
  assert.equal(res.body.service, 'release-insights-api');
});
