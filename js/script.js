// Появление шапки и плавный скролл к якорным ссылкам

const header = document.querySelector('.header');
const anchorLinks = document.querySelectorAll('.header-links a[href^="#"]');

document.addEventListener("DOMContentLoaded", () => {
  const offset = 50;         
  const duration = 800;     
  const hideOffset = 60;    
  const smallDelta = 5;    
  const extraGuardMs = 300;  

  let lastScrollY = window.pageYOffset;
  let isHeaderHidden = false;
  let rafScheduled = false;

  let programmaticStart = 0;
  let programmaticUntil = 0;
  let lastUserInteraction = 0; 

  const userInputHandler = () => { lastUserInteraction = Date.now(); };
  ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach(ev =>
    window.addEventListener(ev, userInputHandler, { passive: true }));

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function getHeaderHeight() {
    return header ? header.offsetHeight : 0;
  }

  function showHeader() {
    if (!header) return;
    header.classList.remove('header--hidden');
    header.classList.add('header--visible');
    isHeaderHidden = false;
  }

  function hideHeader() {
    if (!header) return;
    header.classList.add('header--hidden');
    header.classList.remove('header--visible');
    isHeaderHidden = true;
  }

  function smoothScrollTo(targetY, duration, onDone) {
    const startY = window.pageYOffset;
    const startTime = performance.now();

    programmaticStart = Date.now();
    programmaticUntil = programmaticStart + duration + extraGuardMs;

    showHeader();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      const nextY = startY + (targetY - startY) * ease;

      window.scrollTo(0, nextY);
      lastScrollY = window.pageYOffset;

      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        if (typeof onDone === 'function') onDone();

        setTimeout(() => {
          lastScrollY = window.pageYOffset;
        }, Math.max(0, programmaticUntil - Date.now()));
      }
    }

    requestAnimationFrame(step);
  }

  function handleScroll() {
    const now = Date.now();
    const currentY = window.pageYOffset;
    const delta = currentY - lastScrollY;

    if (now < programmaticUntil) {
      if (lastUserInteraction >= programmaticStart) {
      } else {
        lastScrollY = currentY;
        rafScheduled = false;
        return;
      }
    }

    if (Math.abs(delta) < smallDelta) {
      lastScrollY = currentY;
      rafScheduled = false;
      return;
    }

    if (delta > 0 && currentY > hideOffset) {
      // скролл вниз
      if (!isHeaderHidden) hideHeader();
    } else if (delta < 0) {
      // скролл вверх
      if (isHeaderHidden) showHeader();
    }

    lastScrollY = currentY;
    rafScheduled = false;
  }

  window.addEventListener('scroll', () => {
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(handleScroll);
    }
  }, { passive: true });

  anchorLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const rawHash = link.getAttribute('href');
      if (!rawHash || rawHash === '#') return;

      const targetId = rawHash.substring(1);
      const targetElement = document.getElementById(targetId);
      if (!targetElement) {
        console.warn(`Anchor target "#${targetId}" not found.`);
        return;
      }

      showHeader();
      const headerHeight = getHeaderHeight();
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - offset;

      smoothScrollTo(targetPosition, duration, () => {
        history.replaceState(null, null, `#${targetId}`);
      });
    });
  });

  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      programmaticStart = Date.now();
      programmaticUntil = programmaticStart + extraGuardMs + 100;

      showHeader();
      setTimeout(() => {
        const headerHeight = getHeaderHeight();
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - offset;
        window.scrollTo(0, targetPosition);

        setTimeout(() => {
          lastScrollY = window.pageYOffset;
        }, Math.max(0, programmaticUntil - Date.now()));
      }, 60);
    }
  }
});


// Бургер меню

document.addEventListener('DOMContentLoaded', function() {
    const burgerBtn = document.getElementById('burger');
    const burgerMenu = document.getElementById('burgerMenu');
    const body = document.body;

    if (!burgerBtn || !burgerMenu) {
      return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'burger-overlay';
    document.body.appendChild(overlay);
    
    function toggleMenu() {
      burgerBtn.classList.toggle('active');
      burgerMenu.classList.toggle('active');
      overlay.classList.toggle('active');
      
      const isActive = burgerMenu.classList.contains('active');
      
      if (isActive) {
          body.style.overflow = 'hidden';
          document.documentElement.classList.add('no-scroll-modal');
          document.body.classList.add('no-scroll-modal');
      } else {
          body.style.overflow = '';
          document.documentElement.classList.remove('no-scroll-modal');
          document.body.classList.remove('no-scroll-modal');
      }
    }
    
    burgerBtn.addEventListener('click', toggleMenu);
    
    overlay.addEventListener('click', toggleMenu);
    burgerMenu.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            toggleMenu();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && burgerMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
});

// Модальное окно для видео

const modalVideo = document.querySelector('.modal-video');

if (modalVideo) {
  const playButtons = document.querySelectorAll('.play-btn');
  const modal = document.querySelector('.modal-video-about');
  const closeBtn = modal.querySelector('.close-video');
  const video = document.getElementById('modalVideo');
  let lastFocused = null;

  function openModal(event) {
    lastFocused = event?.currentTarget || document.activeElement;

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('show'));

    document.documentElement.classList.add('no-scroll-modal');
    document.body.classList.add('no-scroll-modal');

    try {
        video.classList.remove('visible'); 
        const p = video.play();
        if (p && typeof p.then === 'function') {
            p
            .then(() => {
                requestAnimationFrame(() => video.classList.add('visible'));

                if (video.requestFullscreen) {
                video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
                } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
                }
            })
            .catch(() => {});
        }
    } catch (err) {}


    if (closeBtn) closeBtn.focus();
      modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');

    function onTransitionEnd(e) {
      if (e.target === modal && e.propertyName === 'opacity') {
        modal.style.display = 'none';
        modal.removeEventListener('transitionend', onTransitionEnd);
      }
    }
    modal.addEventListener('transitionend', onTransitionEnd);

    document.documentElement.classList.remove('no-scroll-modal');
    document.body.classList.remove('no-scroll-modal');
    
    video.classList.remove('visible');  

    try { video.pause(); video.currentTime = 0; } catch (err) {}

    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  playButtons.forEach(btn => btn.addEventListener('click', openModal));

  const anotherBtn = document.querySelector('.video-about-production');

  if (anotherBtn) {
    anotherBtn.addEventListener('click', (e) => {
      openModal(e); 
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });
}



