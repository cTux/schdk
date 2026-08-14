# Dictionaries

Status: shipped

## Goal

Keep shared question-generation scales consistent, reviewed, and available
without requiring access to a shared Drive folder.

## Requirements

- **DCT-1:** The Dictionaries shell page is named `Словники технічних термінів`
  and lists difficulty, recognizability, difficulty-distribution, and
  recognizability-distribution dictionaries. All dictionary tables use the
  same rounded, raised panel treatment as the recent-package list.
- **DCT-2:** Selecting a base dictionary opens a dedicated read-only table with
  name, description, and prompt-text-fragment columns. Selecting a distribution
  dictionary shows name, description, and percentage columns without a
  prompt-text-fragment column.
- **DCT-3:** Every account views the same bundled dictionaries. The public
  application exposes no dictionary mutation controls.
- **DCT-4:** Generation difficulty and recognizability dropdowns use the
  current dictionary item names. Provider prompts use the selected items'
  `promptPart` values rather than application-owned scale text.
- **DCT-5:** Each dictionary is defined by the validated
  `.schdk-dictionary` contract in
  [`../SCHDK_DICTIONARY.md`](../SCHDK_DICTIONARY.md) and serialized from the
  bundled defaults. Changes require repository review.
- **DCT-6:** The dictionary collection and selected dictionary are restored by
  the validated `view` and `edit` URL query parameters, including reload and
  browser back/forward.

## Invariants

- Stable scale values remain separate from editable labels and prompt text.
- A malformed or cross-named archive never reaches a dropdown or provider
  prompt.
- Browser and desktop adapters cannot write a bundled dictionary.
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
4. Connect with different accounts and confirm the same labels, prompt
   fragments, and distributions are used without write controls.
5. Serialize and parse every bundled dictionary and confirm its canonical ID,
   labels, prompt fragments, and distributions are preserved.
