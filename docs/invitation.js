const cover = document.querySelector('.cover');
const envelope = document.querySelector('.envelope');
const openButton = document.querySelector('.open-button');
const invitation = document.querySelector('#thiep');
const heading = document.querySelector('#invite-title');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

invitation.hidden = location.hash !== '#thiep';

openButton.addEventListener('click', (event) => {
  event.preventDefault();
  if (cover.classList.contains('opening')) return;

  cover.classList.add('opening');
  window.setTimeout(() => {
    invitation.hidden = false;
    cover.classList.replace('opening', 'opened');
    if (location.hash !== '#thiep') history.replaceState(null, '', '#thiep');
    heading.focus({ preventScroll: true });
    invitation.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }, reducedMotion.matches || !invitation.hidden ? 0 : 720);
});

envelope.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse' || reducedMotion.matches) return;

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
    invitation.hidden = false;
    invitation.scrollIntoView();
  }
});
