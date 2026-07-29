import type { ShellViewName } from '@schdk/ui/shell';

export function isShellViewName(value: string | null): value is ShellViewName {
  return (
    value === 'home' ||
    value === 'questionDatabase' ||
    value === 'host' ||
    value === 'editor' ||
    value === 'visualEditor' ||
    value === 'artificialIntelligence' ||
    value === 'packageRules' ||
    value === 'options'
  );
}
