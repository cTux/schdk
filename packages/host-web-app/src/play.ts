export function play(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // A blocked sound must not block the game flow.
  });
}
