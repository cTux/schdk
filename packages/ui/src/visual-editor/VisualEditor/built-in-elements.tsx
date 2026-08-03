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
} from '../../game-presentation/GameElements';
import type { ReactNode } from 'react';
import type { LocalizationCopy } from '../../localization';
import {
  GAME_LAYOUT_ELEMENT_IDS,
  type GameLayoutElementId,
} from '../../options/types';

function getBuiltInElements(copy: LocalizationCopy) {
  const elements: Record<
    GameLayoutElementId,
    { content: ReactNode; label: string }
  > = {
    logo: { content: <GameLogo />, label: copy.visualEditor.labels.logo },
    intro: {
      content: <GameQuestionIntro questionNumber={5} />,
      label: copy.visualEditor.labels.intro,
    },
    handout: {
      content: <GameHandout copy={copy} />,
      label: copy.visualEditor.labels.handout,
    },
    question: {
      content: <GameQuestion>{copy.visualEditor.previewText}</GameQuestion>,
      label: copy.visualEditor.labels.question,
    },
    timer: {
      content: <GameTimer seconds={42} />,
      label: copy.visualEditor.labels.timer,
    },
    'answer-comment': {
      content: (
        <GameAnswerComment>{copy.shared.answerComment}</GameAnswerComment>
      ),
      label: copy.visualEditor.labels.answerComment,
    },
    'alternative-answer': {
      content: (
        <GameAlternativeAnswer>
          {copy.editor.alternativeAnswers}
        </GameAlternativeAnswer>
      ),
      label: copy.visualEditor.labels.alternativeAnswer,
    },
    answer: {
      content: <GameAnswer answer={copy.shared.answer} />,
      label: copy.visualEditor.labels.answer,
    },
    progress: {
      content: <GameProgress questionNumber={5} questionCount={36} />,
      label: copy.visualEditor.labels.progress,
    },
    controls: {
      content: (
        <GameControls
          copy={copy}
          canGoBack
          controlsDisabled={false}
          preview
          onBack={() => undefined}
          onNext={() => undefined}
        />
      ),
      label: copy.visualEditor.labels.controls,
    },
  };
  return GAME_LAYOUT_ELEMENT_IDS.map((id) => ({ id, ...elements[id] }));
}

export { getBuiltInElements };
