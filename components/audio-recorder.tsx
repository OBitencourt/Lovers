"use client";

import Image from "next/image";
import { useRef, useState, useEffect, memo } from "react";

interface AudioRecorderProps {
  audioBlob: Blob | null;
  onRecordComplete: (blob: Blob | null) => void;
}

// 🛠 Usamos memo para evitar re-renders desnecessários vindos do componente pai
const AudioRecorder = memo(function AudioRecorder({
  audioBlob,
  onRecordComplete,
}: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // 🛠 MUDANÇA CHAVE: Usamos um useState para a URL em vez de apenas um useRef.
  // Isso garante que o React saiba que a URL existe e renderize o elemento <audio> corretamente.
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  function getSupportedMimeType() {
    const types = ["audio/mp4", "audio/aac", "audio/mpeg", "audio/webm"];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return "";
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/wav" });
        onRecordComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
      alert("Não foi possível aceder ao microfone.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  function resetRecording() {
    onRecordComplete(null);
  }

  // 🛠 Gerenciamento robusto da URL do áudio
  useEffect(() => {
    if (!audioBlob) {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      return;
    }

    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  return (
    <div className="rounded-3xl bg-primary p-6 shadow space-y-4 flex flex-col items-center">
      <h3 className="text-xl font-semibold text-white text-center">
        Áudio personalizado (Premium)
      </h3>

      {!audioBlob && (
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className="px-6 py-3 rounded-xl bg-white text-background font-semibold transition-all hover:scale-105 active:scale-95"
        >
          {isRecording ? (
            <div className="flex gap-3 items-center">
              <p className="animate-pulse">Gravando... Parar</p>
              <Image src="/pause-audio-icon.svg" alt="pause" width={10} height={10} />
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <p>Gravar áudio</p>
              <Image src="/play-audio-icon.svg" alt="play" width={20} height={20} className="w-3 h-auto" />
            </div>
          )}
        </button>
      )}

      {audioBlob && audioUrl && (
        <div className="w-full flex flex-col items-center space-y-4">
          <audio 
            controls 
            src={audioUrl} 
            className="w-full max-w-xs" 
            playsInline 
          />
          <button
            type="button"
            onClick={resetRecording}
            className="block text-sm font-bold text-white underline hover:text-rose-200"
          >
            Gravar novamente
          </button>
        </div>
      )}
    </div>
  );
});

export default AudioRecorder;
