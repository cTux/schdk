import { type QuestionDatabasePackage } from './question-database-package.js';

export interface QuestionDatabaseDocument {
  schemaVersion: 1;
  packages: QuestionDatabasePackage[];
}
