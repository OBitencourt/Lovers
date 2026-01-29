"use client";

import { useRef, useState, useEffect } from "react";

interface AudioRecorderProps {
  audioBlob: Blob | null;
  onRecordComplete: (blob: Blob | null) => void;
}

export default function AudioRecorder({ audioBlob, onRecordComplete }: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      onRecordComplete(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  function resetRecording() {
    onRecordComplete(null);
  }

  return (
    <div className="rounded-2xl bg-white/70 p-6 shadow space-y-4">
      <h3 className="text-xl font-semibold text-rose-600">Áudio personalizado (Premium)</h3>

      {!audioBlob && (
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className="px-6 py-3 rounded-full bg-rose-500 text-white font-semibold"
        >
          {isRecording ? "Parar gravação" : "Gravar áudio"}
        </button>
      )}

      {audioBlob && (
        <>
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <button
            type="button"
            onClick={resetRecording}
            className="block text-sm text-rose-600 underline"
          >
            Gravar novamente
          </button>
        </>
      )}
    </div>
  );
}
