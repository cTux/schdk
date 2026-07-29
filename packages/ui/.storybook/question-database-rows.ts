export const questionDatabaseRows = Array.from({ length: 120 }, (_, index) => ({
  fileId: `storybook-package-${Math.floor(index / 36)}`,
  packageTitles: [`Storybook package ${Math.floor(index / 36) + 1}`],
  number: (index % 36) + 1,
  question: `Storybook question ${index + 1}`,
  answer: `Storybook answer ${index + 1}`,
  alternativeAnswers: [],
}));
