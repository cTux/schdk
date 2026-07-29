import { mainSignal } from './main-signal';
import { preAlarm } from './pre-alarm';

export function unlockGameAudio() {
  for (const audio of [mainSignal, preAlarm]) {
    audio.muted = true;
    void audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      })
      .catch(() => {
        audio.muted = false;
      });
  }
}
