import type { LocalizationCopy } from '@schdk/ui/localization';
import type { ShellViewName } from '@schdk/ui/shell';
import { useEffect } from 'react';

export function useShellDocumentMetadata(
  copy: LocalizationCopy,
  view: ShellViewName,
) {
  useEffect(() => {
    const sectionTitle =
      view === 'home'
        ? ''
        : view === 'options'
          ? copy.shell.settingsLabel
          : view === 'visualEditor'
            ? copy.shell.visualEditor.label
            : copy.shell[view].label;
    document.title = sectionTitle
      ? `${sectionTitle} — ${copy.meta.title}`
      : copy.meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', copy.meta.description);
  }, [copy, view]);
}
