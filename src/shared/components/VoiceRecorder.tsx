import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  label?: string;
}

export default function VoiceRecorder({ onRecordingComplete, label = "سجل شكواك بصوتك" }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordingBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        onRecordingComplete(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimer(0);
      intervalRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setRecordingBlob(null);
    setAudioUrl(null);
    setTimer(0);
  };

  return (
    <div className="glass-panel p-8 rounded-3xl border-dashed border-2 border-white/10 flex flex-col items-center">
      <p className="text-sm font-medium text-white/60 mb-6">{label}</p>
      
      <div className="relative mb-8">
        <AnimatePresence mode="wait">
          {!recordingBlob ? (
            <motion.button
              key="record"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'gold-gradient shadow-lg shadow-gold-500/20 text-black'
              }`}
            >
              {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-10 h-10" />}
              {isRecording && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-red-500 rounded-full"
                />
              )}
            </motion.button>
          ) : (
            <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-4">
              <button 
                onClick={resetRecording}
                className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                title="إعادة التسجيل"
              >
                <Trash2 className="w-6 h-6 text-red-400" />
              </button>
              <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center shadow-lg shadow-gold-500/30">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isRecording && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-display font-bold text-red-500">
          {formatTime(timer)}
        </motion.p>
      )}

      {audioUrl && !isRecording && (
        <div className="w-full max-w-xs">
          <audio src={audioUrl} controls className="w-full h-10 opacity-60 hover:opacity-100 transition-opacity" />
        </div>
      )}

      {!isRecording && !recordingBlob && (
        <p className="text-xs text-white/30 text-center max-w-[200px]">
          تحدث بوضوح واشرح تفاصيل خلافك بلغتكم الدارجة، نحن نسمعك.
        </p>
      )}
    </div>
  );
}
