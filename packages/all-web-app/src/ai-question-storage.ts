import type { AIQuestion } from '@schdk/common';
import { useState } from 'react';

const STORAGE_KEY = 'schdk.ai-questions';

function isAIQuestion(value: unknown): value is AIQuestion {
  if (!value || typeof value !== 'object') return false;
  const question = value as Record<string, unknown>;
  return (
    typeof question.name === 'string' &&
    Boolean(question.name.trim()) &&
    typeof question.description === 'string' &&
    Boolean(question.description.trim()) &&
    typeof question.goodExamples === 'string' &&
    typeof question.badExamples === 'string'
  );
}

function loadAIQuestions(storage: Storage): AIQuestion[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter(isAIQuestion) : [];
  } catch {
    return [];
  }
}

function saveAIQuestions(storage: Storage, questions: AIQuestion[]): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(questions));
    return true;
  } catch {
    return false;
  }
}

export function useAIQuestions(storage: Storage) {
  const [questions, setQuestions] = useState<AIQuestion[]>(() =>
    loadAIQuestions(storage),
  );

  function addQuestion(question: AIQuestion): boolean {
    const nextQuestions = [...questions, question];
    if (!saveAIQuestions(storage, nextQuestions)) return false;
    setQuestions(nextQuestions);
    return true;
  }

  return { questions, addQuestion };
}
