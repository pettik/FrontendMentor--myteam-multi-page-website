"use strict";

// MOBILE NAVIGATION

const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".site-nav__close");
const menu = document.querySelector(".site-nav");
const overlay = document.querySelector(".menu-overlay");

if (menuToggle && menuClose && menu && overlay) {
  let previousOverflow = "";

  const backgroundElements = [
    document.querySelector(".site-header__logo"),
    menuToggle,
    document.querySelector("main"),
    document.querySelector(".site-footer"),
  ].filter(Boolean);

  function openMenu() {
    previousOverflow = document.body.style.overflow;

    menu.inert = false;

    menu.classList.add("is-open");
    overlay.classList.add("is-open");

    menuToggle.setAttribute("aria-expanded", "true");

    backgroundElements.forEach((element) => {
      element.inert = true;
    });

    document.body.style.overflow = "hidden";

    menuClose.focus();
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    overlay.classList.remove("is-open");

    menuToggle.setAttribute("aria-expanded", "false");

    backgroundElements.forEach((element) => {
      element.inert = false;
    });

    menu.inert = true;

    document.body.style.overflow = previousOverflow;

    menuToggle.focus();
  }

  menuToggle.addEventListener("click", openMenu);

  menuClose.addEventListener("click", closeMenu);

  overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (!menu.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    if (event.key === "Tab") {
      const focusable = [menuClose, ...menu.querySelectorAll("a[href]")];

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}
