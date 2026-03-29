/**
 * El Asado de Chiche — app.js
 * Handles: nav scroll behavior, mobile menu, gallery filter, lightbox, scroll reveal
 */

(function () {
  'use strict';

  // ─── NAV SCROLL BEHAVIOR ────────────────────────────────────────────────────
  const nav = document.getElementById('nav');

  function handleNavScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load

  // ─── MOBILE NAV TOGGLE ──────────────────────────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', function () {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu when a link is clicked
  navMenu.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ─── GALLERY FILTER ─────────────────────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galeriaItems = document.querySelectorAll('.galeria-item');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      // Show/hide items with animation
      galeriaItems.forEach(function (item) {
        if (filter === 'all' || item.classList.contains('galeria-item--' + filter)) {
          item.classList.remove('hidden');
          // Staggered fade-in via small delay
          item.style.animation = 'none';
          void item.offsetWidth; // reflow
          item.style.animation = '';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // ─── LIGHTBOX ───────────────────────────────────────────────────────────────
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentIndex = 0;
  let visibleItems = [];

  function getVisibleItems() {
    return Array.from(galeriaItems).filter(function (item) {
      return !item.classList.contains('hidden');
    });
  }

  function openLightbox(index) {
    visibleItems = getVisibleItems();
    currentIndex = index;
    showLightboxImage(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function showLightboxImage(index) {
    const item = visibleItems[index];
    if (!item) return;

    lightboxImg.style.opacity = '0';
    const src = item.dataset.src || item.querySelector('img').src;
    const caption = item.dataset.caption || item.querySelector('img').alt || '';

    // Short crossfade
    setTimeout(function () {
      lightboxImg.src = src;
      lightboxImg.alt = caption;
      lightboxCaption.textContent = caption;
      lightboxImg.style.opacity = '1';
    }, 80);

    // Update prev/next visibility
    lightboxPrev.style.visibility = index > 0 ? 'visible' : 'hidden';
    lightboxNext.style.visibility = index < visibleItems.length - 1 ? 'visible' : 'hidden';
  }

  // Attach click handlers to gallery items
  galeriaItems.forEach(function (item, originalIndex) {
    item.addEventListener('click', function () {
      visibleItems = getVisibleItems();
      const visibleIndex = visibleItems.indexOf(item);
      if (visibleIndex !== -1) {
        openLightbox(visibleIndex);
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightboxPrev.addEventListener('click', function () {
    if (currentIndex > 0) {
      currentIndex--;
      showLightboxImage(currentIndex);
    }
  });

  lightboxNext.addEventListener('click', function () {
    if (currentIndex < visibleItems.length - 1) {
      currentIndex++;
      showLightboxImage(currentIndex);
    }
  });

  // Close on backdrop click
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        if (currentIndex > 0) {
          currentIndex--;
          showLightboxImage(currentIndex);
        }
        break;
      case 'ArrowRight':
        if (currentIndex < visibleItems.length - 1) {
          currentIndex++;
          showLightboxImage(currentIndex);
        }
        break;
    }
  });

  // Touch swipe support for lightbox
  let touchStartX = 0;

  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    const deltaX = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(deltaX) < 40) return; // ignore small swipes

    if (deltaX < 0 && currentIndex < visibleItems.length - 1) {
      currentIndex++;
      showLightboxImage(currentIndex);
    } else if (deltaX > 0 && currentIndex > 0) {
      currentIndex--;
      showLightboxImage(currentIndex);
    }
  }, { passive: true });

  // ─── SCROLL REVEAL ──────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.section__header, .asado-text, .asado-visual, .historia-chapter, .historia-coda, .historia-video, .latam-content, .acerca-item, .galeria-filters');

  // Mark them for animation
  revealEls.forEach(function (el) {
    el.classList.add('reveal');
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  // ─── ACTIVE NAV LINK (scroll spy) ───────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function (link) {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, {
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // Add active style for current nav link
  const style = document.createElement('style');
  style.textContent = '.nav__link.active { color: var(--color-flame); } .nav__link.active::after { width: 100%; }';
  document.head.appendChild(style);

})();
