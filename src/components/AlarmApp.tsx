import React, { useState, useRef, useEffect } from 'react';
import { useAlarms } from '../hooks/useAlarms';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { parseAlarmCommand } from '../lib/gemini';
import { AlarmItem } from './AlarmItem';
import { Mic, MicOff, Send, Loader2, Clock, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AlarmApp() {
  const { alarms, addAlarm, removeAlarm, toggleAlarm, stopRinging } = useAlarms();
  const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechRecognition();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync transcript to input text
  useEffect(() => {
    if (isListening && transcript) {
      setInputText(transcript);
    }
  }, [transcript, isListening]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const parsed = await parseAlarmCommand(inputText);
      
      if (!parsed.type || !parsed.label) {
        throw new Error("Could not understand the alarm request.");
      }
      
      addAlarm(parsed);
      setInputText('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create alarm. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-6 shadow-lg shadow-indigo-200">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">AI Voice Alarm</h1>
          <p className="text-lg text-slate-500 max-w-md mx-auto">
            Dictate your timers and alarms naturally. "Wake me up in 20 minutes" or "Remind me every 2 hours to drink water."
          </p>
        </header>

        {/* Input Section */}
        <section className="mb-12">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Volume2 className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="E.g., Make me an alarm every 9 minutes and 30 seconds"
              className="block w-full pl-12 pr-24 py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg shadow-sm focus:ring-0 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              disabled={isProcessing || isListening}
            />
            
            <div className="absolute inset-y-0 right-2 flex items-center gap-1">
              {hasSupport && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isProcessing}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                  }`}
                  title={isListening ? "Stop listening" : "Start dictating"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing || isListening}
                className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-red-500 font-medium px-4"
            >
              {error}
            </motion.p>
          )}
        </section>

        {/* Alarms List */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl font-semibold text-slate-800">Active Alarms</h2>
            <span className="bg-slate-200 text-slate-600 py-1 px-3 rounded-full text-sm font-medium">
              {alarms.length}
            </span>
          </div>
          
          {alarms.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-3xl">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No alarms set</h3>
              <p className="text-slate-500">Try dictating a new alarm above.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {alarms.map(alarm => (
                  <motion.div
                    key={alarm.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  >
                    <AlarmItem
                      alarm={alarm}
                      onToggle={toggleAlarm}
                      onRemove={removeAlarm}
                      onStopRinging={stopRinging}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
