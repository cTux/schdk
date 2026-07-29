import { englishAllWeb } from './english-all-web';

const englishMeta = {
  title: 'What? Where? When?',
  description: 'What? Where? When? tools',
  editorTitle: (fileName?: string | null) =>
    fileName ? `${fileName} — WWW Editor` : 'What? Where? When? — Editor',
};

export { englishMeta, englishAllWeb };
