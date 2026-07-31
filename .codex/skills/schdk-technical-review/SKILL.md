---
name: schdk-technical-review
description: Review SCHDK for evidenced P0-P2 correctness, security, data-loss, performance, and maintainability issues. Use for technical reviews, audits, or serious problem discovery.
---

# SCHDK Technical Review

## Review

1. Read `docs/RULES.md` and the rule areas relevant to the reviewed code.
2. Inspect the requested scope. When none is given, review the whole tracked project, including uncommitted changes.
3. Trace high-risk flows end to end, inspect callers before blaming a shared function, and run focused checks when they can confirm or reject a suspected issue.
4. Report only reproducible or directly evidenced issues:
   - **P0:** Catastrophic and release-blocking, such as broadly exploitable security failure, unrecoverable data loss, or a core system that cannot operate.
   - **P1:** Serious correctness, security, data-integrity, or core-workflow failure that should be fixed urgently.
   - **P2:** Bounded but real defect, regression risk, or material performance or maintainability problem with a concrete failure mode.
5. Exclude style preferences, speculative concerns, P3 issues, and missing tests that do not expose a P0-P2 behavior risk.
6. Keep the review read-only unless the user separately asks for fixes.

## Output

Sort findings by priority (`P0`, `P1`, `P2`), then by impact within each priority. Use exact repository-relative file and line references.

| Priority | Location               | Issue                               | Impact                              | Recommended fix         |
| -------- | ---------------------- | ----------------------------------- | ----------------------------------- | ----------------------- |
| P0-P2    | `path/to/file.ts:line` | Root cause and triggering condition | Concrete user or system consequence | Smallest root-cause fix |

If there are no findings, output the same table with one row whose Issue is `No P0-P2 issues found` and use `-` for the other cells.
