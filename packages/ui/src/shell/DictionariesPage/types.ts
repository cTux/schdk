import type { SchdkDictionary, SchdkDictionaryId } from '@schdk/common';

export interface DictionariesPageProps {
  dictionaries: SchdkDictionary[];
  editId: SchdkDictionaryId | null;
  failed: boolean;
  hidden?: boolean;
  isAdmin: boolean;
  loading: boolean;
  onBack(): void;
  onCloseEditor(): void;
  onShowEditor(id: SchdkDictionaryId): void;
  onUpdate(dictionary: SchdkDictionary): Promise<boolean>;
}
