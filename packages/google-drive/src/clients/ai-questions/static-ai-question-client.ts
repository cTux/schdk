import {
  DEFAULT_GLOBAL_AI_QUESTIONS,
  serializeAIQuestion,
} from '@schdk/common';
import { GoogleDriveAuthorizationError } from '../../errors/client/google-drive-authorization-error.js';
import { GoogleDriveError } from '../../errors/client/google-drive-error.js';
import { createAIQuestionFilename } from '../../factories/ai-questions/create-ai-question-filename.js';
import type {
  DriveAIQuestion,
  DriveAIQuestionFile,
  DriveAIQuestionWrite,
} from '../../services/ai-questions/ai-questions.js';

const BUNDLED_MODIFIED_TIME = '2026-08-14T00:00:00.000Z';
const BUNDLED_AI_QUESTIONS = DEFAULT_GLOBAL_AI_QUESTIONS.map(
  (question, index) => ({
    file: {
      id: `bundled-ai-question-${index + 1}`,
      name: createAIQuestionFilename(question.name),
      modifiedTime: BUNDLED_MODIFIED_TIME,
    },
    content: serializeAIQuestion(question),
  }),
);

class StaticAIQuestionStorage {
  async createAIQuestion(
    _value: DriveAIQuestionWrite,
  ): Promise<DriveAIQuestionFile> {
    throw new GoogleDriveAuthorizationError(
      'Bundled AI questions are read-only',
    );
  }

  async updateAIQuestion(
    _fileId: string,
    _value: DriveAIQuestionWrite,
  ): Promise<DriveAIQuestionFile> {
    throw new GoogleDriveAuthorizationError(
      'Bundled AI questions are read-only',
    );
  }

  async deleteAIQuestion(_fileId: string): Promise<void> {
    throw new GoogleDriveAuthorizationError(
      'Bundled AI questions are read-only',
    );
  }

  async listAIQuestions(): Promise<DriveAIQuestionFile[]> {
    return BUNDLED_AI_QUESTIONS.map(({ file }) => ({ ...file }));
  }

  async loadAIQuestion(fileId: string): Promise<DriveAIQuestion> {
    const bundled = BUNDLED_AI_QUESTIONS.find(({ file }) => file.id === fileId);
    if (!bundled) {
      throw new GoogleDriveError('Invalid bundled AI question', 'invalid-data');
    }
    return { ...bundled.file, content: new Uint8Array(bundled.content) };
  }
}

export { StaticAIQuestionStorage };
