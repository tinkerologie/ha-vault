# Contributing to Home Assistant Vault Integration

Thank you for your interest in contributing to Home Assistant Vault Integration. This project welcomes contributions from human developers and autonomous AI coding agents alike.

Home Assistant integration for Vault backup management, job monitoring, and snapshots.

To maintain code quality, protect maintainer capacity, and prevent maintainer burnout, all contributors must follow the standardized development and governance workflow outlined below.

---

## Code of Conduct and Standards

- Be respectful, constructive, and collaborative.
- Zero secrets policy: Never commit passwords, tokens, API keys, private certificates, or personal data.
- Anti-burnout principle: Perform full due diligence locally before opening pull requests or requesting review.

---

## Documentation style

Use [ASD-STE100 Simplified Technical English, Issue 9](https://www.asd-ste100.org/STE_downloads.html) for new or revised technical prose.

- Use dictionary words only with their approved meanings and parts of speech. Use the same technical term for each concept.
- Use active voice. In descriptive text, use passive voice only if the reader does not need to know who or what does the action. Use the imperative for instructions.
- Use a maximum of 20 words for each instruction and 25 words for each descriptive sentence.
- Put one instruction in each sentence unless the actions occur at the same time.
- Put a condition before the command if the reader must know the condition first.
- Keep the original commands, identifiers, and interface labels. Examine the prose that explains them.

Examine the writing rules and the dictionary before you submit a documentation change.

## Development Workflow

All contributions—whether submitted by humans or AI agents—must adhere to this step-by-step workflow:

### 1. Open a GitHub Issue First

- Every bug fix, feature, or enhancement must start with an issue.
- Use the appropriate GitHub Issue Form:
  - Bug Report (`01-bug-report.yml`)
  - Enhancement Request (`02-enhancement-request.yml`)
- Blank or unstructured issues are disabled. Pull requests without a corresponding issue will be closed.

### 2. CodeRabbit AI Plan Generation

- Once the issue is created, CodeRabbit AI is triggered to generate an implementation plan (either automatically via the `bug` or `enhancement` label, or by commenting `@coderabbitai plan` on the issue).
- CodeRabbit analyzes the codebase and posts a comprehensive Coding Plan containing:
  - Codebase research and affected components
  - Architectural design choices
  - Phased task breakdowns
  - Machine-readable agent prompts and verifiable acceptance criteria
- Contributors must review, refine, and confirm the plan before writing code. Do not start implementation without an approved plan.

### 3. Create a Dedicated Branch

- Create a feature or bugfix branch off `main`:
  - Features: `git checkout -b feat/<issue-number>-<short-description>`
  - Fixes: `git checkout -b fix/<issue-number>-<short-description>`
  - Documentation: `git checkout -b docs/<issue-number>-<short-description>`
- Never commit directly to the default branch (`main`).

### 4. Implementation and Local Validation

- Implement changes following project conventions and the approved plan.
- Update `CHANGELOG.md` under `## [Unreleased]` describing what changed and why.
- Run all required local validation checks (tests with coverage, linters, type checkers, and formatters). Ensure all checks pass with zero errors and zero warnings.

### 5. Follow the Pull Request Template

- Open a Pull Request using `.github/pull_request_template.md`.
- Complete all sections in the template:
  - Summary of changes
  - Linked issue keywords (`Fixes #<issue>`, `Closes #<issue>`, `Addresses #<issue>`)
  - Verification steps and pasted terminal output
  - Mandatory Pre-Submission Governance checklist (every box must be checked)

### 6. Open PR as DRAFT First

- Pull requests MUST be opened in Draft mode (`gh pr create --draft` or choose "Create draft pull request" in GitHub).
- Draft PRs allow CI workflows to run in isolation without triggering premature reviewer notifications or consuming unnecessary review capacity.
- Verify that all CI checks pass in draft mode and confirm that everything is working as expected from your end.

### 7. Mark Ready for Review

- Only after all local and draft CI checks have succeeded, convert the pull request to "Ready for Review".
- Pull requests marked ready for review with failing checks, incomplete templates, or unverified changes will be converted back to draft or closed.

### 8. Automated Quality Gates and Merge Criteria

Before a pull request can be merged, it must satisfy all automated quality gates:

- CodeRabbit AI Review: All review comments and suggestions must be resolved or addressed.
- GitHub Copilot Code Review: Must pass with no blocking feedback.
- Codecov Coverage Reports: Must pass with zero errors, zero warnings, and no coverage regressions below the repository target.
- Branch Ruleset Checks: All required status checks defined in the default branch ruleset must pass.

---

## Local Development and Verification

### Prerequisites and Setup

- Python 3.14.2 or later (Home Assistant 2026.11 requires it)
- A virtual environment with the project dependencies. Run `script/setup/bootstrap` to install them.
- Pre-commit (`pre-commit install`)

The tests use the official `pytest-homeassistant` plugin. The plugin version must match Home Assistant. The bootstrap and test scripts install both versions from `script/.lib/ha-test-harness.sh`.

To install the current test harness manually:

1. Remove the old plugins that share fixtures with the current plugin.

   ```bash
   uv pip uninstall pytest-homeassistant-custom-component pytest-home-assistant
   ```

2. Install Home Assistant and its matching plugin.

   ```bash
   uv pip install --reinstall-package pytest-homeassistant "homeassistant==2026.11.0" "pytest-homeassistant @ https://github.com/home-assistant/core/archive/refs/tags/2026.11.0.tar.gz#subdirectory=packages/pytest-homeassistant"
   ```

The plugin for 2026.11.0 comes from the Core tag. If PyPI has a matching release, you can use `pytest-homeassistant==<version>`. Always specify the version because PyPI also contains unrelated 0.1.x releases.

### Validation Commands

```bash
# Run tests (installs the pinned Home Assistant and pytest-homeassistant when they differ)
script/test
pytest
pytest --cov=custom_components --cov-report=term-missing

# Linting and formatting with ruff
ruff check .
ruff format --check .

# Static type checking
mypy custom_components

# Run all pre-commit hooks across all files
pre-commit run --all-files

# Import every module and fail on deprecated use reported by Home Assistant
python3 script/import_smoke.py

# Validate with Hassfest from the pinned Home Assistant Core release
./script/hassfest --skip-plugins ""

# Build the release zip (reproducible; written to dist/, which Git ignores)
python3 script/build_release_zip.py
```

---

## Commit Message Guidelines

We follow Conventional Commits:

- `feat(<scope>): <description>` — New feature
- `fix(<scope>): <description>` — Bug fix
- `docs(<scope>): <description>` — Documentation changes
- `test(<scope>): <description>` — Adding or updating tests
- `refactor(<scope>): <description>` — Code restructuring without functional change
- `chore(<scope>): <description>` — Tooling, dependencies, or repository maintenance

---

## Pull Request Governance Summary

- No spam or back-to-back PRs: Batch related changes into a single PR.
- AI-assisted PRs require human verification and local testing before submission.
- All template checkboxes must be confirmed.
- PRs must remain in Draft until verified.

## Issue and Pull Request Governance

These rules apply to every contributor, including AI coding agents. The full org-wide rules are in
[GOVERNANCE.md](https://github.com/tinkerologie/.github/blob/main/GOVERNANCE.md).

1. **Issue first.** Open an issue with the bug or enhancement template before opening a pull
   request. Keep the title prefix `[Bug]:` or `[Enhancement]:`, followed by a space and the title.
   Automation applies the `bug` or `enhancement` label when it can tell the type, and CodeRabbit
   then posts a Coding Plan on the issue. Implement from that plan. The labeler skips issues labeled
   `question`, `duplicate`, `invalid`, `wontfix`, or `no-type`, and never re-adds a type label that
   a maintainer removed.
2. **Link the issue.** In **Related Issues**, use `Closes #<number>`, `Fixes #<number>`, or `Resolves #<number>` if the pull request completes the issue. These keywords close the issue when the pull request merges.
   For partial work, use `Part of #<number>` or `Related to #<number>`. The issue must exist. You can link a public issue in another repository (`owner/repo#123`).
   Only maintainers with write access or higher can use `None` for housekeeping. Examples include documentation, CI, and dependency changes.
3. **One change at a time.** Contributors without write access can have at most 2 open, non-draft
   pull requests here. GitHub enforces this limit, and draft pull requests do not count toward it.
   Do not open PRs that edit the same files as another open PR, such as `CHANGELOG.md`,
   translations, `README.md`, or generated bundles. Wait for the first to merge, rebase, then
   continue.
4. **Act on the Tinkerologie-Bot report.** When PR governance fails, Tinkerologie-Bot posts one comment
   listing every problem as a numbered item. Fix each item by editing the PR description or pushing
   the missing change. The check runs again and updates the comment.
5. **Rebase before review.** Rebase on `main` before marking a PR ready for review.
6. **Resolve conflicts first.** If a pull request has the `conflicts` label, rebase on `main`. Resolve the conflicts. Keep every `CHANGELOG.md` entry under `[Unreleased]`. Run the tests again. Then force-push before you continue.
7. **Stale items.** Issues and PRs with no activity for 14 days are labeled `stale` and closed 30
   days later unless there is new activity. These labels are exempt:
   - Issues: `pinned`, `security`, `confirmed`, `work-in-progress`, `priority: critical`, `priority: high`.
   - Pull requests: `pinned`, `security`, `work-in-progress`.
