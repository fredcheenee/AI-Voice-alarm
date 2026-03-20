import { ParsedAlarm } from './lib/gemini';

export interface Alarm {
  id: string;
  parsed: ParsedAlarm;
  createdAt: number;
  targetTime: number;
  isActive: boolean;
  isRinging: boolean;
}
