const form = document.querySelector('#form');
const input = document.querySelector('#message');
const send = document.querySelector('#send');
const conversation = document.querySelector('#conversation');
const clear = document.querySelector('#clear');
const welcome = conversation.innerHTML;
let history = [];
let requestId = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function scrollToLatest(focusRow) {
  requestAnimationFrame(() => {
    const top = focusRow && focusRow.offsetHeight > conversation.clientHeight - 24
      ? conversation.scrollTop + focusRow.getBoundingClientRect().top - conversation.getBoundingClientRect().top - 12
      : conversation.scrollHeight;
    conversation.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
}

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
  scrollToLatest();
}

function coachAvatar() {
  const avatar = element('div', 'reply-avatar');
  avatar.setAttribute('aria-hidden', 'true');
  const photo = element('img');
  photo.src = '/coach-avatar.jpg';
  photo.alt = '';
  avatar.append(photo);
  return avatar;
}

function addCoach(reply, pending) {
  const row = element('div', `message-row coach-row revealing${reply.urgent ? ' urgent' : ''}`);
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
  const check = element('button', 'check-in');
  check.type = 'button';
  check.dataset.prompt = /[\u0600-\u06ff]/.test(reply.checkIn) ? 'تازہ صورتحال: ' : 'Here’s what happened: ';
  check.append(element('span', 'check-icon', '↗'), element('span', '', reply.checkIn));
  check.dir = 'auto';
  card.append(label, title, list, check);
  row.append(coachAvatar(), card);
  pending.replaceWith(row);
  scrollToLatest(row);
}

function addError(text) {
  const error = element('p', 'error', text);
  error.setAttribute('role', 'alert');
  conversation.append(error);
  scrollToLatest();
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  const currentRequest = ++requestId;
  document.querySelector('.welcome')?.remove();
  addUser(message);
  const userRow = conversation.lastElementChild;
  input.value = '';
  input.disabled = true;
  send.disabled = true;
  const pending = element('div', 'message-row coach-row pending-row');
  const typing = element('div', 'typing-indicator');
  typing.setAttribute('role', 'status');
  typing.append(element('span', 'sr-only', 'Alpha coach is thinking'));
  const dots = element('span', 'typing-dots');
  dots.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i++) dots.append(element('span'));
  typing.append(dots);
  pending.append(coachAvatar(), typing);
  conversation.append(pending);
  scrollToLatest();
  const startedAt = performance.now();
  try {
    const response = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history: history.slice(-8) }) });
    const reply = await response.json();
    if (!response.ok) throw new Error(reply.error || 'Something went wrong. Please try again.');
    await new Promise(resolve => setTimeout(resolve, Math.max(0, 400 - (performance.now() - startedAt))));
    if (currentRequest !== requestId) return;
    addCoach(reply, pending);
    history.push({ role: 'user', content: message }, { role: 'assistant', content: `${reply.title}\n${reply.steps.join('\n')}\n${reply.checkIn}` });
  } catch (error) {
    if (currentRequest !== requestId) return;
    pending.remove();
    addError(error.message);
    input.value = message;
    userRow.remove();
  } finally {
    if (currentRequest === requestId) {
      input.disabled = false;
      send.disabled = false;
      input.focus();
    }
  }
});

input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

conversation.addEventListener('click', event => {
  const button = event.target.closest('[data-prompt]');
  if (!button) return;
  input.value = button.dataset.prompt;
  input.focus();
});

clear.addEventListener('click', () => {
  requestId++;
  history = [];
  conversation.innerHTML = welcome;
  input.value = '';
  input.disabled = false;
  send.disabled = false;
  input.focus();
});
