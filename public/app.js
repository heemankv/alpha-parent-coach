const form = document.querySelector('#form');
const input = document.querySelector('#message');
const send = document.querySelector('#send');
const conversation = document.querySelector('#conversation');
const clear = document.querySelector('#clear');
let history = [];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function addUser(text) {
  const row = element('div', 'message-row user-row');
  const bubble = element('div', 'user-bubble', text);
  bubble.dir = 'auto';
  row.append(bubble);
  conversation.append(row);
}

function addCoach(reply) {
  const row = element('div', `message-row coach-row${reply.urgent ? ' urgent' : ''}`);
  const avatar = element('div', 'reply-avatar', reply.urgent ? '!' : '✳');
  const card = element('div', 'reply-card');
  const label = element('div', 'reply-label', reply.urgent ? 'SAFETY FIRST' : 'A SMALL PLAN');
  const title = element('h3', '', reply.title);
  title.dir = 'auto';
  const list = element('ol', 'steps');
  for (const step of reply.steps) {
    const item = element('li', '', step);
    item.dir = 'auto';
    list.append(item);
  }
  const check = element('div', 'check-in');
  check.append(element('span', 'check-icon', '↗'), element('div', '', reply.checkIn));
  check.dir = 'auto';
  card.append(label, title, list, check);
  row.append(avatar, card);
  conversation.append(row);
  conversation.scrollTop = conversation.scrollHeight;
}

function addError(text) {
  const error = element('p', 'error', text);
  error.setAttribute('role', 'alert');
  conversation.append(error);
  conversation.scrollTop = conversation.scrollHeight;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  document.querySelector('.welcome')?.remove();
  addUser(message);
  const userRow = conversation.lastElementChild;
  input.value = '';
  input.disabled = true;
  send.disabled = true;
  const pending = element('div', 'pending', 'Putting together a small plan…');
  conversation.append(pending);
  conversation.scrollTop = conversation.scrollHeight;
  try {
    const response = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history: history.slice(-8) }) });
    const reply = await response.json();
    if (!response.ok) throw new Error(reply.error || 'Something went wrong. Please try again.');
    pending.remove();
    addCoach(reply);
    history.push({ role: 'user', content: message }, { role: 'assistant', content: `${reply.title}\n${reply.steps.join('\n')}\n${reply.checkIn}` });
  } catch (error) {
    pending.remove();
    addError(error.message);
    input.value = message;
    userRow.remove();
  } finally {
    input.disabled = false;
    send.disabled = false;
    input.focus();
  }
});

input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => {
  input.value = button.dataset.prompt;
  input.focus();
}));

clear.addEventListener('click', () => {
  history = [];
  conversation.innerHTML = '<div class="welcome"><div class="welcome-icon">✳</div><h2>What’s going on?</h2><p>Share a parenting concern in English or Urdu. No names or personal details needed.</p></div>';
  input.value = '';
  input.focus();
});
