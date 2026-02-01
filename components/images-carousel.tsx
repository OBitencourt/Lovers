"use client";

import { useEffect, useState } from "react";

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
    <div className="relative w-full h-80 rounded-3xl overflow-hidden shadow-2xl mb-10">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt="Foto do casal"
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
