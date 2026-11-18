import test from 'node:test';
import assert from 'node:assert/strict';
import { server, urgentConcern, urgentReply } from '../server.js';

test('explicit safety concerns escalate in English and Urdu', () => {
  for (const text of ['My child wants to die', 'Someone abused my daughter', 'My son cannot breathe', 'My child is choking', 'This is an emergency', 'Someone hits my child', 'میرا بچہ خودکشی کی بات کرتا ہے', 'میرا بچہ بے ہوش ہے']) {
    assert.equal(urgentConcern(text), true, text);
    assert.equal(urgentReply(text).urgent, true);
  }
  assert.equal(urgentConcern('My child gets upset at bedtime'), false);
});

test('API validates input and escalates without a model key', async () => {
  await new Promise(resolve => server.listen(0, resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/coach`;
  try {
    const invalid = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '' }) });
    assert.equal(invalid.status, 400);
    const urgent = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'My child says she wants to die' }) });
    assert.equal(urgent.status, 200);
    const reply = await urgent.json();
    assert.equal(reply.urgent, true);
    assert.match(reply.checkIn, /safe/i);
  } finally {
    server.close();
  }
});
