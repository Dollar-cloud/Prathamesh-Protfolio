/**
 * PRATHAMESH MULE — PORTFOLIO
 * Theme toggle, nav, scroll reveal, form validation. Projects are static HTML.
 */

/* ========== DOM ELEMENTS ========== */
const body = document.body;
const themeToggle = document.querySelector('.theme-toggle');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navLinksAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
const contactForm = document.getElementById('contact-form');
const yearSpan = document.getElementById('year');

/* ========== THEME TOGGLE ========== */
function initTheme() {
  if (!body) return;
  const stored = localStorage.getItem('theme');
  const theme = stored || 'dark';
  body.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  document.documentElement.style.colorScheme = theme;
}

function toggleTheme() {
  const current = body.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', next);
  document.documentElement.style.colorScheme = next;
  localStorage.setItem('theme', next);
}

/* Theme toggle: mouse click + Enter only; spacebar ignored to avoid accidental toggles */
if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
  themeToggle.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault(); /* Ignore spacebar; activation only via Enter */
    }
  });
}

/* ========== MOBILE NAV ========== */
function closeMobileNav() {
  if (navToggle && navLinks) {
    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    body.style.overflow = '';
  }
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('open');
    body.style.overflow = expanded ? '' : 'hidden';
  });

  navLinksAnchors.forEach((a) => {
    a.addEventListener('click', closeMobileNav);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileNav();
  });
}

/* ========== ACTIVE NAV ON SCROLL ========== */
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  if (!navLinksAnchors || navLinksAnchors.length === 0) return;

  sections.forEach((section) => {
    const id = section.getAttribute('id');
    if (!id) return;
    const rect = section.getBoundingClientRect();
    const offset = 150;

    if (rect.top <= offset && rect.bottom > offset) {
      navLinksAnchors.forEach((a) => {
        if (a && a.classList) {
          a.classList.remove('active');
          if (a.getAttribute('href') === `#${id}`) {
            a.classList.add('active');
          }
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

/* ========== SCROLL REVEAL ========== */
const revealElements = document.querySelectorAll('[data-reveal]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function reveal() {
  if (reducedMotion) {
    revealElements.forEach((el) => el.classList.add('revealed'));
    return;
  }

  revealElements.forEach((el) => {
    if (el.classList.contains('revealed')) return; /* Skip already revealed; avoids recalc */
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight - 80;
    if (isVisible) el.classList.add('revealed');
  });
}

window.addEventListener('scroll', reveal, { passive: true });
window.addEventListener('load', reveal);
reveal();

/* ========== CONTACT FORM ========== */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqeldwoe';

function validateForm() {
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const message = document.getElementById('message');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  let valid = true;

  if (!name.value.trim()) {
    nameError.textContent = 'Name is required';
    name.classList.add('error');
    valid = false;
  } else {
    nameError.textContent = '';
    name.classList.remove('error');
  }

  if (!email.value.trim()) {
    emailError.textContent = 'Email is required';
    email.classList.add('error');
    valid = false;
  } else if (!emailRegex.test(email.value)) {
    emailError.textContent = 'Please enter a valid email';
    email.classList.add('error');
    valid = false;
  } else {
    emailError.textContent = '';
    email.classList.remove('error');
  }

  if (!message.value.trim()) {
    messageError.textContent = 'Message is required';
    message.classList.add('error');
    valid = false;
  } else {
    messageError.textContent = '';
    message.classList.remove('error');
  }

  return valid;
}

function showFormStatus(message, isError) {
  const statusEl = document.getElementById('form-status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = 'form-status ' + (isError ? 'form-status--error' : 'form-status--success');
    statusEl.setAttribute('role', 'alert');
  }
}

function handleSubmit(e) {
  e.preventDefault();
  if (!contactForm || !validateForm()) return;

  if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
    showFormStatus('Contact form not configured yet. Please email me directly at pmule390@gmail.com.', true);
    return;
  }

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
  }

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);

  fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }).then((res) => {
    if (res.ok) {
      contactForm.reset();
      document.querySelectorAll('.form-error').forEach((el) => (el.textContent = ''));
      document.querySelectorAll('.form-group input, .form-group textarea').forEach((el) => el.classList.remove('error'));
      showFormStatus('Thanks! Your message was sent. I\'ll get back to you soon.', false);
    } else {
      showFormStatus('Something went wrong. Please try again or email me directly.', true);
    }
  }).catch(() => {
    showFormStatus('Something went wrong. Please try again or email me directly.', true);
  }).finally(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', handleSubmit);
}

/* ========== INIT ========== */
function init() {
  initTheme();
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
