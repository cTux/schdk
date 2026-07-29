import { ukrainianAllWeb } from './ukrainian-all-web';

const ukrainianMeta = {
  title: 'Що? Де? Коли?',
  description: 'Інструменти Що? Де? Коли?',
  editorTitle: (fileName?: string | null) =>
    fileName ? `${fileName} — Редактор ЩДК` : 'Що? Де? Коли? — Редактор',
};

export { ukrainianMeta, ukrainianAllWeb };
