/* miau coffee — shared site behaviour */
(function () {
  'use strict';

  /* ---------- sticky header ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- hero video sequence ---------- */
  var heroMedia = document.querySelector('.hero-media');
  if (heroMedia) {
    var videos = Array.prototype.slice.call(heroMedia.querySelectorAll('video'));
    if (videos.length) {
      var current = 0;
      videos[0].classList.add('active');
      var playCurrent = function () {
        var v = videos[current];
        v.currentTime = 0;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      };
      playCurrent();
      videos.forEach(function (v, i) {
        v.addEventListener('ended', function () {
          videos[current].classList.remove('active');
          current = (current + 1) % videos.length;
          videos[current].classList.add('active');
          playCurrent();
        });
      });
      // Safety: if video fails to load/play (e.g. slow network), fall back to poster only.
      videos.forEach(function (v) {
        v.addEventListener('error', function () {
          heroMedia.classList.add('video-error');
        });
      });
    }
  }

  /* ---------- gallery lightbox ---------- */
  var lightboxItems = document.querySelectorAll('[data-lightbox]');
  if (lightboxItems.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML =
      '<button class="lightbox-close" aria-label="Close">' + iconClose() + '</button>' +
      '<button class="lightbox-prev" aria-label="Previous image">' + iconChevron('left') + '</button>' +
      '<img src="" alt="">' +
      '<button class="lightbox-next" aria-label="Next image">' + iconChevron('right') + '</button>' +
      '<div class="lightbox-caption"></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img');
    var lbCaption = lb.querySelector('.lightbox-caption');
    var items = Array.prototype.slice.call(lightboxItems);
    var idx = 0;

    function openLightbox(i) {
      idx = i;
      var el = items[idx];
      var full = el.getAttribute('data-full') || el.querySelector('img').src;
      lbImg.src = full;
      lbImg.alt = el.querySelector('img').alt || '';
      lbCaption.textContent = el.getAttribute('data-caption') || el.querySelector('img').alt || '';
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lb.classList.remove('active');
      document.body.style.overflow = '';
    }
    function show(delta) {
      idx = (idx + delta + items.length) % items.length;
      openLightbox(idx);
    }
    items.forEach(function (el, i) {
      el.addEventListener('click', function () { openLightbox(i); });
    });
    lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lb.querySelector('.lightbox-prev').addEventListener('click', function () { show(-1); });
    lb.querySelector('.lightbox-next').addEventListener('click', function () { show(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') show(-1);
      if (e.key === 'ArrowRight') show(1);
    });
  }

  function iconClose() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>';
  }
  function iconChevron(dir) {
    var d = dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6';
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
  }

  /* ---------- generic modal open/close (event reservation) ---------- */
  document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-modal-open');
      var modal = document.getElementById(id);
      if (!modal) return;
      var eventName = btn.getAttribute('data-event-name');
      if (eventName) {
        var nameField = modal.querySelector('[data-event-name-field]');
        if (nameField) nameField.textContent = eventName;
        var hiddenInput = modal.querySelector('input[name="event"]');
        if (hiddenInput) hiddenInput.value = eventName;
      }
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var modal = btn.closest('.modal-overlay');
      if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
    });
  });

  /* ---------- form validation (contact + reservation) ---------- */
  function validateField(field) {
    var wrap = field.closest('.form-field');
    if (!wrap) return true;
    var errorEl = wrap.querySelector('.field-error');
    var value = field.value.trim();
    var valid = true;
    var message = '';

    if (field.hasAttribute('required') && !value) {
      valid = false;
      message = 'This field is required.';
    } else if (field.type === 'email' && value) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value)) { valid = false; message = 'Please enter a valid email address.'; }
    } else if (field.type === 'tel' && value) {
      var reTel = /^[0-9+()\-\s]{6,}$/;
      if (!reTel.test(value)) { valid = false; message = 'Please enter a valid phone number.'; }
    }

    wrap.classList.toggle('error', !valid);
    if (errorEl) errorEl.textContent = valid ? '' : message;
    return valid;
  }

  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var allValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) allValid = false;
      });
      if (!allValid) {
        var firstError = form.querySelector('.form-field.error input, .form-field.error textarea');
        if (firstError) firstError.focus();
        return;
      }
      var successEl = form.parentElement.querySelector('.form-success') || document.getElementById(form.getAttribute('data-success-target'));
      form.reset();
      form.style.display = 'none';
      if (successEl) successEl.classList.add('active');
    });
  });

  /* ---------- gallery category filter ---------- */
  var filterBadges = document.querySelectorAll('[data-filter]');
  if (filterBadges.length) {
    filterBadges.forEach(function (badge) {
      badge.addEventListener('click', function () {
        filterBadges.forEach(function (b) { b.classList.remove('active'); });
        badge.classList.add('active');
        var filter = badge.getAttribute('data-filter');
        document.querySelectorAll('[data-category]').forEach(function (item) {
          var match = filter === 'all' || item.getAttribute('data-category') === filter;
          item.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* ---------- set active nav link ---------- */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === currentPage) a.classList.add('active');
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
