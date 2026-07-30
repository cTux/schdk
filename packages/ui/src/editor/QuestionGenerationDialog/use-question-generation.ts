import {
  compareFavoriteItemsByName,
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
} from '@schdk/common';
import { useEffect, useRef, useState } from 'react';
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
    useState<AIQuestionRecognizability>('easy');
  const [context, setContext] = useState('');
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [checkQuestionDatabase, setCheckQuestionDatabase] = useState(false);
  const generationId = useRef(0);
  const sortedTemplates = [...templates].sort(compareFavoriteItemsByName);
  const selectedTemplate =
    sortedTemplates[Number(templateIndex)] ?? sortedTemplates[0] ?? null;

  function reset() {
    generationId.current += 1;
    setOpen(false);
    setTemplateIndex('0');
    setDifficulty('medium');
    setRecognizability('easy');
    setContext('');
    setThinking(false);
    setFailed(false);
    setPromptOpen(false);
    setCheckQuestionDatabase(false);
    onQuestionGenerationStateChange?.(false, false);
  }

  function show() {
    setOpen(true);
    onQuestionGenerationStateChange?.(false, true);
  }

  useEffect(() => () => void (generationId.current += 1), []);

  async function generate() {
    if (!selectedTemplate || !context.trim()) return;
    const currentGenerationId = ++generationId.current;
    setThinking(true);
    setFailed(false);
    onQuestionGenerationStateChange?.(true, true);
    try {
      await onGenerationStart?.(checkQuestionDatabase);
      if (currentGenerationId !== generationId.current) return;
      const question = await onGenerate(
        selectedTemplate,
        context.trim(),
        excludedAnswers,
        difficulty,
        checkQuestionDatabase,
        recognizability,
      );
      if (currentGenerationId !== generationId.current) return;
      onGenerated(question);
      reset();
    } catch {
      if (currentGenerationId !== generationId.current) return;
      setThinking(false);
      setFailed(true);
      onQuestionGenerationStateChange?.(false, true);
    }
  }

  return {
    checkQuestionDatabase,
    context,
    difficulty,
    failed,
    generate,
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
