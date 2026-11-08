import { beforeEach, describe, expect, it } from "vitest";
import { loadPage } from "./helpers/page.js";

describe("contact form validation", () => {
  let document;
  let window;
  let form;
  let fields;
  let status;

  beforeEach(async () => {
    ({ document, window } = await loadPage("contact.html"));
    form = document.querySelector(".contact-form");
    fields = Object.fromEntries(
      ["name", "email", "company", "title", "message"].map((name) => [
        name,
        form.elements.namedItem(name)
      ]),
    );
    status = form.querySelector("[role='status']");
  });

  function input(name, value) {
    const field = fields[name];
    field.value = value;
    field.dispatchEvent(new window.Event("input", { bubbles: true }));
  }

  function fillValidForm(email = "petra@example.com") {
    input("name", "Petra");
    input("email", email);
    input("message", "I would like to discuss distributed teams.");
  }

  function submit() {
    const event = new window.SubmitEvent("submit", {
      bubbles: true,
      cancelable: true,
      submitter: form.querySelector("button[type='submit']")
    });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  }

  function errorFor(name) {
    return document.getElementById(`${fields[name].id}-error`);
  }

  function expectError(name, message) {
    const error = errorFor(name);
    expect(error.textContent).toBe(message);
    expect(error.hidden).toBe(false);
    expect(fields[name].getAttribute("aria-invalid")).toBe("true");
    expect(fields[name].getAttribute("aria-describedby").split(/\s+/)).toContain(error.id);
  }

  it("enables validation and submission after setup, with an initially empty live region", () => {
    expect(form.noValidate).toBe(true);
    expect(form.querySelector("button[type='submit']").disabled).toBe(false);
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toBe("");
    for (const name of ["name", "email", "message"]) expect(errorFor(name).hidden).toBe(true);
  });

  it("waits for a submission before showing errors on blur", () => {
    fields.name.focus();
    fields.email.focus();

    expect(errorFor("name").hidden).toBe(true);
    expect(fields.name.hasAttribute("aria-invalid")).toBe(false);
  });

  it("reports all three required fields and focuses the first invalid control", () => {
    submit();

    for (const name of ["name", "email", "message"]) expectError(name, "This field is required");
    expect(document.activeElement).toBe(fields.name);
    expect(status.textContent).toBe("Please correct the 3 highlighted fields.");
  });

  it.each(["name", "message"])("rejects whitespace-only %s without clearing other values", (name) => {
    fillValidForm();
    input(name, " \n\t ");
    submit();

    expectError(name, "This field is required");
    expect(document.activeElement).toBe(fields[name]);
    expect(fields.email.value).toBe("petra@example.com");
  });

  it.each([
    "person.example.com",
    "person@",
    "@example.com",
    "person@@example.com",
    "person example@example.com"
  ])("rejects the invalid email %s using native email validity", (email) => {
    fillValidForm(email);
    expect(fields.email.validity.typeMismatch).toBe(true);
    submit();

    expectError("email", "Please use a valid email address");
    expect(document.activeElement).toBe(fields.email);
    expect(status.textContent).toBe("Please correct the highlighted field.");
  });

  it("treats an empty email as required instead of a formatting error", () => {
    fillValidForm();
    input("email", "   ");
    submit();

    expectError("email", "This field is required");
  });

  it.each(["petra@example.com", "petra+project@sub.example.com"])(
    "accepts %s with optional fields empty and preserves the entered data",
    (email) => {
      fillValidForm(email);
      submit();

      expect(fields.company.required).toBe(false);
      expect(fields.title.required).toBe(false);
      expect(status.textContent).toBe("Your details are valid. No message has been sent.");
      expect(fields.name.value).toBe("Petra");
      expect(fields.email.value).toBe(email);
      expect(fields.message.value).toBe("I would like to discuss distributed teams.");
      expect(form.querySelectorAll("[aria-invalid='true']")).toHaveLength(0);
    },
  );

  it("accepts surrounding email whitespace", () => {
    fillValidForm("  petra@example.com  ");
    submit();

    expect(fields.email.value).toBe("petra@example.com");
    expect(errorFor("email").hidden).toBe(true);
    expect(status.textContent).toBe("Your details are valid. No message has been sent.");
  });

  it("clears an email error as the user corrects it, without a second submission", () => {
    fillValidForm("invalid-email");
    submit();
    expectError("email", "Please use a valid email address");

    input("email", "petra@example.com");

    expect(errorFor("email").hidden).toBe(true);
    expect(errorFor("email").textContent).toBe("");
    expect(fields.email.hasAttribute("aria-invalid")).toBe(false);
    expect(status.textContent).toBe("");
  });

  it("clears a required-field error as the user fills it in", () => {
    submit();
    input("name", "Petra");

    expect(errorFor("name").hidden).toBe(true);
    expect(fields.name.hasAttribute("aria-invalid")).toBe(false);
    expect(errorFor("message").hidden).toBe(false);
  });

  it("revalidates on blur after a previously valid field is emptied", () => {
    fillValidForm();
    submit();
    fields.name.focus();
    input("name", "");
    expect(errorFor("name").hidden).toBe(true);

    fields.email.focus();
    expectError("name", "This field is required");
  });

  it("removes stale status feedback when an optional field changes", () => {
    fillValidForm();
    submit();
    input("company", "Example company");
    input("title", "Engineering lead");

    expect(status.textContent).toBe("");
    expect(fields.company.hasAttribute("aria-invalid")).toBe(false);
    expect(fields.title.hasAttribute("aria-invalid")).toBe(false);
    submit();
    expect(status.textContent).toBe("Your details are valid. No message has been sent.");
  });
});

it("keeps submission disabled and explains the requirement when JavaScript is unavailable", async () => {
  const { document } = await loadPage("contact.html", { runScripts: false });

  expect(document.querySelector(".contact-form__submit").disabled).toBe(true);
  expect(document.querySelector("noscript").textContent).toContain("Enable JavaScript");
});

it("can load the contact script on a page without a form", async () => {
  await loadPage("index.html");
  await expect(import("../assets/js/contact.js")).resolves.toBeDefined();
});
