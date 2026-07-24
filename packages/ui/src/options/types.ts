export interface EditorTextOptions {
  correctQuestionText: boolean;
  correctAnswers: boolean;
  correctAnswerComment: boolean;
}

export const GAME_LAYOUT_ELEMENT_IDS = [
  'logo',
  'intro',
  'handout',
  'question',
  'timer',
  'answer-comment',
  'alternative-answer',
  'answer',
  'progress',
  'controls',
] as const;

export type GameLayoutElementId = (typeof GAME_LAYOUT_ELEMENT_IDS)[number];

export const GAME_IMAGE_POSITIONS = [
  'left top',
  'center top',
  'right top',
  'left center',
  'center center',
  'right center',
  'left bottom',
  'center bottom',
  'right bottom',
] as const;

export type GameImagePosition = (typeof GAME_IMAGE_POSITIONS)[number];
export type GameTextGrowDirection = 'up' | 'down';

export interface GameLayoutPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  fontScale: number;
  textColor: string;
  textGrowDirection: GameTextGrowDirection;
  imagePosition: GameImagePosition;
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
  logo: layout(5, 6, 6, 12),
  intro: layout(50, 50, 46, 30),
  handout: layout(76, 31, 26, 22),
  question: layout(24, 36, 34, 12),
  timer: layout(16, 68, 20, 16),
  'answer-comment': layout(24, 84, 34, 12, '#d8dce3'),
  'alternative-answer': layout(76, 68, 34, 9, '#d4d8df'),
  answer: layout(76, 84, 34, 16, '#efad3f'),
  progress: layout(95, 4, 10, 7, '#b9c0cd'),
  controls: layout(50, 96, 27, 7, '#8b94a3'),
};

function layout(
  x: number,
  y: number,
  width: number,
  height: number,
  textColor = '#f1f3f6',
): GameLayoutPosition {
  return {
    x,
    y,
    width,
    height,
    fontScale: 1,
    textColor,
    textGrowDirection: 'down',
    imagePosition: 'right bottom',
  };
}
