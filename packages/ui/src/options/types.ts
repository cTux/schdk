export interface EditorTextOptions {
  correctQuestionText: boolean;
  correctAnswers: boolean;
  correctAnswerComment: boolean;
}

export const GAME_LAYOUT_ELEMENT_IDS = [
  'intro',
  'handout',
  'question',
  'timer',
  'answer-comment',
  'answer',
  'progress',
  'controls',
] as const;

export type GameLayoutElementId = (typeof GAME_LAYOUT_ELEMENT_IDS)[number];

export interface GameLayoutPosition {
  x: number;
  y: number;
}

export type GameLayout = Record<GameLayoutElementId, GameLayoutPosition>;

export interface GameOptions {
  soundVolume: number;
  layout: GameLayout | null;
}

export const DEFAULT_EDITOR_TEXT_OPTIONS: EditorTextOptions = {
  correctQuestionText: false,
  correctAnswers: false,
  correctAnswerComment: false,
};

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  soundVolume: 0.4,
  layout: null,
};

export const DEFAULT_GAME_LAYOUT: GameLayout = {
  intro: { x: 50, y: 50 },
  handout: { x: 76, y: 31 },
  question: { x: 24, y: 36 },
  timer: { x: 16, y: 68 },
  'answer-comment': { x: 24, y: 84 },
  answer: { x: 76, y: 84 },
  progress: { x: 95, y: 4 },
  controls: { x: 50, y: 96 },
};
