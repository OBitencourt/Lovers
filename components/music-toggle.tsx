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
      if (!hasInteracted) {
        sendCommand("unMute");
        sendCommand("setVolume", [20]); // Volume em 20%
        setHasInteracted(true);
      }
      sendCommand("playVideo");
      setPlaying(true);
    } else {
      sendCommand("pauseVideo");
      setPlaying(false);
    }
  }, [playing, hasInteracted, sendCommand]);

  // 🛠 Lógica para detetar o primeiro clique em qualquer lugar da página
  useEffect(() => {
    if (hasInteracted) return;

    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        // Tenta iniciar a música no primeiro clique/toque
        sendCommand("unMute");
        sendCommand("setVolume", [20]);
        sendCommand("playVideo");
        setPlaying(true);
        setHasInteracted(true);
        
        // Remove os ouvintes após a primeira interação
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("touchstart", handleFirstInteraction);
      }
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [hasInteracted, sendCommand]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Evita disparar o clique global novamente
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
