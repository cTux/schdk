import { editorToastCopy } from './editor-toast';

export type EditorToastAction = Exclude<
  keyof (typeof editorToastCopy)['en'],
  'notifications'
>;
