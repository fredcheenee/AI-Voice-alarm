import { useState, useEffect, useCallback } from 'react';
import { Alarm } from '../types';
import { ParsedAlarm } from '../lib/gemini';
import { playAlarmSound } from '../lib/audio';

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // Function to calculate the next target time based on parsed alarm
  const calculateNextTargetTime = (parsed: ParsedAlarm, fromTime: number = Date.now()): number => {
    if (parsed.type === 'timer' && parsed.intervalSeconds) {
      return fromTime + parsed.intervalSeconds * 1000;
    } else if (parsed.type === 'time' && parsed.absoluteTime) {
      const [hours, minutes] = parsed.absoluteTime.split(':').map(Number);
      const now = new Date(fromTime);
      const target = new Date(fromTime);
      target.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, set it for tomorrow
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      return target.getTime();
    }
    return fromTime; // Fallback
  };

  const addAlarm = useCallback((parsed: ParsedAlarm) => {
    const now = Date.now();
    const targetTime = calculateNextTargetTime(parsed, now);
    
    const newAlarm: Alarm = {
      id: Math.random().toString(36).substring(2, 9),
      parsed,
      createdAt: now,
      targetTime,
      isActive: true,
      isRinging: false,
    };
    
    setAlarms(prev => [...prev, newAlarm]);
  }, []);

  const removeAlarm = useCallback((id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    setAlarms(prev => prev.map(a => {
      if (a.id === id) {
        const isActive = !a.isActive;
        return {
          ...a,
          isActive,
          targetTime: isActive ? calculateNextTargetTime(a.parsed) : a.targetTime,
          isRinging: false
        };
      }
      return a;
    }));
  }, []);

  const stopRinging = useCallback((id: string) => {
    setAlarms(prev => prev.map(a => {
      if (a.id === id) {
        if (a.parsed.recurring) {
          // Set next target time
          return {
            ...a,
            isRinging: false,
            targetTime: calculateNextTargetTime(a.parsed)
          };
        } else {
          // Disable one-time alarm
          return {
            ...a,
            isRinging: false,
            isActive: false
          };
        }
      }
      return a;
    }));
  }, []);

  // Check alarms every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setAlarms(prev => {
        let hasChanges = false;
        const next = prev.map(a => {
          if (a.isActive && !a.isRinging && now >= a.targetTime) {
            hasChanges = true;
            
            if (a.parsed.recurring) {
              // Play sound immediately for the loop
              playAlarmSound();
              
              // Calculate next target time
              let nextTarget = now;
              if (a.parsed.type === 'timer' && a.parsed.intervalSeconds) {
                // Add interval to the original target time to prevent drift
                nextTarget = a.targetTime + a.parsed.intervalSeconds * 1000;
                // If we somehow fell way behind, reset from now
                if (nextTarget <= now) {
                  nextTarget = now + a.parsed.intervalSeconds * 1000;
                }
              } else {
                nextTarget = calculateNextTargetTime(a.parsed, now);
              }
              
              // Return updated alarm without setting isRinging to true
              return { ...a, targetTime: nextTarget };
            } else {
              // One-time alarm gets stuck in ringing state until user stops it
              return { ...a, isRinging: true };
            }
          }
          return a;
        });
        return hasChanges ? next : prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Play sound for ringing alarms
  useEffect(() => {
    const ringingAlarms = alarms.filter(a => a.isRinging);
    if (ringingAlarms.length === 0) return;

    // Play immediately when it starts ringing
    playAlarmSound();

    // Then play every 3 seconds
    const interval = setInterval(() => {
      playAlarmSound();
    }, 3000);

    return () => clearInterval(interval);
  }, [alarms.filter(a => a.isRinging).length]);

  return {
    alarms,
    addAlarm,
    removeAlarm,
    toggleAlarm,
    stopRinging
  };
}
