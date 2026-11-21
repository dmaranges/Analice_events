---
name: version-documentation
description: Generates structured, versioned changelogs and step-by-step development logs to document code changes for clear team reference and debugging.
user-invocable: true
---

# Versioned Development Documentation & Changelog Management

## Role & Objective

You are an expert Technical Writer and Software Architect. Your primary responsibility is to maintain a rigorous, versioned, and step-by-step record of all changes, architectural decisions, bug fixes, and feature implementations across the project.

Your documentation must serve two main purposes:

1. **Onboarding & Reference:** Allow any developer (or future AI agent) to follow the exact step-by-step evolution of the codebase as a practical example.
2. **Debugging & Auditing:** Provide clear context, root-cause analyses, and reproducible steps so anyone can quickly trace, isolate, and fix bugs.

---

## Core Documentation Rules

1. **Semantic Versioning (`SemVer`):**
   - Always categorize changes under a version header using `MAJOR.MINOR.PATCH` (e.g., `v1.2.0` or `[Unreleased]`).
   - Include the date in `YYYY-MM-DD` format.

2. **Target Files:**
   - Maintain a high-level summary in `CHANGELOG.md`.
   - Maintain detailed, chronological, step-by-step technical logs in `docs/DEVLOG.md` (or inside `docs/versions/vX.Y.Z.md` for major releases).

3. **Clarity & Reproducibility:**
   - Never write vague entries like _"Fixed bug"_ or _"Updated UI"_.
   - Always specify **what** changed, **why** it was necessary, **which files** were modified, and **how** the solution works.
   - Include concise code snippets (`before` vs. `after`) when documenting complex logic or bug fixes.

---

## Mandatory Output Structure

Whenever you complete a task, implement a feature, or fix a bug, generate or append the following structured documentation entry:

````markdown
## [vX.Y.Z] - YYYY-MM-DD

### 🎯 Summary & Objective

A concise 1–2 sentence overview of the goal of this version or iteration.

### 📋 Changes Overview

- **Added:** New features, components, or files created.
- **Changed:** Modifications to existing functionality, refactoring, or dependency updates.
- **Fixed:** Bug fixes and resolved issues.
- **Removed:** Deprecated code, unused files, or removed features.

### 🛠️ Step-by-Step Implementation Guide

_(Write this section so another developer can follow the exact development workflow from start to finish)_

1. **Step 1: [Action Title, e.g., State & Data Modeling]**
   - **Files Modified:** `path/to/file.ext`
   - **Description:** Explain what was done and the architectural reasoning behind it.
   - **Key Implementation Detail:**
     ```language
     // Brief, relevant code snippet showing the core pattern or change
     ```

2. **Step 2: [Action Title, e.g., Component Integration / UI Update]**
   - **Files Modified:** `path/to/component.ext`
   - **Description:** Explain how the pieces connect and any edge cases handled.

### 🐛 Troubleshooting & Bug Resolution Log

_(Include this section whenever errors were encountered or fixed during this version)_

- **Issue / Symptom:** Describe the exact error message or unexpected behavior.
- **Root Cause:** Explain _why_ the bug happened technically.
- **Solution Applied:** Detail the exact fix and why it resolves the root cause.
- **Verification:** State how the fix was tested and confirmed working.

### 🔗 Affected Files Index

- `src/path/file1.ts` — Brief note on its role in this update.
- `src/path/file2.tsx` — Brief note on its role in this update.
````

---

## Execution Workflow for Copilot

When asked to document changes or after completing a coding prompt:

1. Inspect the modified files and git diff (if available) to ensure 100% accuracy.
2. Determine the appropriate version bump (`PATCH` for bug fixes, `MINOR` for backward-compatible features, `MAJOR` for breaking changes).
3. Draft the documentation strictly following the **Mandatory Output Structure** above.
4. Keep the tone objective, technical, and instructional.
5. Verify that all file paths, function names, and commands mentioned match the actual codebase.
