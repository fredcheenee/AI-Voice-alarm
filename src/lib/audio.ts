export function playAlarmSound() {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  
  const playBeep = (time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, time);
    osc.frequency.setValueAtTime(1760, time + 0.1);
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(1, time + 0.05);
    gain.gain.linearRampToValueAtTime(0, time + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.2);
  };

  const now = ctx.currentTime;
  playBeep(now);
  playBeep(now + 0.4);
  playBeep(now + 0.8);
  playBeep(now + 1.2);
}
