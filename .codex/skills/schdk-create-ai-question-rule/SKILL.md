---
name: schdk-create-ai-question-rule
description: Turn supplied quiz question, answer, and handout examples into reusable SCHDK .aiquestion rules. Use for construction analysis, clue-path classification, mechanism generalization, or .aiquestion creation.
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
5. Search `DEFAULT_GLOBAL_AI_QUESTIONS` in
   `packages/common/src/constants/ai-questions/default-global-ai-questions.ts`
   for the same reusable mechanism. If one exists, extend it with only the new
   instructions or non-duplicate examples that improve the rule instead of
   creating a competing object.
6. Create or update one `AIQuestion` object:
   - `name`: concise Ukrainian type name;
   - `description`: imperative generation instructions with construction,
     uniqueness, fairness, handout, and answer-comment requirements;
   - `goodExamples`: the supplied example or a compact equivalent;
   - `badExamples`: concrete failure modes, especially pure trivia, arbitrary
     associations, duplicated clues, and non-unique answers;
   - `enabled: true`, `favorite: false`, `generalRule: false`, unless requested
     otherwise.
     Keep at most three good examples and three bad examples. When updating an
     existing rule, retain the most useful non-duplicate examples within each
     limit.
7. Add or update the typed object in `DEFAULT_GLOBAL_AI_QUESTIONS`; the runtime
   serializes it through `serializeAIQuestion` from `@schdk/common`.
8. Serialize the object with `serializeAIQuestion`, parse it with
   `parseAIQuestionArchive`, and compare every parsed field with the intended
   object.

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
