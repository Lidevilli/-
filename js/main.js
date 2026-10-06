document.addEventListener('DOMContentLoaded', () => {
  // Scroll reveal animation
  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // Responsive steps slider
  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const track = slider.querySelector('.steps-slider__track');
    const slides = [...slider.querySelectorAll('.step')];
    const prev = slider.querySelector('.steps-slider__button--prev');
    const next = slider.querySelector('.steps-slider__button--next');
    const dots = [...slider.querySelectorAll('.steps-slider__dots button')];
    let current = 0;
    let startX = 0;
    let startY = 0;
    let dragging = false;

    const visibleSlides = () => window.innerWidth <= 700 ? 1 : window.innerWidth <= 1000 ? 2 : 4;
    const maxIndex = () => Math.max(0, slides.length - visibleSlides());

    const update = () => {
      const visible = visibleSlides();
      slides.forEach(slide => slide.style.flexBasis = `${100 / visible}%`);
      current = Math.min(current, maxIndex());
      track.style.transform = `translateX(-${current * (100 / visible)}%)`;
      if (prev) prev.disabled = current === 0;
      if (next) next.disabled = current >= maxIndex();
      dots.forEach((dot, index) => dot.classList.toggle('is-active', index === current));
    };

    const goTo = index => {
      current = Math.max(0, Math.min(index, maxIndex()));
      update();
    };

    prev?.addEventListener('click', () => goTo(current - 1));
    next?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));

    track.addEventListener('pointerdown', event => {
      if (visibleSlides() === 4) return;
      startX = event.clientX;
      startY = event.clientY;
      dragging = true;
      track.setPointerCapture?.(event.pointerId);
    });
    track.addEventListener('pointerup', event => {
      if (!dragging) return;
      dragging = false;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) goTo(dx < 0 ? current + 1 : current - 1);
    });
    track.addEventListener('pointercancel', () => dragging = false);
    window.addEventListener('resize', update, { passive: true });
    update();
  }


  // Media video controls
  const mediaVideo = document.querySelector('.video-card__video');
  const mediaPlay = document.querySelector('.video-card__play');
  const mediaCard = document.querySelector('.video-card');

  if (mediaVideo && mediaPlay && mediaCard) {
    const syncVideoState = () => {
      const playing = !mediaVideo.paused && !mediaVideo.ended;
      mediaCard.classList.toggle('is-playing', playing);
      mediaPlay.setAttribute('aria-pressed', String(playing));
      mediaPlay.setAttribute('aria-label', playing ? 'Поставить видео на паузу' : 'Воспроизвести видео');
      mediaPlay.textContent = playing ? '❚❚' : '▶';
    };

    mediaPlay.addEventListener('click', () => {
      if (mediaVideo.paused || mediaVideo.ended) {
        mediaVideo.play().catch(() => { });
      } else {
        mediaVideo.pause();
      }
    });

    mediaVideo.addEventListener('click', () => {
      if (mediaVideo.paused || mediaVideo.ended) {
        mediaVideo.play().catch(() => { });
      } else {
        mediaVideo.pause();
      }
    });

    mediaVideo.addEventListener('play', syncVideoState);
    mediaVideo.addEventListener('pause', syncVideoState);
    mediaVideo.addEventListener('ended', syncVideoState);
    syncVideoState();
  }

  const videoCard = document.querySelector(".video-card");
  const video = document.querySelector(".video-card__video");

  if (videoCard && video) {

    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      // На телефонах controls всегда доступны
      video.controls = true;
    } else {
      // На компьютере появляются при наведении
      video.controls = false;

      videoCard.addEventListener("mouseenter", () => {
        video.controls = true;
      });

      videoCard.addEventListener("mouseleave", () => {
        video.controls = false;
      });
    }
  }

  // Form hints and lightweight validation
  const form = document.querySelector('.contact-form');
  const chat = document.querySelector('#formChat');
  const chatText = document.querySelector('#formChatText');
  const status = document.querySelector('#formStatus');
  const fields = form ? [...form.querySelectorAll('input, textarea')] : [];

  const setHint = text => {
    if (!chatText) return;
    chatText.textContent = text;
    chat?.classList.remove('is-bump');
    requestAnimationFrame(() => chat?.classList.add('is-bump'));
    setTimeout(() => chat?.classList.remove('is-bump'), 220);
  };

  fields.forEach(field => {
    field.addEventListener('focus', () => setHint(field.dataset.hint || 'Заполните это поле.'));
    field.addEventListener('input', () => field.classList.remove('is-invalid'));
  });

  form?.addEventListener('submit', event => {
    let invalidField = null;
    fields.forEach(field => {
      if (!field.checkValidity()) {
        field.classList.add('is-invalid');
        if (!invalidField) invalidField = field;
      }
    });
    if (invalidField) {
      event.preventDefault();
      status.textContent = 'Проверьте обязательные поля — я подсветила, что нужно исправить.';
      status.className = 'contact-form__status is-error';
      setHint(invalidField.dataset.hint || 'Проверьте это поле.');
      invalidField.focus();
    }
  });

  // Floating helper panel
  const helperToggle = document.querySelector('.helper-toggle');
  const helperPanel = document.querySelector('#helperPanel');
  const helperClose = document.querySelector('.helper-panel__close');
  const closeHelper = () => {
    if (!helperPanel || !helperToggle) return;
    helperPanel.hidden = true;
    helperToggle.setAttribute('aria-expanded', 'false');
  };
  helperToggle?.addEventListener('click', () => {
    const willOpen = helperPanel?.hidden;
    if (!helperPanel) return;
    helperPanel.hidden = !willOpen;
    helperToggle.setAttribute('aria-expanded', String(Boolean(willOpen)));
  });
  helperClose?.addEventListener('click', closeHelper);
  helperPanel?.querySelector('a')?.addEventListener('click', closeHelper);
});
