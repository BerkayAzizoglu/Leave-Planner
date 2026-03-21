# CLAUDE.md — Leave-Planner

This file provides guidance for AI assistants (Claude and others) working in this repository.

---

## Project Overview

**Leave-Planner** is a leave management application designed to help teams and organizations plan, track, and manage employee leave (vacation, sick days, holidays, etc.).

**Repository:** `BerkayAzizoglu/Leave-Planner`
**Status:** Early-stage / project initialization

---

## Repository State

As of March 2026, this repository is in its initial setup phase:

```
Leave-Planner/
├── CLAUDE.md          # AI assistant guidance (this file)
└── README.md          # Project overview stub
```

No application code, configuration files, or dependencies have been added yet. When the project grows, update this file to reflect the actual structure.

---

## Development Setup

> Update this section once the technology stack is chosen and dependencies are defined.

Expected setup steps will include:
1. Clone the repository
2. Install dependencies (e.g., `npm install` or `pip install -r requirements.txt`)
3. Copy environment template: `cp .env.example .env`
4. Configure environment variables
5. Run database migrations (if applicable)
6. Start the development server

---

## Git Workflow

### Branch Naming

- Feature branches: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`
- Documentation: `docs/<short-description>`
- AI/automated branches: `claude/<task-description>-<ticket-id>`

### Commit Messages

Write clear, imperative commit messages:

```
Add leave request approval workflow
Fix off-by-one error in leave balance calculation
Update README with setup instructions
```

- Keep the subject line under 72 characters
- Use the body to explain *why*, not *what*

### Pull Requests

- Create PRs against `main` (or `master`)
- Include a description of what changed and why
- Reference related issues where applicable

---

## Key Conventions (To Be Established)

The following conventions should be documented here once the stack is decided:

### Code Style
- Linting and formatting tools (ESLint/Prettier for JS/TS, Black/Flake8 for Python, etc.)
- File and directory naming conventions
- Import ordering rules

### Architecture Patterns
- State management approach (if frontend)
- API design conventions (REST, GraphQL, etc.)
- Database access patterns (ORM, raw queries, etc.)
- Error handling strategy

### Testing
- Testing framework and runner
- Test file naming and co-location conventions
- Coverage requirements
- How to run tests: `npm test`, `pytest`, etc.

### Environment Variables
- List all required env vars with descriptions
- Never commit secrets or `.env` files
- Provide a `.env.example` with placeholder values

---

## Domain Knowledge

### Leave Management Concepts

When implementing features, keep these domain concepts in mind:

- **Leave Types:** Vacation, sick leave, personal days, public holidays, parental leave, etc.
- **Leave Balance:** The number of days an employee is entitled to per period (usually annual)
- **Leave Request:** An employee's submission to take time off on specific dates
- **Approval Workflow:** Requests may require manager/HR approval before being confirmed
- **Leave Calendar:** A shared view showing team availability and leave schedules
- **Carry-Over:** Unused leave that rolls over into the next period (often capped)
- **Blackout Dates:** Periods during which leave cannot be taken (e.g., peak seasons)
- **Half-Days:** Some systems allow booking partial days

### Common Business Rules

- Employees cannot take more leave than their balance allows
- Overlapping leave requests for the same team may need to be flagged
- Public holidays typically do not count against personal leave balance
- Leave requests must respect notice periods (e.g., at least 2 weeks in advance)

---

## Working as an AI Assistant

### Dos

- Read existing files before modifying them
- Keep changes focused and minimal — avoid unnecessary refactoring
- Follow the conventions already established in the codebase
- Write clear commit messages and create PRs against the correct base branch
- Ask clarifying questions if requirements are ambiguous
- Update this `CLAUDE.md` when significant architectural decisions are made

### Don'ts

- Don't commit secrets, API keys, or credentials
- Don't force-push to `main`/`master` without explicit permission
- Don't introduce new dependencies without discussion
- Don't add unnecessary abstractions or premature optimizations
- Don't leave TODOs or dead code in committed changes

### When Adding Features

1. Understand the existing code structure before writing new code
2. Follow patterns already present in the codebase
3. Write or update tests alongside the implementation
4. Update relevant documentation (README, API docs, this file)

---

## Updating This File

This `CLAUDE.md` should be kept up-to-date as the project evolves. Update it when:

- The technology stack is chosen
- New tools or workflows are adopted
- Architectural decisions are made
- New domain concepts are introduced
- Setup or deployment steps change
