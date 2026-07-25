import {
  GameAnswer,
  GameAnswerComment,
  GameAlternativeAnswer,
  GameControls,
  GameHandout,
  GameLogo,
  GameProgress,
  GameQuestion,
  GameQuestionIntro,
  GameTimer,
} from '../../../host/GameElements';
import type { VisualEditorPreviewProps } from './types';

export function VisualEditorPreview({ copy, id }: VisualEditorPreviewProps) {
  return {
    logo: <GameLogo />,
    intro: <GameQuestionIntro questionNumber={5} />,
    handout: <GameHandout copy={copy} />,
    question: <GameQuestion>{copy.visualEditor.previewText}</GameQuestion>,
    timer: <GameTimer seconds={42} />,
    'answer-comment': (
      <GameAnswerComment>{copy.shared.answerComment}</GameAnswerComment>
    ),
    'alternative-answer': (
      <GameAlternativeAnswer>
        {copy.editor.alternativeAnswers}
      </GameAlternativeAnswer>
    ),
    answer: <GameAnswer answer={copy.shared.answer} />,
    progress: <GameProgress questionNumber={5} questionCount={36} />,
    controls: (
      <GameControls
        copy={copy}
        canGoBack
        controlsDisabled={false}
        preview
        onBack={() => undefined}
        onNext={() => undefined}
      />
    ),
  }[id];
}
