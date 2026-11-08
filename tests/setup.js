import { afterEach, vi } from "vitest";
import { closePages } from "./helpers/page.js";

afterEach(() => {
  closePages();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
