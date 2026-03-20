import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ParsedAlarm {
  type: "timer" | "time";
  recurring: boolean;
  intervalSeconds?: number;
  absoluteTime?: string;
  label: string;
}

export async function parseAlarmCommand(command: string): Promise<ParsedAlarm> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse this alarm/timer request: "${command}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "The type of alarm: 'timer' for relative time (e.g., in 5 minutes, every 10 minutes), 'time' for an absolute time of day (e.g., at 7 AM, 3:30 PM)."
          },
          recurring: {
            type: Type.BOOLEAN,
            description: "Whether the alarm should repeat (e.g., 'every 5 minutes')."
          },
          intervalSeconds: {
            type: Type.INTEGER,
            description: "If type is 'timer', the duration in seconds. For example, 9 minutes and 30 seconds is 570."
          },
          absoluteTime: {
            type: Type.STRING,
            description: "If type is 'time', the 24-hour time string in HH:MM format (e.g., '07:00', '15:30')."
          },
          label: {
            type: Type.STRING,
            description: "A short, descriptive label for the alarm."
          }
        },
        required: ["type", "recurring", "label"]
      }
    }
  });
  
  return JSON.parse(response.text || "{}");
}
