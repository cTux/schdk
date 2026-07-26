import { SETTINGS_GROUPS, type SettingsGroup } from '@schdk/ui/options';
import type { ShellViewName } from '@schdk/ui/shell';
import { useEffect, useState } from 'react';

const SETTINGS_PARAMETER = 'settings';

function getLinkedGroup(): SettingsGroup {
  const value = new URL(window.location.href).searchParams.get(
    SETTINGS_PARAMETER,
  );
  return SETTINGS_GROUPS.find((group) => group === value) ?? 'app';
}

function getDeepLink(group: SettingsGroup | null) {
  const url = new URL(window.location.href);
  if (group) url.searchParams.set(SETTINGS_PARAMETER, group);
  else url.searchParams.delete(SETTINGS_PARAMETER);
  return url.href;
}

export function useSettingsDeepLink(view: ShellViewName) {
  const [group, setGroup] = useState<SettingsGroup>(getLinkedGroup);

  useEffect(() => {
    const deepLink = getDeepLink(view === 'options' ? group : null);
    if (deepLink !== window.location.href) {
      window.history.replaceState(window.history.state, '', deepLink);
    }
  }, [group, view]);

  useEffect(() => {
    function restoreGroup() {
      setGroup(getLinkedGroup());
    }
    window.addEventListener('popstate', restoreGroup);
    return () => window.removeEventListener('popstate', restoreGroup);
  }, []);

  function showGroup(nextGroup: SettingsGroup) {
    window.history.pushState(window.history.state, '', getDeepLink(nextGroup));
    setGroup(nextGroup);
  }

  return { group, showGroup };
}
