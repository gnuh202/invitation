const cover = document.querySelector('.cover');
const envelope = document.querySelector('.envelope');
const openButton = document.querySelector('.envelope-link');
const invitation = document.querySelector('#thiep');
const heading = document.querySelector('#invite-title');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const main = document.querySelector('main');

const guests = new Map([
  ['friend', 'bạn'],
  ['younger', 'em'],
  ['older', 'anh/chị'],
  ['elders', 'cô dì chú bác'],
]);
const guestGroup = new URLSearchParams(location.search).get('guest');
const recipient = guests.get(guestGroup) ?? guests.get('friend');
document.title = `${recipient[0].toLocaleUpperCase('vi')}${recipient.slice(1)} có hẹn với Hùng!`;

heading.querySelector('.invitation-line').textContent =
  `Thân mời ${recipient} đến chung vui trong ngày tốt nghiệp`;
invitation.querySelector('.invitation-note').textContent =
  `Ngày tốt nghiệp sẽ đáng nhớ hơn khi có ${recipient} ở đó!`;

main.classList.add('interactive');

function revealInvitation(moveFocus) {
  invitation.hidden = false;
  cover.hidden = true;
  if (moveFocus) heading.focus({ preventScroll: true });
}

if (location.hash === '#thiep') {
  revealInvitation(false);
} else {
  invitation.hidden = true;
}

openButton.addEventListener('click', async (event) => {
  event.preventDefault();
  if (cover.classList.contains('opening')) return;

  cover.classList.add('opening');
  envelope.style.removeProperty('--tilt-x');
  envelope.style.removeProperty('--tilt-y');

  if (!reducedMotion.matches) {
    await Promise.allSettled(cover.getAnimations({ subtree: true }).map(animation => animation.finished));
  }
  invitation.classList.add('revealed');
  revealInvitation(true);
});

envelope.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse' || reducedMotion.matches || cover.classList.contains('opening')) return;

  const bounds = envelope.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  envelope.style.setProperty('--tilt-x', `${-y * 9}deg`);
  envelope.style.setProperty('--tilt-y', `${x * 12}deg`);
  envelope.style.setProperty('--shine-x', `${Math.min(100, Math.max(0, (x + .5) * 100))}%`);
});

envelope.addEventListener('pointerleave', () => {
  envelope.style.removeProperty('--tilt-x');
  envelope.style.removeProperty('--tilt-y');
  envelope.style.removeProperty('--shine-x');
});

window.addEventListener('hashchange', () => {
  if (location.hash === '#thiep') {
    revealInvitation(false);
  }
});

const rsvp = document.querySelector('.rsvp');
const rsvpActions = rsvp.querySelector('.rsvp-actions');
const rsvpJoin = rsvp.querySelector('.rsvp-join');
const rsvpDodge = rsvp.querySelector('.rsvp-dodge');
const rsvpDialog = rsvp.querySelector('dialog');
const rsvpForm = rsvp.querySelector('form');
const rsvpName = rsvpForm.elements.name;
const rsvpSubmit = rsvpForm.querySelector('button');
const rsvpStatus = rsvpDialog.querySelector('.rsvp-dialog-status');
const rsvpTitle = rsvpDialog.querySelector('#rsvp-title');
const rsvpClose = rsvpDialog.querySelector('.rsvp-close');
const rsvpOk = rsvpDialog.querySelector('.rsvp-ok');

function fitRsvpThanks() {
  if (!rsvpDialog.open || rsvpOk.hidden) return;
  rsvpTitle.style.fontSize = '';
  if (rsvpTitle.scrollWidth > rsvpTitle.clientWidth) {
    const fontSize = parseFloat(getComputedStyle(rsvpTitle).fontSize);
    rsvpTitle.style.fontSize = `${Math.max(12, fontSize * rsvpTitle.clientWidth / rsvpTitle.scrollWidth)}px`;
  }
}

rsvp.hidden = false;

rsvpJoin.addEventListener('click', () => {
  rsvpDialog.showModal();
  fitRsvpThanks();
});
rsvpClose.addEventListener('click', () => rsvpDialog.close());
rsvpOk.addEventListener('click', () => rsvpDialog.close());
window.addEventListener('resize', fitRsvpThanks);

function dodgeRsvp() {
  const area = rsvpActions.getBoundingClientRect();
  const button = rsvpDodge.getBoundingClientRect();
  const join = rsvpJoin.getBoundingClientRect();
  const gap = parseFloat(getComputedStyle(rsvpActions).columnGap);
  const minX = join.right - area.left + gap;
  const maxX = area.width - button.width;
  const currentX = button.left - area.left;
  const minJump = button.width + 1;
  // Keep each landing within reach of a full-width jump back.
  const leftEnd = Math.min(maxX - minJump, currentX - minJump);
  const rightStart = Math.max(minX + minJump, currentX + minJump);
  const leftRange = Math.max(0, leftEnd - minX);
  const rightRange = Math.max(0, maxX - rightStart);
  const offset = Math.random() * (leftRange + rightRange);

  const next = leftRange + rightRange > 0
    ? (offset < leftRange ? minX + offset : rightStart + offset - leftRange)
    : (currentX < (minX + maxX) / 2 ? maxX : minX);

  if (Math.abs(next - currentX) < minJump) return;
  rsvpDodge.style.setProperty('--dodge-x', `${next}px`);
}

rsvpDodge.addEventListener('pointerenter', (event) => {
  if (event.pointerType === 'mouse') dodgeRsvp();
});
rsvpDodge.addEventListener('click', dodgeRsvp);

rsvpName.addEventListener('input', () => rsvpName.setCustomValidity(''));
rsvpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (rsvpSubmit.disabled) return;

  const name = rsvpName.value.trim().replace(/\s+/g, ' ');
  if (!name) {
    rsvpName.setCustomValidity('Vui lòng nhập họ và tên.');
    rsvpName.reportValidity();
    return;
  }

  const endpoint = rsvpForm.dataset.endpoint;
  if (!endpoint) {
    rsvpStatus.textContent = 'Tính năng gửi xác nhận chưa được kết nối.';
    return;
  }

  const data = new FormData();
  data.set('name', name);
  data.set('subject', `${name} đã xác nhận tham gia!`);
  rsvpSubmit.disabled = true;
  rsvpStatus.textContent = 'Đang gửi xác nhận…';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
    });
    if (!response.ok) throw new Error('RSVP request failed');
    rsvpForm.reset();
    rsvpForm.hidden = true;
    rsvpDodge.hidden = true;
    rsvpStatus.textContent = '';
    rsvpTitle.textContent = `Cảm ơn ${name} vì đã đồng ý tham gia ❤️`;
    rsvpDialog.classList.add('is-confirmed');
    rsvpClose.hidden = true;
    rsvpOk.hidden = false;
    fitRsvpThanks();
    if (rsvpDialog.open) rsvpOk.focus();
  } catch {
    rsvpStatus.textContent = 'Chưa gửi được xác nhận. Bạn thử lại nhé.';
  } finally {
    rsvpSubmit.disabled = false;
  }
});
