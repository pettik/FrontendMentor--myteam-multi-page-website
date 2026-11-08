import { beforeEach, describe, expect, it } from "vitest";
import { loadPage, pressKey } from "./helpers/page.js";

const pages = ["index.html", "about.html", "contact.html"];

describe("shared navigation on every page", () => {
  it.each(pages)("opens and closes accessibly on %s", async (filename) => {
    const { document, window } = await loadPage(filename);
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".site-nav");
    const close = document.querySelector(".site-nav__close");
    const background = document.querySelectorAll(
      ".skip-link, .site-header__logo, .menu-toggle, main, .site-footer",
    );

    expect(menu.inert).toBe(true);
    toggle.click();

    expect(menu.inert).toBe(false);
    expect(menu.getAttribute("role")).toBe("dialog");
    expect(menu.getAttribute("aria-modal")).toBe("true");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(close);
    expect(document.body.style.overflow).toBe("hidden");
    for (const element of background) expect(element.inert).toBe(true);

    pressKey(window, "Escape");

    expect(menu.inert).toBe(true);
    expect(menu.hasAttribute("role")).toBe(false);
    expect(menu.hasAttribute("aria-modal")).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(toggle);
    expect(document.body.style.overflow).toBe("");
    for (const element of background) expect(element.inert).toBe(false);
  });
});

describe("mobile navigation behaviour", () => {
  let page;
  let menu;
  let toggle;
  let close;
  let links;

  beforeEach(async () => {
    page = await loadPage("index.html");
    menu = page.document.querySelector(".site-nav");
    toggle = page.document.querySelector(".menu-toggle");
    close = page.document.querySelector(".site-nav__close");
    links = [...menu.querySelectorAll("a[href]")];
  });

  it("wraps Tab and Shift+Tab at the ends of the open menu", () => {
    toggle.click();
    const backwards = pressKey(page.window, "Tab", { shiftKey: true });

    expect(backwards.defaultPrevented).toBe(true);
    expect(page.document.activeElement).toBe(links.at(-1));

    const forwards = pressKey(page.window, "Tab");
    expect(forwards.defaultPrevented).toBe(true);
    expect(page.document.activeElement).toBe(close);
  });

  it.each([".site-nav__close", ".menu-overlay"])(
    "dismisses through %s and restores focus",
    (selector) => {
      toggle.click();
      page.document.querySelector(selector).click();

      expect(menu.inert).toBe(true);
      expect(menu.classList.contains("is-open")).toBe(false);
      expect(page.document.querySelector(".menu-overlay").classList.contains("is-open")).toBe(false);
      expect(page.document.activeElement).toBe(toggle);
      expect(page.document.body.style.overflow).toBe("");
    },
  );

  it("restores existing scroll styles even after repeated open and close requests", () => {
    page.document.body.style.overflow = "scroll";
    toggle.click();
    toggle.click();
    close.click();

    expect(page.document.body.style.overflow).toBe("scroll");

    page.document.body.style.overflow = "auto";
    close.click();
    expect(page.document.body.style.overflow).toBe("auto");
  });

  it("leaves keyboard defaults alone while the menu is closed", () => {
    expect(pressKey(page.window, "Tab").defaultPrevented).toBe(false);
    expect(pressKey(page.window, "Escape").defaultPrevented).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("does not intercept ordinary Tab movement inside an open menu", () => {
    toggle.click();
    links[0].focus();

    expect(pressKey(page.window, "Tab").defaultPrevented).toBe(false);
    expect(pressKey(page.window, "ArrowDown").defaultPrevented).toBe(false);
  });

  it("preserves an open menu when resizing within the mobile breakpoint", () => {
    toggle.click();
    page.setViewportWidth(767);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(page.document.body.style.overflow).toBe("hidden");
    expect(page.document.activeElement).toBe(close);
  });

  it("closes at 768px, releases the background and moves focus off the hidden close button", () => {
    toggle.click();
    page.setViewportWidth(768);

    expect(menu.inert).toBe(false);
    expect(menu.hasAttribute("aria-modal")).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(page.document.querySelector("main").inert).toBe(false);
    expect(page.document.body.style.overflow).toBe("");
    expect(page.document.activeElement).toBe(links[0]);
    expect(pressKey(page.window, "Tab").defaultPrevented).toBe(false);
  });

  it("preserves focus on a navigation link that remains visible on desktop", () => {
    toggle.click();
    links[1].focus();
    page.setViewportWidth(1440);

    expect(menu.inert).toBe(false);
    expect(page.document.activeElement).toBe(links[1]);
    expect(page.document.body.style.overflow).toBe("");
  });

  it("moves focus from the mobile toggle to the desktop navigation", () => {
    toggle.focus();
    page.setViewportWidth(1440);

    expect(page.document.activeElement).toBe(links[0]);
  });
});

describe("desktop navigation", () => {
  it("starts usable and ignores requests to open the mobile dialog", async () => {
    const { document } = await loadPage("index.html", { width: 1440 });
    const menu = document.querySelector(".site-nav");

    expect(menu.inert).toBe(false);
    document.querySelector(".menu-toggle").click();

    expect(menu.hasAttribute("role")).toBe(false);
    expect(menu.classList.contains("is-open")).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("moves focus to the toggle when returning to a closed mobile navigation", async () => {
    const { document, setViewportWidth } = await loadPage("index.html", { width: 1440 });
    document.querySelector(".site-nav a").focus();
    setViewportWidth(767);

    expect(document.querySelector(".site-nav").inert).toBe(true);
    expect(document.activeElement).toBe(document.querySelector(".menu-toggle"));
    expect(document.body.style.overflow).toBe("");
  });
});
