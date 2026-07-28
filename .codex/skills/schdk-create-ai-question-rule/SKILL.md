---
name: schdk-create-ai-question-rule
description: Analyze the construction of a supplied quiz question, answer, and optional handout, then turn its reusable mechanism into a valid SCHDK .aiquestion generation rule. Use when asked to explain how a question works, classify its type, generalize its clue path, or create an .aiquestion file from one or more examples.
---

# Analyze and Create an AI Question Rule

## Workflow

1. Follow `$schdk-game-packages` and read `docs/AI_QUESTION.md`.
2. Inspect the actual question, answer, and every supplied handout before
   classifying the mechanism.
3. Explain:
   - what information the text gives directly;
   - what each handout contributes beyond identification;
   - the factual and associative paths to the answer;
   - where those paths converge;
   - how much is recalled versus deduced;
   - whether the answer is unique and the wording is fair.
4. Name the type only after tracing the clue path. Describe the reusable
   mechanism, not the example's topic.
5. Create one `AIQuestion` object:
   - `name`: concise Ukrainian type name;
   - `description`: imperative generation instructions with construction,
     uniqueness, fairness, handout, and answer-comment requirements;
   - `goodExamples`: the supplied example or a compact equivalent;
   - `badExamples`: concrete failure modes, especially pure trivia, arbitrary
     associations, duplicated clues, and non-unique answers;
   - `enabled: true`, `favorite: false`, `generalRule: false`, unless requested
     otherwise.
6. Serialize through `serializeAIQuestion` from `@schdk/common`; never
   handcraft the ZIP contract. Name the file `<name>.aiquestion`.
7. Parse the written file with `parseAIQuestionArchive` and compare every
   parsed field with the intended object.

## Generation Standard

- Give a knowledgeable player a factual recognition path and another player a
  fair associative or deductive path.
- Make independent clues converge on one short answer.
- Use a handout only when it adds a distinct clue. If no real image bytes are
  available, do not invent an image or fake `dataUrl`; use a text handout or no
  handout.
- Do not reveal the answer or its distinctive word stem.
- Avoid questions solvable only by memorizing an obscure fact.
- Require `answerComment` to explain both paths and why the answer is unique.
- Keep the final wording natural; do not expose the construction method to
  players.

## Verification

Run the skill validator for this skill and the package checks required by
`$schdk-game-packages`. After repository changes, follow
`$schdk-sync-specs`, `$schdk-quality`, and the repository commit workflow.
