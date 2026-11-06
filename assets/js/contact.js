"use strict";

// CONTACT — FRONTEND VALIDATION

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const requiredFields = [...contactForm.querySelectorAll("[required]")];
  const submitButton = contactForm.querySelector("[type='submit']");
  const status = contactForm.querySelector(".contact-form__status");
  let hasSubmitted = false;

  function validateField(field, { trimEmail = false } = {}) {
    if (trimEmail && field.type === "email") {
      field.value = field.value.trim();
    }

    let message = "";

    if (!field.value.trim()) {
      message = "This field is required";
    } else if (field.type === "email" && field.validity.typeMismatch) {
      message = "Please use a valid email address";
    }

    const error = document.getElementById(`${field.id}-error`);
    error.textContent = message;
    error.hidden = !message;

    if (message) {
      field.setAttribute("aria-invalid", "true");
    } else {
      field.removeAttribute("aria-invalid");
    }

    return !message;
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hasSubmitted = true;

    const invalidFields = requiredFields.filter(
      (field) => !validateField(field, { trimEmail: true }),
    );

    if (invalidFields.length) {
      status.textContent =
        invalidFields.length === 1
          ? "Please correct the highlighted field."
          : `Please correct the ${invalidFields.length} highlighted fields.`;
      invalidFields[0].focus();
      return;
    }

    // The challenge validates locally; there is no message-delivery endpoint.
    status.textContent = "Your details are valid. No message has been sent.";
  });

  contactForm.addEventListener("input", (event) => {
    status.textContent = "";
    const field = event.target;

    if (
      requiredFields.includes(field) &&
      field.getAttribute("aria-invalid") === "true"
    ) {
      validateField(field);
    }
  });

  contactForm.addEventListener("focusout", (event) => {
    if (hasSubmitted && requiredFields.includes(event.target)) {
      validateField(event.target, { trimEmail: true });
    }
  });

  // Enable custom validation only after the submission handler is ready.
  contactForm.noValidate = true;
  submitButton.disabled = false;
}
