export const QUESTION_TYPE_CONFIG = {
  standard: { partCount: 1, seconds: 60, submissionSeconds: 10 },
  'blitz-2x30': { partCount: 2, seconds: 30, submissionSeconds: 0 },
  'blitz-3x20': { partCount: 3, seconds: 20, submissionSeconds: 0 },
} as const;
