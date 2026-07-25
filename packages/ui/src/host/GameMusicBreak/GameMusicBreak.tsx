import './styles.scss';

import { useEffect, useRef } from 'react';
import { useLocalization } from '../../localization';
import type { GameMusicBreakProps } from './types';

export function GameMusicBreak({ musicBreak, volume }: GameMusicBreakProps) {
  const { copy } = useLocalization();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, Math.max(0, volume));
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = URL.createObjectURL(
      new Blob([Uint8Array.from(musicBreak.data).buffer], {
        type: musicBreak.mimeType,
      }),
    );
    audio.src = url;
    void audio.play().catch(() => {
      // Native controls remain available when autoplay is blocked.
    });
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      URL.revokeObjectURL(url);
    };
  }, [musicBreak]);

  return (
    <div className="game-music-break">
      <h2>{copy.host.musicBreak}</h2>
      <audio ref={audioRef} controls />
    </div>
  );
}
