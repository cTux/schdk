import type { AIQuestion } from '@schdk/common';
import { useState } from 'react';

const STORAGE_KEY = 'schdk.ai-questions';

function parseAIQuestion(value: unknown): AIQuestion | null {
  if (!value || typeof value !== 'object') return null;
  const question = value as Record<string, unknown>;
  if (
    typeof question.name === 'string' &&
    Boolean(question.name.trim()) &&
    typeof question.description === 'string' &&
    Boolean(question.description.trim()) &&
    typeof question.goodExamples === 'string' &&
    typeof question.badExamples === 'string'
  ) {
    return {
      name: question.name,
      description: question.description,
      goodExamples: question.goodExamples,
      badExamples: question.badExamples,
      enabled: question.enabled !== false,
      favorite: question.favorite === true,
    };
  }
  return null;
}

function loadAIQuestions(storage: Storage): AIQuestion[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value)
      ? value.map(parseAIQuestion).filter((question) => question !== null)
      : [];
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

  function updateQuestion(index: number, question: AIQuestion): boolean {
    const nextQuestions = questions.map((current, itemIndex) =>
      itemIndex === index ? question : current,
    );
    if (!saveAIQuestions(storage, nextQuestions)) return false;
    setQuestions(nextQuestions);
    return true;
  }

  function removeQuestion(index: number): boolean {
    const nextQuestions = questions.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    if (!saveAIQuestions(storage, nextQuestions)) return false;
    setQuestions(nextQuestions);
    return true;
  }

  return { questions, addQuestion, updateQuestion, removeQuestion };
}
