"use client";

import Image from "next/image";
import { useState } from "react";

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  function toggleMusic() {
    const iframe = document.getElementById("yt-player") as HTMLIFrameElement;
    if (!iframe) return;

    if (!playing) {
      // Se é a primeira vez que toca, tiramos o mudo e baixamos o volume
      if (!hasInteracted) {
        // Comando para tirar o mudo
        iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "unMute" }), "*");
        // Comando para volume baixo (ex: 20%)
        iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [20] }), "*");
        setHasInteracted(true);
      }
      
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "playVideo" }), "*");
    } else {
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo" }), "*");
    }

    setPlaying(!playing);
  }

  return (
    <button
      onClick={toggleMusic}
      className=" bg-[#3B252F] backdrop-blur px-5 py-2 rounded-lg text-primary font-semibold hover:bg-white transition-all active:scale-95 mb-4"
    >
      {playing ? (
        <div className="flex gap-4 flex-row-reverse">
          <Image 
            src="/pause-audio-icon.svg"
            alt="pause-icon"
            width={15}
            height={15}
          />
          <span>Pausar Música</span>
        </div>
      ) : (
        <div className="flex gap-4 flex-row-reverse">
          <Image 
            src="/music-icon.svg"
            alt="pause-icon"
            width={15}
            height={15}
          />
          <span>Tocar Música</span>
        </div>
      )}
    </button>
  );
}
