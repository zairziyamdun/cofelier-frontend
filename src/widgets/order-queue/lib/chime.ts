// Короткий сигнал о новом заказе через Web Audio — без файла со звуком.
// Браузер разрешает звук только после действия пользователя: контекст
// создаётся по нажатию «Включить звук».
let context: AudioContext | null = null;

export function unlockChime(): void {
  context ??= new AudioContext();
  void context.resume();
}

export function playChime(): void {
  if (!context || context.state !== "running") return;
  const now = context.currentTime;
  [880, 1320].forEach((frequency, index) => {
    const oscillator = context!.createOscillator();
    const gain = context!.createGain();
    const start = now + index * 0.18;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    oscillator.connect(gain).connect(context!.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.4);
  });
}
