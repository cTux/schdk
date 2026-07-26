# Project specification format

`SPEC.md` is the compact project-level registry. Detailed shipped behavior
lives under `docs/specs`; `SPEC.md` links it and records only shared goals,
constraints, interfaces, invariants, active specification work, and bug
history.

## Encoding

- UTF-8 Markdown.
- Required sections stay ordered: `§G`, `§C`, `§I`, `§V`, `§T`, `§B`.
- One record per physical line. Separate fields with `|`.
- Keep identifiers and repository paths verbatim.
- Keep wording compact and testable. Do not add speculative behavior.
- Identifiers are monotonic and never reused.

## Sections

### §G — goal

Shape: `G<number>|<goal>`

Keep one project goal unless product scope splits.

### §C — constraints

Shape: `C<number>|<constraint>`

Record durable product, platform, security, or ownership boundaries.

### §I — interfaces

Shape: `I.<name>|<surface>|<contract or owner>`

List external product surfaces and canonical contracts, not internal helpers.

### §V — invariants

Shape: `V<number>|<observable invariant>`

Add an invariant when violating it would be a product, data-safety, or security
bug. Put detailed feature requirements in the matching `docs/specs` file.

### §T — tasks

Header: `id|status|task|cites`

Row: `T<number>|<status>|<task>|<references>`

Statuses:

- `.` planned
- `~` active
- `x` done

`cites` is a comma-separated list of `§V` or `§I` identifiers. Keep only
specification work here; implementation backlog stays in `docs/TODO.md`.

### §B — bugs

Header: `id|date|cause|fix`

Row: `B<number>|YYYY-MM-DD|<root cause>|<V identifier or concrete fix>`

Every confirmed bug gets one row. Add a new `§V` invariant when it would catch
recurrence. Update the affected `docs/specs` contract when the fix changes
shipped behavior.
