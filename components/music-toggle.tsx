"use client";

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
      className="fixed top-24 right-24 z-50 bg-white/80 backdrop-blur px-5 py-2 rounded-full text-rose-600 font-semibold shadow-lg hover:bg-white transition-all active:scale-95"
    >
      {playing ? "⏸ Pausar música" : "▶️ Tocar música"}
    </button>
  );
}
