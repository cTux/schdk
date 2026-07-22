export interface EditorTextOptions {
  correctQuestionText: boolean;
  correctAnswers: boolean;
  correctAnswerComment: boolean;
}

export const DEFAULT_EDITOR_TEXT_OPTIONS: EditorTextOptions = {
  correctQuestionText: false,
  correctAnswers: false,
  correctAnswerComment: false,
};
