import { useCallback, useEffect, useRef } from 'react';

function useGenerationTask() {
  const taskId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    taskId.current += 1;
  }, []);

  const start = useCallback(() => {
    controller.current?.abort();
    const id = ++taskId.current;
    const nextController = new AbortController();
    controller.current = nextController;
    return {
      signal: nextController.signal,
      isCurrent: () => id === taskId.current,
    };
  }, []);

  useEffect(() => cancel, [cancel]);

  return { cancel, start };
}

export { useGenerationTask };
