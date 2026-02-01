"use client";

import { useEffect, useState } from "react";
import ImageCarousel from "@/components/images-carousel";
import MusicToggle from "@/components/music-toggle";
import Header from "@/components/header";

type Couple = {
  _id: string;
  slug: string;
  plan: "basic" | "premium";
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
      <div className="min-h-screen bg-rose-400 flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center text-center p-8 bg-rose-400 text-white">
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
    <main className="min-h-screen bg-linear-to-br from-rose-400 via-pink-400 to-rose-500 text-white">
      {/* Música invisível - Adicionamos origin para segurança e garantimos o enablejsapi */}
      {youtubeId && (
        <iframe
          id="yt-player"
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${youtubeId}`}
          className="hidden"
          allow="autoplay"
        />
       )}
      <Header />

      <MusicToggle />

      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <ImageCarousel images={couple.images || []} />

        <h1 className="text-4xl font-extrabold mb-4">
          {couple.coupleName}
        </h1>

        <p className="text-lg opacity-95 mb-6">
          {couple.message}
        </p>

        {couple.story && (
          <p className="opacity-90 whitespace-pre-line mb-8">
            {couple.story}
          </p>
        )}

        {couple.audioUrl && (
          <audio controls src={couple.audioUrl} className="mx-auto" />
        )}
      </div>
    </main>
  );
}
