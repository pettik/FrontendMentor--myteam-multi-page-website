import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { vi } from "vitest";

const openPages = new Set();
const scriptLoaders = {
  "./assets/js/main.js": () => import("../../assets/js/main.js"),
  "./assets/js/contact.js": () => import("../../assets/js/contact.js")
};

// jsdom does not evaluate media queries. Model the min-width queries used by
// the navigation, and emit changes only when a breakpoint is crossed.
function installViewport(window, initialWidth) {
  let width = initialWidth;
  const queries = new Map();

  window.matchMedia = vi.fn((query) => {
    if (!queries.has(query)) {
      const match = query.match(/^\(min-width:\s*([\d.]+)(em|px)\)$/);
      if (!match) throw new Error(`Unsupported test media query: ${query}`);

      const minimum = Number(match[1]) * (match[2] === "em" ? 16 : 1);
      const mediaQuery = Object.assign(new window.EventTarget(), {
        media: query,
        matches: width >= minimum
      });

      queries.set(query, { minimum, mediaQuery });
    }

    return queries.get(query).mediaQuery;
  });

  return (nextWidth) => {
    width = nextWidth;

    for (const { minimum, mediaQuery } of queries.values()) {
      const matches = width >= minimum;
      if (matches === mediaQuery.matches) continue;

      mediaQuery.matches = matches;
      mediaQuery.dispatchEvent(new window.Event("change"));
    }
  };
}

export async function loadPage(filename, { width = 375, runScripts = true } = {}) {
  vi.resetModules();

  const html = readFileSync(new URL(`../../${filename}`, import.meta.url), "utf8");
  const dom = new JSDOM(html, { url: `https://myteam.test/${filename}` });
  openPages.add(dom);

  const { window } = dom;
  const { document } = window;
  const setViewportWidth = installViewport(window, width);
  vi.stubGlobal("window", window);
  vi.stubGlobal("document", document);

  // Import the actual linked application scripts through Vitest so coverage
  // measures production code. External assets and inline scripts never run.
  if (runScripts) {
    for (const script of document.querySelectorAll("script[src]")) {
      const source = script.getAttribute("src");
      const loadScript = scriptLoaders[source];
      if (!loadScript) throw new Error(`Add a loader for the page script: ${source}`);
      await loadScript();
    }
  }

  return { document, window, setViewportWidth };
}

export function closePages() {
  for (const dom of openPages) dom.window.close();
  openPages.clear();
}

export function pressKey(window, key, { shiftKey = false } = {}) {
  const event = new window.KeyboardEvent("keydown", {
    key,
    shiftKey,
    bubbles: true,
    cancelable: true
  });
  window.document.activeElement.dispatchEvent(event);
  return event;
}
