# Dictionaries

Status: shipped

## Goal

Keep shared question-generation scales editable without changing application
code or duplicating prompt definitions.

## Requirements

- **DCT-1:** The Dictionaries shell page is named `Словники технічних термінів`
  and lists difficulty, recognizability, difficulty-distribution, and
  recognizability-distribution dictionaries. All dictionary tables use the
  same rounded, raised panel treatment as the recent-package list.
- **DCT-2:** Selecting a base dictionary opens a dedicated table with editable
  name, description, and prompt-text-fragment columns. Selecting a distribution
  dictionary opens editable name, description, and percentage columns without a
  prompt-text-fragment column. Administrators can add records and save changes
  from the dictionary editor header.
- **DCT-3:** Every account can view dictionaries. Only the centralized
  allowlisted administrator can edit them, and Google Drive folder permissions
  remain the write authorization boundary.
- **DCT-4:** Generation difficulty and recognizability dropdowns use the
  current dictionary item names. Provider prompts use the selected items'
  `promptPart` values rather than application-owned scale text.
- **DCT-5:** Each dictionary is a validated `.schdk-dictionary` ZIP archive
  defined by [`../SCHDK_DICTIONARY.md`](../SCHDK_DICTIONARY.md) and stored in
  the configured shared Google Drive folder. An administrator initializes a
  missing default dictionary; unavailable or malformed remote content falls
  back to the validated bundled default and reports the load failure.
- **DCT-6:** The dictionary collection and selected dictionary are restored by
  the validated `view` and `edit` URL query parameters, including reload and
  browser back/forward.

## Invariants

- Stable scale values remain separate from editable labels and prompt text.
- A malformed or cross-named archive never reaches a dropdown or provider
  prompt.
- A non-administrator cannot write a dictionary through browser or desktop
  adapters.
- Every distribution record totals 100%, and package generation randomly
  selects difficulty and recognizability independently from the selected
  distribution records for each target question.

## Acceptance

1. Open Dictionaries and confirm all four dictionaries appear with names and
   descriptions.
2. Open each dictionary, reload, use browser back/forward, and confirm the
   selected editor and collection deep links restore.
3. As a regular account, inspect every row and confirm no editing or save
   control is available.
4. As an allowlisted administrator, change a label and prompt fragment, save,
   reload, and confirm the dropdown label and exact provider prompt changed.
5. Remove one dictionary from the shared folder, connect as an administrator,
   and confirm a valid default `.schdk-dictionary` archive is created there.
6. Supply a malformed, oversized, or cross-named archive and confirm the
   bundled default remains usable while the page reports the load failure.
