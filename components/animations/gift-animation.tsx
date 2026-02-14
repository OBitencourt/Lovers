"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import confetti from "canvas-confetti";

interface GiftAnimationProps {
  onOpen: () => void;
  giftImage: string;
}

export default function GiftAnimation({ onOpen, giftImage }: GiftAnimationProps) {
  const [clicks, setClicks] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [rotation, setRotation] = useState(30);
  const maxClicks = 6;
  
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const openAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicialização robusta dos áudios
    const clickAudio = new Audio("/sfx/click.mp3");
    const openAudio = new Audio("/sfx/open.mp3");
    
    clickAudio.preload = "auto";
    openAudio.preload = "auto";
    
    clickAudio.volume = 0.5;
    openAudio.volume = 0.6;

    clickAudioRef.current = clickAudio;
    openAudioRef.current = openAudio;

    // Tentar carregar explicitamente
    clickAudio.load();
    openAudio.load();
  }, []);

  const handleClick = () => {
    if (isOpening) return;

    const newClicks = clicks + 1;
    setClicks(newClicks);

    const nextRotation = newClicks % 2 === 0 ? 50 : -30;
    setRotation(nextRotation);

    // Tocar som de clique APENAS se não for o último clique
    if (newClicks < maxClicks && clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch((e) => console.warn("Erro ao tocar clique:", e));
    }

    if (newClicks >= maxClicks) {
      handleOpen();
    }
  };

  const handleOpen = () => {
    setIsOpening(true);
    
    // Tocar som de abertura (com pequena garantia de play)
    if (openAudioRef.current) {
      openAudioRef.current.currentTime = 0;
      openAudioRef.current.play().catch((e) => console.warn("Erro ao tocar abertura:", e));
    }

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff005d', '#21000d', '#ffc0cb', '#ffffff'] });

    setTimeout(() => {
      onOpen();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background px-6 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Image src="/big-heart-totheright.png" alt="heart" width={400} height={400} className="absolute -left-20 top-0" />
        <Image src="/big-heart-totheleft.png" alt="heart" width={400} height={400} className="absolute -right-20 bottom-0" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isOpening ? 0 : 1,
          y: isOpening ? -20 : 0 
        }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <Image src="/logo_lovers.svg" alt="logo" width={80} height={80} className="mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-primary mb-2">Uma surpresa para ti...</h2>
        <p className="text-white/70 mb-12 max-w-xs mx-auto">Clica no presente para descobrir o que preparamos para celebrar o nosso amor.</p>

        <div className="relative cursor-pointer" onClick={handleClick}>
          <AnimatePresence>
            {!isOpening && (
              <motion.div
                key="gift"
                animate={{
                  scale: 1 + (clicks * 0.05),
                  rotate: rotation,
                  x: [0, -2, 2, -2, 2, 0],
                }}
                transition={{
                  x: { repeat: Infinity, duration: 0.5, ease: "linear" },
                  scale: { type: "spring", stiffness: 300, damping: 15 },
                  rotate: { type: "spring", stiffness: 200, damping: 12 }
                }}
                whileTap={{ scale: 0.9 }}
                className="relative w-64 h-64 mx-auto"
              >
                <Image 
                  src={giftImage} 
                  alt="Presente" 
                  fill 
                  className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                />
              </motion.div>
            )}

            {isOpening && (
              <motion.div
                key="opening"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ 
                  scale: [1, 1.5, 2.5], 
                  opacity: [1, 0.8, 0],
                  filter: ["blur(0px)", "blur(10px)", "blur(20px)"]
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-64 h-64 bg-white rounded-full filter blur-3xl opacity-50 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isOpening && clicks > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-primary font-bold"
            >
              {maxClicks - clicks} {maxClicks - clicks === 1 ? 'clique restante...' : 'cliques restantes...'}
            </motion.div>
          )}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isOpening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, times: [0, 0.5, 1] }}
            className="fixed inset-0 bg-white z-110 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
