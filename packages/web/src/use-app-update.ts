import { useEffect, useState } from 'react';

const UPDATE_POLL_INTERVAL = 60_000;

async function checkWebUpdate() {
  const response = await fetch(
    new URL(`version.json?${Date.now()}`, document.baseURI),
    { cache: 'no-store' },
  );
  if (!response.ok) return false;
  const manifest: unknown = await response.json();
  return (
    typeof manifest === 'object' &&
    manifest !== null &&
    'version' in manifest &&
    manifest.version !== import.meta.env.VITE_APP_VERSION
  );
}

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const available = window.desktop?.updates
          ? await window.desktop.updates.check()
          : await checkWebUpdate();
        if (active && available) setUpdateAvailable(true);
      } catch {
        // A background check can retry on the next poll.
      }
    };

    void check();
    const interval = window.setInterval(
      () => void check(),
      UPDATE_POLL_INTERVAL,
    );
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  function activateUpdate() {
    if (window.desktop?.updates) {
      void window.desktop.updates.openReleasePage().catch(() => undefined);
    } else {
      window.location.reload();
    }
  }

  return { activateUpdate, updateAvailable };
}
