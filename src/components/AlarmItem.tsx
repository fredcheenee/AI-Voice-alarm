import { Alarm } from '../types';
import { Bell, BellOff, Repeat, Trash2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onStopRinging: (id: string) => void;
}

export function AlarmItem({ alarm, onToggle, onRemove, onStopRinging }: AlarmItemProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!alarm.isActive || alarm.isRinging) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = alarm.targetTime - now;
      
      if (diff <= 0) {
        setTimeLeft('00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [alarm.targetTime, alarm.isActive, alarm.isRinging]);

  return (
    <div className={`p-4 rounded-2xl border transition-all ${alarm.isRinging ? 'bg-red-50 border-red-200 shadow-lg animate-pulse' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
            {alarm.parsed.label}
            {alarm.parsed.recurring && <Repeat className="w-4 h-4 text-slate-400" />}
          </h3>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            {alarm.parsed.type === 'time' ? (
              <>
                <Clock className="w-3 h-3" />
                {alarm.parsed.absoluteTime}
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                Every {Math.floor((alarm.parsed.intervalSeconds || 0) / 60)}m {(alarm.parsed.intervalSeconds || 0) % 60}s
              </>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {alarm.isRinging ? (
            <button
              onClick={() => onStopRinging(alarm.id)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-sm transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => onToggle(alarm.id)}
              className={`p-2 rounded-full transition-colors ${alarm.isActive ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              {alarm.isActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
          )}
          
          <button
            onClick={() => onRemove(alarm.id)}
            className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {alarm.isActive && !alarm.isRinging && (
        <div className="mt-4">
          <div className="text-3xl font-mono font-light text-slate-700 tracking-tight">
            {timeLeft}
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
            Time remaining
          </div>
        </div>
      )}
      
      {alarm.isRinging && (
        <div className="mt-4 text-red-500 font-medium flex items-center gap-2">
          <Bell className="w-5 h-5 animate-bounce" />
          Alarm is ringing!
        </div>
      )}
    </div>
  );
}
