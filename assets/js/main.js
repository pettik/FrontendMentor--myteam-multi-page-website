"use strict";

// MOBILE NAVIGATION

const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".site-nav__close");
const menu = document.querySelector(".site-nav");
const overlay = document.querySelector(".menu-overlay");

if (menuToggle && menuClose && menu && overlay) {
  const desktopViewport = window.matchMedia("(min-width: 48em)");
  let isMenuOpen = false;
  let previousOverflow = "";

  const backgroundElements = [
    document.querySelector(".skip-link"),
    document.querySelector(".site-header__logo"),
    menuToggle,
    document.querySelector("main"),
    document.querySelector(".site-footer"),
  ].filter(Boolean);

  function openMenu() {
    if (desktopViewport.matches || isMenuOpen) return;

    isMenuOpen = true;
    previousOverflow = document.body.style.overflow;

    menu.inert = false;

    menu.classList.add("is-open");
    overlay.classList.add("is-open");

    menuToggle.setAttribute("aria-expanded", "true");
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "true");

    backgroundElements.forEach((element) => {
      element.inert = true;
    });

    document.body.style.overflow = "hidden";

    menuClose.focus();
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (!isMenuOpen) return;

    isMenuOpen = false;
    menu.classList.remove("is-open");
    overlay.classList.remove("is-open");

    menuToggle.setAttribute("aria-expanded", "false");
    menu.removeAttribute("role");
    menu.removeAttribute("aria-modal");

    backgroundElements.forEach((element) => {
      element.inert = false;
    });

    menu.inert = !desktopViewport.matches;

    document.body.style.overflow = previousOverflow;

    if (restoreFocus) menuToggle.focus();
  }

  function syncNavigation() {
    const activeElement = document.activeElement;
    const focusDesktopLink =
      desktopViewport.matches &&
      (activeElement === menuToggle || activeElement === menuClose);
    const focusMobileToggle =
      !desktopViewport.matches && menu.contains(activeElement);

    closeMenu({ restoreFocus: false });
    menu.inert = !desktopViewport.matches;

    if (focusDesktopLink) {
      menu.querySelector("a[href]").focus();
    } else if (focusMobileToggle) {
      menuToggle.focus();
    }
  }

  menuToggle.addEventListener("click", openMenu);

  menuClose.addEventListener("click", closeMenu);

  overlay.addEventListener("click", closeMenu);

  desktopViewport.addEventListener("change", syncNavigation);
  syncNavigation();

  document.addEventListener("keydown", (event) => {
    if (!isMenuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
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

// ABOUT — DIRECTOR DETAILS

document.querySelectorAll(".director-card").forEach((card) => {
  const toggle = card.querySelector(".director-card__toggle");
  const avatar = card.querySelector(".director-card__avatar");
  const name = card.querySelector(".director-card__name");
  const role = card.querySelector(".director-card__role");
  const details = card.querySelector(".director-card__details");

  if (!toggle || !avatar || !name || !role || !details) return;

  function setExpanded(expanded) {
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute(
      "aria-label",
      `${expanded ? "Hide" : "Show"} details for ${name.textContent.trim()}`,
    );

    card.classList.toggle("is-expanded", expanded);
    avatar.hidden = expanded;
    role.hidden = expanded;
    details.hidden = !expanded;
  }

  setExpanded(toggle.getAttribute("aria-expanded") === "true");
  toggle.hidden = false;

  toggle.addEventListener("click", () => {
    setExpanded(toggle.getAttribute("aria-expanded") !== "true");
  });
});
