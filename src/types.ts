import { ParsedAlarm } from './lib/gemini';

export interface Alarm {
  id: string;
  parsed: ParsedAlarm;
  createdAt: number;
  targetTime: number;
  isActive: boolean;
  isRinging: boolean;
}

export interface AlarmEvent {
  id: string;
  alarmLabel: string;
  timestamp: number;
  type: 'created' | 'rang' | 'stopped' | 'deleted';
}
