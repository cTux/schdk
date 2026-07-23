export interface EditorTextOptions {
  correctQuestionText: boolean;
  correctAnswers: boolean;
  correctAnswerComment: boolean;
}

export interface GameOptions {
  soundVolume: number;
}

export const DEFAULT_EDITOR_TEXT_OPTIONS: EditorTextOptions = {
  correctQuestionText: false,
  correctAnswers: false,
  correctAnswerComment: false,
};

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  soundVolume: 0.4,
};
