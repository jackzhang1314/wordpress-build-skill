/* Theme: mobile navigation + header elevation. */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.getElementById('mobile-nav');

  function closeMenu() {
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); }
  }

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    panel.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeMenu(); if (toggle && document.body.classList.contains('nav-open')) toggle.focus(); }
    });

    document.addEventListener('click', function (event) {
      if (!document.body.classList.contains('nav-open')) return;
      if (!event.target.closest('.site-header') && !event.target.closest('#mobile-nav')) closeMenu();
    });
  }

  if (header && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.className = 'header-sentinel';
    header.parentNode.insertBefore(sentinel, header);
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-elevated', !entries[0].isIntersecting);
    }).observe(sentinel);
  }
})();
