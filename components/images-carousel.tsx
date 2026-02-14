"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
};

export default function ImageCarousel({ images }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-120 rounded-3xl overflow-hidden bg-[#3b252fc5] shadow-2xl mb-10">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt="Foto do casal"
            fill
            priority={index === 0} // Carrega a primeira imagem com prioridade máxima
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ))}
    </div>
  );
}
