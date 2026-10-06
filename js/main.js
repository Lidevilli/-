document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector("[data-slider]");

  if (slider) {
    const track = slider.querySelector(".steps-slider__track");
    const slides = [...slider.querySelectorAll(".step")];
    const prev = slider.querySelector(".steps-slider__button--prev");
    const next = slider.querySelector(".steps-slider__button--next");
    const dots = [...slider.querySelectorAll(".steps-slider__dots button")];

    let current = 0;

    function getVisibleSlides() {
      if (window.innerWidth <= 700) return 1;
      if (window.innerWidth <= 1000) return 2;
      return 4;
    }

    function getMaxIndex() {
      return Math.max(0, slides.length - getVisibleSlides());
    }

    function updateSlider() {
      const visible = getVisibleSlides();
      const maxIndex = getMaxIndex();

      slides.forEach((slide) => {
        slide.style.flexBasis = `${100 / visible}%`;
      });

      current = Math.min(current, maxIndex);

      track.style.transform =
        `translateX(-${current * (100 / visible)}%)`;

      if (prev) {
        prev.disabled = current === 0;
      }

      if (next) {
        next.disabled = current >= maxIndex;
      }

      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === current);

        
        dot.hidden = index > maxIndex;
      });
    }

    function goTo(index) {
      current = Math.max(
        0,
        Math.min(index, getMaxIndex())
      );

      updateSlider();
    }



    prev?.addEventListener("click", () => {
      goTo(current - 1);
    });

    next?.addEventListener("click", () => {
      goTo(current + 1);
    });


   

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        goTo(index);
      });
    });


  

    let touchStartX = 0;
    let touchStartY = 0;

    track.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.changedTouches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { passive: true }
    );

    track.addEventListener(
      "touchend",
      (event) => {
        const touch = event.changedTouches[0];

        const diffX = touch.clientX - touchStartX;
        const diffY = touch.clientY - touchStartY;

        
        if (
          Math.abs(diffX) > 35 &&
          Math.abs(diffX) > Math.abs(diffY)
        ) {
          if (diffX < 0) {
    
            goTo(current + 1);
          } else {

            goTo(current - 1);
          }
        }
      },
      { passive: true }
    );


    let mouseDown = false;
    let mouseStartX = 0;
    let mouseStartY = 0;

    track.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;

      mouseDown = true;

      mouseStartX = event.clientX;
      mouseStartY = event.clientY;

      track.classList.add("is-dragging");
    });

    window.addEventListener("mouseup", (event) => {
      if (!mouseDown) return;

      mouseDown = false;

      track.classList.remove("is-dragging");

      const diffX = event.clientX - mouseStartX;
      const diffY = event.clientY - mouseStartY;

      if (
        Math.abs(diffX) > 40 &&
        Math.abs(diffX) > Math.abs(diffY)
      ) {
        if (diffX < 0) {
          goTo(current + 1);
        } else {
          goTo(current - 1);
        }
      }
    });


    if (!slider.hasAttribute("tabindex")) {
      slider.setAttribute("tabindex", "0");
    }

    slider.addEventListener("keydown", (event) => {

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(current + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(current - 1);
      }

    });


    window.addEventListener("resize", updateSlider);

    updateSlider();
  }



  const videoCards = document.querySelectorAll(".video-card");

  videoCards.forEach((videoCard) => {

    const video = videoCard.querySelector(".video-card__video");

    if (!video) return;

    const hasMouse = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;


    if (hasMouse) {

      video.controls = false;

      videoCard.addEventListener("mouseenter", () => {
        video.controls = true;
      });

      videoCard.addEventListener("mouseleave", () => {

        if (
          document.fullscreenElement === video ||
          document.fullscreenElement === videoCard
        ) {
          return;
        }

        video.controls = false;
      });

    } else {
      video.controls = true;
    }

    const playButton = videoCard.querySelector(
      ".video-play, .video-card__play"
    );

    if (playButton) {

      playButton.addEventListener("click", async () => {

        if (video.paused) {

          try {
            await video.play();
            playButton.classList.add("is-playing");
          } catch (error) {
            console.error(
              "Не удалось запустить видео:",
              error
            );
          }

        } else {

          video.pause();
          playButton.classList.remove("is-playing");

        }

      });


      video.addEventListener("play", () => {
        playButton.classList.add("is-playing");
      });

      video.addEventListener("pause", () => {
        playButton.classList.remove("is-playing");
      });

    }


    const fullscreenButton = videoCard.querySelector(
      ".video-fullscreen"
    );

    if (fullscreenButton) {

      fullscreenButton.addEventListener("click", async () => {

        try {

      
          if (videoCard.requestFullscreen) {

            await videoCard.requestFullscreen();

          } else if (video.webkitEnterFullscreen) {

            video.webkitEnterFullscreen();

          }

        } catch (error) {

          console.error(
            "Не удалось открыть полноэкранный режим:",
            error
          );

        }

      });

    }

  });



  const revealElements = document.querySelectorAll(
    ".reveal, [data-reveal]"
  );

  if (revealElements.length) {

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {

      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });

    } else {

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.add("is-visible");

              observer.unobserve(entry.target);

            }

          });

        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px"
        }
      );

      revealElements.forEach((element) => {
        revealObserver.observe(element);
      });

    }

  }


  const contactForm = document.querySelector(".contact-form");

  if (contactForm) {

   

    let formHint = contactForm.querySelector(
      ".form-chat-hint, .chat-hint, [data-form-hint]"
    );

    if (!formHint) {

      formHint = document.createElement("div");

      formHint.className = "form-chat-hint";

      formHint.setAttribute("role", "status");
      formHint.setAttribute("aria-live", "polite");

      formHint.textContent =
        "Заполните форму — я подскажу, что указать.";

      const submitButton =
        contactForm.querySelector('button[type="submit"]');

      if (submitButton) {
        contactForm.insertBefore(
          formHint,
          submitButton
        );
      } else {
        contactForm.appendChild(formHint);
      }

    }


    const hints = {

      name:
        "Как к вам обращаться? Достаточно имени.",

      phone:
        "Укажите номер телефона, по которому с вами можно связаться.",

      email:
        "На эту почту можно отправить документы или ответ после консультации.",

      company:
        "Если компании ещё нет — это поле можно оставить пустым.",

      message:
        "Кратко расскажите о бизнесе: ИП или ООО, система налогообложения, сотрудники и основная задача."

    };


    const fields = contactForm.querySelectorAll(
      "input, textarea"
    );


    fields.forEach((field) => {

      field.addEventListener("focus", () => {

        const key =
          field.name ||
          field.id;

        if (hints[key]) {

          formHint.textContent = hints[key];
          formHint.classList.add("is-visible");

        }

      });


      field.addEventListener("input", () => {

       
        if (
          field.name === "message" &&
          field.value.length > 30
        ) {

          formHint.textContent =
            "Отлично — этого уже достаточно, чтобы понять вашу задачу.";

        }

      });

    });


    contactForm.addEventListener("submit", (event) => {

      if (!contactForm.checkValidity()) {

        event.preventDefault();

        formHint.textContent =
          "Проверьте обязательные поля — некоторые данные ещё не заполнены.";

        formHint.classList.add("is-visible");

        contactForm.reportValidity();

        return;

      }

      formHint.textContent =
        "Спасибо! Форма заполнена корректно.";

      formHint.classList.add("is-visible");

    });

  }



  const header = document.querySelector(".header");

  if (header) {

   
    const menuButtons = header.querySelectorAll(
      "button[aria-controls]"
    );


    function closeMenu(button) {

      const targetId =
        button.getAttribute("aria-controls");

      const target =
        document.getElementById(targetId);

      button.setAttribute(
        "aria-expanded",
        "false"
      );

      target?.classList.remove("is-open");

      button
        .closest("li")
        ?.classList.remove("is-open");

    }


    function openMenu(button) {

      const targetId =
        button.getAttribute("aria-controls");

      const target =
        document.getElementById(targetId);

      button.setAttribute(
        "aria-expanded",
        "true"
      );

      target?.classList.add("is-open");

      button
        .closest("li")
        ?.classList.add("is-open");

    }


    menuButtons.forEach((button) => {

      button.addEventListener("click", (event) => {

        event.stopPropagation();

        const isOpen =
          button.getAttribute("aria-expanded") ===
          "true";


        if (isOpen) {

          closeMenu(button);

        } else {

          const parent =
            button.closest("nav, .header");

          parent
            ?.querySelectorAll(
              'button[aria-expanded="true"]'
            )
            .forEach((otherButton) => {

              if (otherButton !== button) {
                closeMenu(otherButton);
              }

            });


          openMenu(button);

        }

      });

    });


    document.addEventListener("click", (event) => {

      if (!header.contains(event.target)) {

        menuButtons.forEach((button) => {
          closeMenu(button);
        });

      }

    });


    document.addEventListener("keydown", (event) => {

      if (event.key !== "Escape") return;

      menuButtons.forEach((button) => {
        closeMenu(button);
      });

    });


   
    header
      .querySelectorAll("nav a")
      .forEach((link) => {

        link.addEventListener("click", () => {

          if (window.innerWidth <= 900) {

            menuButtons.forEach((button) => {
              closeMenu(button);
            });

          }

        });

      });

  }



  const anchorLinks =
    document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

      const href =
        link.getAttribute("href");

      if (!href || href === "#") return;

      const target =
        document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      const headerHeight =
        document.querySelector(".header")
          ?.offsetHeight || 0;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight -
        10;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });

    });

  });

});
