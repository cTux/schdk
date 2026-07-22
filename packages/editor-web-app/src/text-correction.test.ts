import { describe, expect, it } from 'vitest';
import { capitalizeFirstWord, correctSentence } from './text-correction';

describe('text correction', () => {
  it('capitalizes text and adds only missing ending punctuation', () => {
    expect(capitalizeFirstWord('\n  відповідь \t')).toBe('Відповідь');
    expect(correctSentence('\n  текст питання  \n')).toBe('Текст питання.');
    expect(correctSentence('що сталося?')).toBe('Що сталося?');
    expect(correctSentence('')).toBe('');
  });
});
