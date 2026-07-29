import { mainSignal } from './main-signal';
import { preAlarm } from './pre-alarm';
import { unlockGameAudio } from './unlock-game-audio';
import { playMainSignal } from './play-main-signal';
import { playPreAlarm } from './play-pre-alarm';
import { stopGameAudio } from './stop-game-audio';

mainSignal.preload = 'auto';

preAlarm.preload = 'auto';

function setGameAudioVolume(volume: number) {
  for (const audio of [mainSignal, preAlarm]) {
    audio.volume = Math.min(1, Math.max(0, volume));
  }
}

export {
  setGameAudioVolume,
  unlockGameAudio,
  playMainSignal,
  playPreAlarm,
  stopGameAudio,
};
