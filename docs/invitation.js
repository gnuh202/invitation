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
});

envelope.addEventListener('pointerleave', () => {
  envelope.style.removeProperty('--tilt-x');
  envelope.style.removeProperty('--tilt-y');
});

window.addEventListener('hashchange', () => {
  if (location.hash === '#thiep') {
    revealInvitation(false);
  }
});
