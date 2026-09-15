const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const dialog = document.querySelector('.menu-dialog');
const closeDialog = document.querySelector('.dialog-close');
const openMenuButtons = document.querySelectorAll('.js-open-menu');

const closeMobileNav = () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
};

menuToggle.addEventListener('click', () => {
  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  nav.classList.toggle('open', willOpen);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileNav));

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

openMenuButtons.forEach((button) => {
  button.addEventListener('click', () => {
    closeMobileNav();
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
});

const hideDialog = () => {
  dialog.close();
  document.body.classList.remove('dialog-open');
};

closeDialog.addEventListener('click', hideDialog);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) hideDialog();
});
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();
