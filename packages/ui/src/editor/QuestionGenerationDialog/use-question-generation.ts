import {
  compareFavoriteItemsByName,
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
} from '@schdk/common';
import { useState } from 'react';
import { useGenerationTask } from '../hooks/use-generation-task';
import type { QuestionGenerationDialogProps } from './types';

function useQuestionGeneration({
  templates,
  generateQuestion,
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
  const generationTask = useGenerationTask();
  const sortedTemplates = [...templates].sort(compareFavoriteItemsByName);
  const selectedTemplate =
    sortedTemplates[Number(templateIndex)] ?? sortedTemplates[0] ?? null;

  function reset() {
    generationTask.cancel();
    setOpen(false);
    setTemplateIndex('0');
    setDifficulty('medium');
    setRecognizability('easy');
    setContext('');
    setThinking(false);
    setFailed(false);
    setPromptOpen(false);
    onQuestionGenerationStateChange?.(false, false);
  }

  function show() {
    setOpen(true);
    onQuestionGenerationStateChange?.(false, true);
  }

  async function generate() {
    if (!selectedTemplate || !context.trim()) return;
    const task = generationTask.start();
    setThinking(true);
    setFailed(false);
    onQuestionGenerationStateChange?.(true, true);
    try {
      const question = await generateQuestion(
        {
          template: selectedTemplate,
          context: context.trim(),
          excludedAnswers,
          difficulty,
          recognizability,
        },
        task.signal,
      );
      if (!task.isCurrent()) return;
      onGenerated(question);
      reset();
    } catch {
      if (!task.isCurrent()) return;
      setThinking(false);
      setFailed(true);
      onQuestionGenerationStateChange?.(false, true);
    }
  }

  return {
    context,
    difficulty,
    failed,
    generate,
    open,
    promptOpen,
    recognizability,
    reset,
    selectedTemplate,
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
