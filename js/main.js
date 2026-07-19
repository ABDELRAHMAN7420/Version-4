document.addEventListener('DOMContentLoaded', function () {

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // 1) قائمة الموبايل
  // ============================================
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  // ============================================
  // 2) أورورا خلفية متحركة (glow blobs) + parallax مع السكرول
  // ============================================
  var blob1 = document.createElement('div');
  blob1.className = 'glow-blob blob-1';
  var blob2 = document.createElement('div');
  blob2.className = 'glow-blob blob-2';
  var blob3 = document.createElement('div');
  blob3.className = 'glow-blob blob-3';
  var auroraVeil = document.createElement('div');
  auroraVeil.className = 'aurora-veil';
  document.body.appendChild(auroraVeil);
  document.body.appendChild(blob1);
  document.body.appendChild(blob2);
  document.body.appendChild(blob3);

  var scrollY = 0;

  if (!reducedMotion) {
    (function animateBlobs(timestamp) {
      var t = (timestamp || 0) / 1000;
      var floatY1 = Math.sin(t * 0.35) * 26;
      var floatX1 = Math.cos(t * 0.28) * 22;
      var floatY2 = Math.cos(t * 0.3 + 1.5) * 24;
      var floatX2 = Math.sin(t * 0.24 + 0.8) * 20;
      var floatY3 = Math.sin(t * 0.2 + 2.4) * 30;
      var floatX3 = Math.cos(t * 0.18 + 1.1) * 26;

      blob1.style.transform = 'translate3d(' + floatX1 + 'px, ' + (scrollY * 0.18 + floatY1) + 'px, 0)';
      blob2.style.transform = 'translate3d(' + floatX2 + 'px, ' + (scrollY * -0.12 + floatY2) + 'px, 0)';
      blob3.style.transform = 'translate3d(' + floatX3 + 'px, ' + (scrollY * 0.08 + floatY3) + 'px, 0)';

      requestAnimationFrame(animateBlobs);
    })();
  }

  window.addEventListener('scroll', function () {
    scrollY = window.scrollY || window.pageYOffset;
  }, { passive: true });

  // ============================================
  // 3) الهيدر بيبقى أوضح لما تنزل تحت
  // ============================================
  var header = document.querySelector('.site-header');
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // ============================================
  // 4) Scroll reveal — IntersectionObserver (GPU-friendly, animates once)
  // ============================================
  var revealSelector = '.section-head, .card, .cta-band, .tool-panel, .year-card, .upload-drop';
  var revealEls = document.querySelectorAll(revealSelector);

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('reveal', 'is-visible'); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('reveal');
      var rect = el.getBoundingClientRect();
      // عناصر أطول من الشاشة أو ظاهرة فعلاً وقت التحميل تتحسب ظاهرة على طول
      if (rect.height >= window.innerHeight || (rect.top < window.innerHeight && rect.bottom > 0)) {
        el.classList.add('is-visible');
      }
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -4% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // ============================================
  // 5) إضاءة بتتبع الماوس (spotlight) فوق الهيدر وكارت اللوجين
  // ============================================
  var spotTargets = document.querySelectorAll('.page-header, .login-card');
  if (spotTargets.length) {
    window.addEventListener('mousemove', function (e) {
      var xPct = (e.clientX / window.innerWidth) * 100;
      var yPct = (e.clientY / window.innerHeight) * 100;
      spotTargets.forEach(function (el) {
        el.style.setProperty('--mx', xPct + '%');
        el.style.setProperty('--my', yPct + '%');
      });
    });
  }

  // ============================================
  // 6) حركة 3D خفيفة للكروت لما الماوس يمر عليها (Apple-style tilt)
  // ============================================
  if (!reducedMotion) {
    var tiltCards = document.querySelectorAll('.card');
    tiltCards.forEach(function (card) {
      card.style.transition = 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.25s ease';
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var rotateY = x * 10;
        var rotateX = y * -10;
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  // ============================================
  // 7) أزرار مغناطيسية (magnetic pull) — btn-primary / btn-data
  // ============================================
  if (!reducedMotion) {
    var magneticBtns = document.querySelectorAll('.btn-primary, .btn-data');
    magneticBtns.forEach(function (btn) {
      var strength = 0.28;
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width / 2) * strength;
        var y = (e.clientY - rect.top - rect.height / 2) * strength;
        btn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  // ============================================
  // 8) Ripple effect عند الضغط على أي زر
  // ============================================
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (reducedMotion) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    });
  });

  // ============================================
  // 9) Animated number counters — عناصر فيها [data-counter]
  //    بتتحسب مرة واحدة لما تظهر على الشاشة
  // ============================================
  function animateCounterEl(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var suffix = el.getAttribute('data-counter-suffix') || '';
    var decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
    if (isNaN(target)) return;

    if (reducedMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    var duration = 700;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  window.runCounters = function (container) {
    var scope = container || document;
    scope.querySelectorAll('[data-counter]').forEach(animateCounterEl);
  };
});
