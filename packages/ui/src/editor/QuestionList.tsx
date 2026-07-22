import { QUESTIONS_PER_ROUND, type GamePackage } from '@schdk/common';
import { useState, type DragEvent } from 'react';
import { QuestionListButton } from './QuestionListButton';

interface QuestionListProps {
  gamePackage: GamePackage;
  selectedIndex: number;
  showValidation: boolean;
  onSelectQuestion(index: number): void;
  onSwapQuestions(sourceIndex: number, targetIndex: number): void;
}

export function QuestionList({
  gamePackage,
  selectedIndex,
  showValidation,
  onSelectQuestion,
  onSwapQuestions,
}: QuestionListProps) {
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
    <nav className="question-list" aria-label="Питання пакета">
      {[0, 1, 2].map((round) => (
        <section key={round}>
          <h2>Раунд {round + 1}</h2>
          <div className="question-grid">
            {Array.from({ length: QUESTIONS_PER_ROUND }, (_, offset) => {
              const index = round * QUESTIONS_PER_ROUND + offset;
              const question = gamePackage.questions[index]!;
              return (
                <QuestionListButton
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
        </section>
      ))}
    </nav>
  );
}
