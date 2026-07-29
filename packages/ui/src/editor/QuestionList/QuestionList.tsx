import './styles.scss';

import { QUESTIONS_PER_ROUND } from '@schdk/common';
import { useState, type DragEvent } from 'react';
import { Input } from '../../atoms/Input';
import { useLocalization } from '../../localization';
import { MusicBreakField } from '../MusicBreakField';
import { QuestionListButton } from '../QuestionListButton';
import { type QuestionListProps } from './question-list-props';

export function QuestionList({
  gamePackage,
  selectedIndex,
  showValidation,
  onSelectQuestion,
  onSwapQuestions,
  onTourPhraseChange,
  onMusicBreakChange,
}: QuestionListProps) {
  const { copy } = useLocalization();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  function finishDragging() {
    setDraggedIndex(null);
    setDropIndex(null);
  }

  function dropQuestion(event: DragEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onSwapQuestions(draggedIndex, index);
    }
    finishDragging();
  }

  return (
    <nav className="question-list" aria-label={copy.editor.packageQuestions}>
      {[0, 1, 2].map((tour) => (
        <section key={tour}>
          <h2>{copy.editor.tour(tour + 1)}</h2>
          <Input
            aria-label={copy.editor.tourPhrase}
            className="tour-phrase-field"
            placeholder={copy.editor.tourPhrase}
            value={gamePackage.tourPhrases[tour]}
            onChange={(event) => onTourPhraseChange(tour, event.target.value)}
          />
          <div className="question-grid">
            {Array.from({ length: QUESTIONS_PER_ROUND }, (_, offset) => {
              const index = tour * QUESTIONS_PER_ROUND + offset;
              const question = gamePackage.questions[index]!;
              return (
                <QuestionListButton
                  copy={copy}
                  dragging={index === draggedIndex}
                  dropTarget={index === dropIndex}
                  key={index}
                  index={index}
                  question={question}
                  selected={index === selectedIndex}
                  showTooltip={draggedIndex === null}
                  showValidation={showValidation}
                  onSelect={() => onSelectQuestion(index)}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', String(index));
                    setDraggedIndex(index);
                  }}
                  onDragEnter={() => {
                    if (draggedIndex !== null && draggedIndex !== index) {
                      setDropIndex(index);
                    }
                  }}
                  onDragOver={(event) => {
                    if (draggedIndex !== null && draggedIndex !== index) {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                    }
                  }}
                  onDrop={(event) => dropQuestion(event, index)}
                  onDragEnd={finishDragging}
                />
              );
            })}
          </div>
          {tour < 2 && (
            <MusicBreakField
              musicBreak={gamePackage.musicBreaks[tour]}
              onChange={(file) => onMusicBreakChange(tour, file)}
            />
          )}
        </section>
      ))}
    </nav>
  );
}
