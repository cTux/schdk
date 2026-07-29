import { type DriveAIQuestionFile } from './drive-ai-question-file.js';

export interface DriveAIQuestion extends DriveAIQuestionFile {
  content: Uint8Array;
}
