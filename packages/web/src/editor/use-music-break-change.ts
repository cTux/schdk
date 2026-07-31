import { MAX_MUSIC_BREAK_BYTES, type GamePackage } from '@schdk/common';
import type { EditorSaveStatus } from '@schdk/ui/editor';
import type { LocalizationCopy } from '@schdk/ui/localization';
import { useCallback, type Dispatch, type SetStateAction } from 'react';

export function useMusicBreakChange(
  copy: LocalizationCopy,
  setGamePackage: Dispatch<SetStateAction<GamePackage>>,
  setMessage: Dispatch<SetStateAction<string>>,
  setSaveStatus: Dispatch<SetStateAction<EditorSaveStatus>>,
) {
  return useCallback(
    (index: number, file: File | null) => {
      if (!file) {
        setGamePackage((current) => ({
          ...current,
          musicBreaks: current.musicBreaks.map((musicBreak, breakIndex) =>
            breakIndex === index ? null : musicBreak,
          ) as GamePackage['musicBreaks'],
        }));
        setSaveStatus('pending');
        setMessage('');
        return;
      }
      const hasAcceptableSize = file.size <= MAX_MUSIC_BREAK_BYTES;
      const hasPlayableAudioType =
        file.type.startsWith('audio/') &&
        Boolean(new Audio().canPlayType(file.type));
      if (!hasAcceptableSize || !hasPlayableAudioType) {
        setMessage(copy.editor.invalidMusic);
        return;
      }
      void file
        .arrayBuffer()
        .then((buffer) => {
          setGamePackage((current) => ({
            ...current,
            musicBreaks: current.musicBreaks.map((musicBreak, breakIndex) =>
              breakIndex === index
                ? {
                    name: file.name,
                    mimeType: file.type,
                    data: new Uint8Array(buffer),
                  }
                : musicBreak,
            ) as GamePackage['musicBreaks'],
          }));
          setSaveStatus('pending');
          setMessage('');
        })
        .catch(() => setMessage(copy.editor.invalidMusic));
    },
    [copy.editor.invalidMusic, setGamePackage, setMessage, setSaveStatus],
  );
}
