const mainSignal = new Audio(
  new URL('./audio/main-signal.mp3', window.location.href).href,
);
const preAlarm = new Audio(
  new URL('./audio/pre-alarm.mp3', window.location.href).href,
);

mainSignal.preload = 'auto';
preAlarm.preload = 'auto';

export function setGameAudioVolume(volume: number) {
  for (const audio of [mainSignal, preAlarm]) {
    audio.volume = Math.min(1, Math.max(0, volume));
  }
}

function play(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // A blocked sound must not block the game flow.
  });
}

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

export function playMainSignal() {
  play(mainSignal);
}

export function playPreAlarm() {
  play(preAlarm);
}

export function stopGameAudio() {
  for (const audio of [mainSignal, preAlarm]) {
    audio.pause();
    audio.currentTime = 0;
  }
}
