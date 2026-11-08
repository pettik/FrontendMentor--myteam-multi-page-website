import { beforeEach, describe, expect, it } from "vitest";
import { loadPage } from "./helpers/page.js";

const directors = [
  ["nikita", "Nikita Marks", "talent there is in every corner of the globe"],
  ["cristian", "Cristian Duncan", "You need to approach work in a new way"],
  ["cruz", "Cruz Hamer", "Technology is at the forefront"],
  ["drake", "Drake Heaton", "a surefire way to stunt innovation"],
  ["griffin", "Griffin Wise", "Unique perspectives shape unique products"],
  ["aden", "Aden Allan", "Set the north star and let them follow it"]
];

function expectCardState(card, expanded) {
  const button = card.querySelector("button");
  const name = card.querySelector("h3").textContent.trim();

  expect(button.hidden).toBe(false);
  expect(button.type).toBe("button");
  expect(button.getAttribute("aria-expanded")).toBe(String(expanded));
  expect(button.getAttribute("aria-label")).toBe(`${expanded ? "Hide" : "Show"} details for ${name}`);
  expect(card.querySelector(".director-card__details").hidden).toBe(!expanded);
  expect(card.querySelector(".director-card__avatar").hidden).toBe(expanded);
  expect(card.querySelector(".director-card__role").hidden).toBe(expanded);
  expect(card.classList.contains("is-expanded")).toBe(expanded);
}

describe("director card interactions", () => {
  let document;
  let cards;

  beforeEach(async () => {
    ({ document } = await loadPage("about.html"));
    cards = [...document.querySelectorAll(".director-card")];
  });

  it("starts with five collapsed cards and Aden's details expanded", () => {
    expect(cards).toHaveLength(6);
    for (const card of cards) {
      const isAden = card.querySelector("h3").id === "director-aden-name";
      expectCardState(card, isAden);
    }
  });

  it.each(directors)("shows and hides the correct biography for %s", (slug, name, quote) => {
    const heading = document.getElementById(`director-${slug}-name`);
    const card = heading.closest(".director-card");
    const button = card.querySelector("button");
    const details = document.getElementById(button.getAttribute("aria-controls"));

    expect(heading.textContent).toBe(name);
    expect(details).toBe(card.querySelector(".director-card__details"));
    if (button.getAttribute("aria-expanded") === "true") button.click();
    expectCardState(card, false);

    button.click();
    expectCardState(card, true);
    expect(details.textContent).toContain(quote);
    expect(details.querySelectorAll("a[href]")).toHaveLength(2);

    button.click();
    expectCardState(card, false);
  });

  it("lets multiple cards stay open independently", () => {
    cards[0].querySelector("button").click();
    cards[1].querySelector("button").click();

    expectCardState(cards[0], true);
    expectCardState(cards[1], true);
    expectCardState(cards[2], false);
    expectCardState(cards[5], true);

    cards[0].querySelector("button").click();
    expectCardState(cards[0], false);
    expectCardState(cards[1], true);
  });

  it("keeps focus on the disclosure button as its content changes", () => {
    const button = cards[0].querySelector("button");
    button.focus();
    button.click();
    expect(document.activeElement).toBe(button);
    button.click();
    expect(document.activeElement).toBe(button);
  });
});

it("keeps all biographies readable and inactive toggles hidden without JavaScript", async () => {
  const { document } = await loadPage("about.html", { runScripts: false });

  for (const card of document.querySelectorAll(".director-card")) {
    expect(card.querySelector(".director-card__details").hidden).toBe(false);
    expect(card.querySelector(".director-card__quote").textContent.trim()).not.toBe("");
    expect(card.querySelector("button").hidden).toBe(true);
  }
});
