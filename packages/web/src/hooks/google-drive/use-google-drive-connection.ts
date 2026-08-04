import { useCallback, useEffect, useState } from 'react';
import type {
  GoogleDriveConnection,
  GoogleDriveConnectionPort,
} from '../../types/google-drive/google-drive-types';

async function hasLostAuthorization(bridge: GoogleDriveConnectionPort) {
  try {
    return (await bridge.status()).state === 'disconnected';
  } catch {
    return false;
  }
}

export function useGoogleDriveConnection(
  bridge: GoogleDriveConnectionPort | null,
  synchronize: () => Promise<void>,
) {
  const [connection, setConnection] = useState<GoogleDriveConnection>(
    bridge ? { state: 'disconnected' } : { state: 'unavailable' },
  );
  const [accountId, setAccountId] = useState<string>();
  const [statusReady, setStatusReady] = useState(!bridge);

  const reportFailure = useCallback(async () => {
    const account =
      connection.state === 'connected' ? connection.account : undefined;
    if (!account) return;
    if (bridge && (await hasLostAuthorization(bridge))) {
      setConnection({ state: 'reauthorization-required', account });
    }
  }, [bridge, connection]);

  useEffect(() => {
    if (!bridge) return;
    let active = true;
    void bridge
      .status()
      .then(async (status) => {
        if (!active) return;
        if (status.state === 'unavailable') {
          setConnection({ state: 'unavailable' });
        } else if (status.state === 'connected' && status.account) {
          setAccountId(status.account.emailAddress);
          setConnection({ state: 'connected', account: status.account });
          try {
            await synchronize();
          } catch {
            if (active && (await hasLostAuthorization(bridge))) {
              setConnection({
                state: 'reauthorization-required',
                account: status.account,
              });
            }
          }
        }
      })
      .catch(() => active && setConnection({ state: 'error' }))
      .finally(() => active && setStatusReady(true));
    return () => {
      active = false;
      bridge.dispose?.();
    };
  }, [bridge, synchronize]);

  async function connect() {
    if (!bridge) return;
    setConnection({ state: 'connecting' });
    try {
      const account = await bridge.connect();
      setAccountId(account.emailAddress);
      setConnection({ state: 'connected', account });
      try {
        await synchronize();
      } catch {
        if (await hasLostAuthorization(bridge)) {
          setConnection({ state: 'reauthorization-required', account });
        }
      }
    } catch {
      setConnection({ state: 'error' });
    } finally {
      setStatusReady(true);
    }
  }

  async function disconnect() {
    if (!bridge) return;
    try {
      await bridge.disconnect();
      setConnection({ state: 'disconnected' });
    } catch {
      const account =
        connection.state === 'connected' ? connection.account : undefined;
      setConnection({ state: 'error', account });
    }
  }

  return {
    accountId,
    connection,
    statusReady,
    connect,
    disconnect,
    reportFailure,
  };
}
