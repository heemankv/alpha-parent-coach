import test from 'node:test';
import assert from 'node:assert/strict';
import { server, urgentConcern, urgentReply } from '../local-server.js';
import { POST } from '../api/coach.js';

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
    assert.match(reply.steps[0], /can't safely coach a crisis/i);
    assert.match(reply.checkIn, /safe/i);
  } finally {
    server.close();
  }
});

test('Vercel function keeps the crisis response ahead of the model', async () => {
  const response = await POST(new Request('https://example.com/api/coach', { method: 'POST', body: JSON.stringify({ message: 'My child wants to die' }) }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).urgent, true);
});

test('Ollama Cloud uses a server-side key and a cloud model', async () => {
  const oldOpenAI = process.env.OPENAI_API_KEY;
  const oldOllama = process.env.OLLAMA_API_KEY;
  const oldFetch = globalThis.fetch;
  delete process.env.OPENAI_API_KEY;
  process.env.OLLAMA_API_KEY = 'test-key';
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://ollama.com/api/chat');
      assert.equal(options.headers.Authorization, 'Bearer test-key');
      const request = JSON.parse(options.body);
      assert.equal(request.model, 'gemma4:31b');
      assert.equal(request.think, false);
      assert.equal(request.format, undefined);
      return { ok: true, json: async () => ({ message: { content: '{"urgent":false,"title":"A calm start","steps":["Listen first","Try one small step"],"checkIn":"How did it go?"}' } }) };
    };
    const { answer } = await import(`../local-server.js?cloud-test=${Date.now()}`);
    const result = await answer({ message: 'Bedtime has been hard.' });
    assert.equal(result.status, 200);
    assert.equal(result.payload.title, 'A calm start');
  } finally {
    globalThis.fetch = oldFetch;
    if (oldOpenAI === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = oldOpenAI;
    if (oldOllama === undefined) delete process.env.OLLAMA_API_KEY; else process.env.OLLAMA_API_KEY = oldOllama;
  }
});
