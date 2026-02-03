"use client";

import Image from "next/image";
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
    <div className="rounded-3xl bg-primary p-6 shadow space-y-4 flex flex-col items-center">
      <h3 className="text-xl font-semibold text-white text-center">Áudio personalizado (Premium)</h3>

      {!audioBlob && (
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className="px-6 py-3 rounded-xl bg-white text-background font-semibold"
        >
          {isRecording ? (
            <div className="flex gap-3">
              <p>
                Parar gravação
              </p>
              <Image 
                src="/pause-audio-icon.svg"
                alt="record"
                width={10}
                height={10}
              />
            </div>
          ) : (
            <div className="flex gap-3">
              <p>
                Gravar áudio
              </p>
              <Image 
                src="/play-audio-icon.svg"
                alt="record"
                width={20}
                height={20}
                className="w-3 h-auto"
              />
            </div>
          )}
        </button>
      )}

      {audioBlob && (
        <>
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <button
            type="button"
            onClick={resetRecording}
            className="block text-sm font-bold text-white underline"
          >
            Gravar novamente
          </button>
        </>
      )}
    </div>
  );
}
