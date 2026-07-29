import { mainSignal } from './main-signal';
import { preAlarm } from './pre-alarm';

export function stopGameAudio() {
  for (const audio of [mainSignal, preAlarm]) {
    audio.pause();
    audio.currentTime = 0;
  }
}
