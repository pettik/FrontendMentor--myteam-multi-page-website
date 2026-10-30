# GitHub Copilot Instructions

## Project Guidelines

- Follow the existing project structure and coding conventions.
- Prefer clean, readable, and maintainable code.
- Avoid unrelated changes when implementing a feature or fixing a bug.
- Do not reformat files unless formatting is explicitly requested.
- Respect the project's Prettier and ESLint configuration.

## Git Commit Messages

Always generate commit messages in English.

Use Conventional Commits:

type: short description

Allowed types:

- feat: New functionality
- fix: Bug fixes and accessibility improvements
- refactor: Code restructuring without behavior changes
- style: Formatting-only changes
- docs: Documentation changes
- task: Configuration and maintenance
- test: Tests

Rules:

- Analyze the actual Git diff before suggesting a commit message.
- Describe what changed and why, not which file was edited.
- Keep the subject concise, preferably under 72 characters.
- Use an imperative, specific description.
- Never generate generic messages such as:
  - Update style.css
  - Update script.js
  - Update index.html
  - Update README.md
  - Fix code
  - Various changes
- Never invent changes not present in the diff.
- If a change includes unrelated concerns, recommend separate commits.
- Keep formatting-only changes separate from functional changes.

Examples:

Bad: Update style.css
Good: fix: improve responsive sidebar layout

Bad: Update script.js
Good: fix: prevent keyboard focus on hidden navigation

Bad: Update README.md
Good: docs: describe local development setup

Bad: Update index.html
Good: feat: add accessible navigation controls
