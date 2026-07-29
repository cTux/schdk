import {
  compareFavoriteItemsByName,
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
} from '@schdk/common';
import { useState } from 'react';
import type { QuestionGenerationDialogProps } from './types';

function useQuestionGeneration({
  templates,
  onGenerationStart,
  onGenerate,
  onQuestionGenerationStateChange,
  excludedAnswers = [],
  onGenerated,
}: QuestionGenerationDialogProps) {
  const [open, setOpen] = useState(false);
  const [templateIndex, setTemplateIndex] = useState('0');
  const [difficulty, setDifficulty] = useState<AIQuestionDifficulty>('medium');
  const [recognizability, setRecognizability] =
    useState<AIQuestionRecognizability>('medium');
  const [context, setContext] = useState('');
  const [thinking, setThinking] = useState(false);
  const [background, setBackground] = useState(false);
  const [failed, setFailed] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [checkQuestionDatabase, setCheckQuestionDatabase] = useState(false);
  const sortedTemplates = [...templates].sort(compareFavoriteItemsByName);
  const selectedTemplate =
    sortedTemplates[Number(templateIndex)] ?? sortedTemplates[0] ?? null;

  function reset() {
    setOpen(false);
    setTemplateIndex('0');
    setDifficulty('medium');
    setRecognizability('medium');
    setContext('');
    setThinking(false);
    setBackground(false);
    setFailed(false);
    setPromptOpen(false);
    setCheckQuestionDatabase(false);
    onQuestionGenerationStateChange?.(false, false);
  }

  function show() {
    setOpen(true);
    onQuestionGenerationStateChange?.(false, true);
  }

  async function generate() {
    if (!selectedTemplate || !context.trim()) return;
    setThinking(true);
    setFailed(false);
    onQuestionGenerationStateChange?.(true, true);
    try {
      await onGenerationStart?.(checkQuestionDatabase);
      const question = await onGenerate(
        selectedTemplate,
        context.trim(),
        excludedAnswers,
        difficulty,
        checkQuestionDatabase,
        recognizability,
      );
      onGenerated(question);
      reset();
    } catch {
      setThinking(false);
      setFailed(true);
      onQuestionGenerationStateChange?.(false, true);
    }
  }

  function generateInBackground() {
    setBackground(true);
    onQuestionGenerationStateChange?.(true, true);
  }

  return {
    background,
    checkQuestionDatabase,
    context,
    difficulty,
    failed,
    generate,
    generateInBackground,
    open,
    promptOpen,
    recognizability,
    reset,
    selectedTemplate,
    setCheckQuestionDatabase,
    setContext,
    setDifficulty,
    setPromptOpen,
    setRecognizability,
    setTemplateIndex,
    show,
    sortedTemplates,
    templateIndex,
    thinking,
  };
}

export { useQuestionGeneration };
