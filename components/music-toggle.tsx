"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Função para enviar comandos ao Iframe do YouTube
  const sendCommand = useCallback((func: string, args: any[] = []) => {
    const iframe = document.getElementById("yt-player") as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    }
  }, []);

  const toggleMusic = useCallback(() => {
    if (!playing) {
      // Se o utilizador clicar manualmente, garantimos que o som está ativo
      sendCommand("unMute");
      sendCommand("setVolume", [40]);
      sendCommand("playVideo");
      setPlaying(true);
      setHasInteracted(true);
    } else {
      sendCommand("pauseVideo");
      setPlaying(false);
    }
  }, [playing, sendCommand]);

  // Lógica para sincronizar com eventos externos (ex: CouplePolling iniciando a música após o presente)
  useEffect(() => {
    const handleMusicStarted = () => {
      setPlaying(true);
      setHasInteracted(true);
    };

    const handleMusicPaused = () => {
      setPlaying(false);
    };

    window.addEventListener("musicStarted", handleMusicStarted);
    window.addEventListener("musicPaused", handleMusicPaused);

    return () => {
      window.removeEventListener("musicStarted", handleMusicStarted);
      window.removeEventListener("musicPaused", handleMusicPaused);
    };
  }, []);

  // REMOVIDA a lógica de handleFirstInteraction global que causava o play no primeiro clique do presente

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleMusic();
      }}
      className="bg-[#3B252F] backdrop-blur px-5 py-2 rounded-lg text-primary font-semibold hover:bg-white transition-all active:scale-95 mb-4 relative z-50"
    >
      {playing ? (
        <div className="flex gap-4 flex-row-reverse">
          <Image src="/pause-audio-icon.svg" alt="pause-icon" width={15} height={15} />
          <span>Pausar Música</span>
        </div>
      ) : (
        <div className="flex gap-4 flex-row-reverse">
          <Image src="/music-icon.svg" alt="music-icon" width={15} height={15} />
          <span>Tocar Música</span>
        </div>
      )}
    </button>
  );
}
