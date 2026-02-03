"use client";

import { useEffect, useState } from "react";
import ImageCarousel from "@/components/images-carousel";
import MusicToggle from "@/components/music-toggle";
import Image from "next/image";
import calculateTimeTogether from "@/lib/calculate-time";

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
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Novo estado

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchCouple = async () => {
      try {
        const res = await fetch(`/api/couples?slug=${slug}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setIsInitialLoading(false);
          return;
        }

        const data = await res.json();
        setCouple(data);
        setIsInitialLoading(false); // Dados carregados pela primeira vez

        if (data.paid) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setIsInitialLoading(false);
      }
    };

    fetchCouple();
    interval = setInterval(fetchCouple, 3000);

    return () => clearInterval(interval);
  }, [slug]);

  // 1. Carregamento inicial (Silencioso ou um Spinner discreto)
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background items-center justify-center">
        {/* Um spinner simples ou apenas fundo vazio para não "piscar" a mensagem de pagamento */}
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Se o casal não existe no banco
  if (!couple) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-rose-500">
        <p>Homenagem não encontrada.</p>
      </div>
    );
  }

  // 3. Se existe mas o pagamento ainda não foi confirmado pelo Webhook
  if (!couple.paid) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8 bg-background text-white">
        <div className="space-y-4">
          <p className="text-2xl font-bold animate-pulse">💖 Quase lá!</p>
          <p className="text-lg opacity-90">
            Estamos confirmando seu pagamento para liberar sua homenagem...
          </p>
        </div>
      </div>
    );
  }

  // 4. Caso de Sucesso (Pago)
  const youtubeId = couple.youtubeUrl?.split("watch?v=")[1]?.split("&")[0];
  return (
    <main className="min-h-screen bg-backgroundtext-white">
      {/* Música invisível - Adicionamos origin para segurança e garantimos o enablejsapi */}
      {youtubeId && (
        <iframe
          id="yt-player"
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${youtubeId}`}
          className="hidden"
          allow="autoplay"
        />
      )}
      
      <header className="top-0 left-0 w-full z-50 flex justify-center items-center p-4">
        <Image 
          src="/logo_lovers.svg"
          alt="logo-lovers"
          width={50}
          height={50}
        />
        <span className="text-4xl tracking-tighter mt-3 font-harmattan font-extrabold text-primary">Lovers</span>
      </header> 

      <Image 
        src="/big-heart-totheright.png"
        alt="heart"
        width={600}
        quality={100}
        height={100}
        className="absolute h-auto -left-20"
      />
      <Image 
        src="/big-heart-totheleft.png"
        alt="heart"
        width={600}
        quality={100}
        height={100}
        className="absolute h-auto -right-20"
      />

      <div className="max-w-3xl mx-auto flex flex-col items-center px-6 py-2 text-center">
        <div className="w-110 h-110 top-50 absolute bg-primary rounded-full blur-[100px] mix-blend-plus-lighter">

        </div>

        <MusicToggle />
        <ImageCarousel images={couple.images || []} />

        <h1 className="text-5xl font-sans text-primary font-extrabold mb-4">
          {couple.coupleName}
        </h1>

        <p className="text-lg opacity-95 mb-6">
          {couple.message}
        </p>

        <div className="flex mb-6 p-2 rounded-xl w-1/2 text-white font-sans justify-center items-center bg-[#3B252F]">
          Juntos fazem<span className="text-[#FBCDE1] ml-2">{calculateTimeTogether(couple.startDate)}</span>
          <Image 
            src="/tiny-rose-heart.svg"
            alt="tiny-heart"
            width={20}
            height={20}
            className="ml-2"
          />
        </div>

        {couple.story && (
          <p className="opacity-90 whitespace-pre-line mb-8">
            {couple.story}
          </p>
        )}

        {couple.audioUrl && (
          <div className="flex flex-col items-center mb-12">
            {/* <button className="py-4 px-6 rounded-2xl mb-6 flex bg-white font-sans text-primary gap-3 items-center font-bold">
              Tocar Áudio
              <Image 
                src="/play-audio-icon.svg"
                alt="play-icon"
                width={20}
                height={20}
              />
            </button> */}
            <audio controls src={couple.audioUrl} className="mx-auto" />

            <span className="mt-6 text-sm text-white/50">Confira seu email para pegar o link e o seu QR Code! (Confira o spam)</span>
          </div>
        )}
      </div>
    </main>
  );
}
