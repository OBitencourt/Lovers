"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import ImageCarousel from "@/components/images-carousel";
import MusicToggle from "@/components/music-toggle";
import Image from "next/image";
import calculateTimeTogether from "@/lib/calculate-time";
import FallingHearts from "@/components/animations/falling-hearts";
import GiftAnimation from "@/components/animations/gift-animation";
import { motion, AnimatePresence } from "framer-motion";

type Couple = {
  _id: string;
  slug: string;
  plan: "basic" | "premium";
  email: string;
  startDate: string;
  coupleName: string;
  message: string;
  story?: string;
  images: string[];
  youtubeUrl?: string;
  audioUrl?: string | null;
  paid: true;
};

export default function CouplePolling({ slug }: { slug: string }) {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchCouple = async () => {
      if (retryCount >= 3) {
        if (interval) clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`/api/couples?slug=${slug}`, { cache: "no-store" });
        if (!res.ok) { setIsInitialLoading(false); return; }

        const data = await res.json();
        setCouple(data);
        setIsInitialLoading(false);

        if (data.paid) {
          clearInterval(interval);
        } else {
          setRetryCount(prev => prev + 1);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setIsInitialLoading(false);
        setRetryCount(prev => prev + 1);
      }
    };

    fetchCouple();
    interval = setInterval(fetchCouple, 3000);

    return () => clearInterval(interval);
  }, [slug, retryCount]);

  const getYoutubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const startMusic = useCallback(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const player = iframeRef.current.contentWindow;
      
      // Comandos explícitos para iniciar a música
      const playCommand = JSON.stringify({ event: "command", func: "playVideo", args: [] });
      const unmuteCommand = JSON.stringify({ event: "command", func: "unMute", args: [] });
      const volumeCommand = JSON.stringify({ event: "command", func: "setVolume", args: [40] });

      player.postMessage(playCommand, "*");
      player.postMessage(unmuteCommand, "*");
      player.postMessage(volumeCommand, "*");
      
      window.dispatchEvent(new CustomEvent("musicStarted"));
      
      // Fallback para garantir que o play foi registado
      setTimeout(() => {
        player.postMessage(playCommand, "*");
        player.postMessage(unmuteCommand, "*");
      }, 500);
    }
  }, []);

  const handleOpenGift = () => {
    setHasEntered(true);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!couple) return <div className="min-h-screen flex items-center justify-center text-white bg-rose-500"><p>Homenagem não encontrada.</p></div>;

  if (!couple.paid) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8 bg-background text-white">
        <div className="space-y-4">
          <p className="text-2xl font-bold animate-pulse">💖 Quase lá!</p>
          <p className="text-lg opacity-90">Confirmando seu pagamento...</p>
          {retryCount >= 3 && (
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 text-sm underline opacity-70 hover:opacity-100"
            >
              Ainda não liberou? Clique aqui para atualizar.
            </button>
          )}
        </div>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const youtubeId = getYoutubeId(couple.youtubeUrl);

  return (
    <main className="min-h-screen bg-background text-white overflow-x-hidden relative">
      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            key="gift-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-100"
          >
            <GiftAnimation 
              onOpen={handleOpenGift} 
              giftImage="/presente.png"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key="couple-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: hasEntered ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        onAnimationComplete={() => {
          if (hasEntered) startMusic();
        }}
        className={hasEntered ? "pointer-events-auto" : "pointer-events-none absolute inset-0 overflow-hidden h-screen"}
      >
        {youtubeId && (
          <iframe
            ref={iframeRef}
            id="yt-player"
            /* 
               REMOVIDO autoplay=1 para evitar que o YouTube inicie sozinho antes da hora.
               O play será dado manualmente pela função startMusic após a abertura do presente.
            */
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=0&mute=0&controls=0&loop=1&playlist=${youtubeId}&origin=${origin}`}
            className="hidden"
            allow="autoplay"
          />
        )}
        
        <header className="top-0 left-0 w-full z-50 flex justify-center items-center p-4">
          <Image src="/logo_lovers.svg" alt="logo-lovers" width={50} height={50} />
          <span className="text-4xl tracking-tighter mt-3 font-harmattan font-extrabold text-primary">Lovers</span>
        </header> 

        <div className="min-h-screen absolute w-full overflow-x-hidden pointer-events-none">
          <Image src="/big-heart-totheright.png" alt="heart" width={600} quality={100} height={100} className="absolute h-auto md:-left-20 -left-60" />
          <Image src="/big-heart-totheleft.png" alt="heart" width={600} quality={100} height={100} className="absolute h-auto md:-right-20 -right-60" />
        </div>

        <div className="max-w-3xl mx-auto flex flex-col items-center px-6 py-2 text-center">
          <div className="w-110 h-110 top-50 absolute bg-primary rounded-full blur-[100px] mix-blend-plus-lighter pointer-events-none"></div>
          <MusicToggle />
          <FallingHearts />
          <ImageCarousel images={couple.images || []} />
          <h1 className="text-4xl md:text-5xl font-sans text-primary font-extrabold mb-4">{couple.coupleName}</h1>
          <p className="text-lg opacity-95 mb-6">{couple.message}</p>
          <div className="flex mb-6 p-2 rounded-xl md:w-1/2 text-white font-sans w-full justify-center items-center bg-[#3B252F]">
            Juntos fazem<span className="text-[#FBCDE1] ml-2">{calculateTimeTogether(couple.startDate)}</span>
            <Image src="/tiny-rose-heart.svg" alt="tiny-heart" width={20} height={20} className="ml-2" />
          </div>
          {couple.story && <p className="opacity-90 whitespace-pre-line mb-8">{couple.story}</p>}
          {couple.audioUrl && (
            <div className="flex flex-col items-center mb-12 w-full">
              <audio controls src={couple.audioUrl} className="mx-auto w-full max-w-md" playsInline preload="auto" />
              <span className="mt-6 text-sm text-white/50">Confira seu email para pegar o link e o seu QR Code!</span>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
