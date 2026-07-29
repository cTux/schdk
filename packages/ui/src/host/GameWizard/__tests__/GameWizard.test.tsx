import { describe, expect, it } from 'vitest';
import { DEFAULT_GAME_LAYOUT } from '../../../options/types';
import type { HostGameView } from '../../types';
import { GameWizard } from '..';

const game: HostGameView = {
  question: {
    type: 'standard',
    questionParts: ['Питання'],
    answer: 'Відповідь',
    alternativeAnswers: [],
    wrongAnswers: [],
  },
  questionNumber: 1,
  questionCount: 36,
  tourNumber: 1,
  tourPhrase: '',
  currentQuestionPartIndex: 0,
  currentStage: 'intro',
  visibleStages: ['intro'],
  remainingSeconds: 60,
  transition: {
    phase: 'enter',
    direction: 'forward',
    questionChanging: true,
  },
  controlsDisabled: false,
  canGoBack: false,
  musicBreak: null,
  musicVolume: 0.05,
};

describe('GameWizard', () => {
  it('composes layout and transition classes', () => {
    const wizard = GameWizard({
      game,
      layout: DEFAULT_GAME_LAYOUT,
      onBack: () => undefined,
      onNext: () => undefined,
    });
    const canvas = wizard.props.children[2];
    const intro = canvas.props.children.props.children;

    expect(wizard.props.className).toMatchInlineSnapshot(
      `"game-wizard has-custom-layout"`,
    );
    expect(intro.props.className).toMatchInlineSnapshot(
      `"is-entering is-forward is-enter-forward"`,
    );
  });
});
