'use client'

import { useState, useEffect } from "react";

export default function FallingHearts() {
  const [hearts, setHearts] = useState<any[]>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 20 }).map((_, i) => {
      const side = i % 2 === 0 ? "left" : "right";
      const randomPos = side === "left" 
        ? Math.random() * 15 // 0% a 15%
        : 85 + Math.random() * 15; // 85% a 100%

      return {
        id: i,
        left: `${randomPos}%`,
        duration: `${6 + Math.random() * 6}s`,
        delay: `${Math.random() * 10}s`,
        size: `${12 + Math.random() * 18}px`,
        opacity: 0.3 + Math.random() * 0.4,
      };
    });
    setHearts(newHearts);
  }, []);

  return (
    <div className="inset-0 pointer-events-none overflow-hidden z-0">
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: var(--op); }
          90% { opacity: var(--op); }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .heart-particle {
          position: absolute;
          top: -10vh;
          animation: fall linear infinite;
        }
      `}</style>
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart-particle"
          style={{
            left: heart.left,
            fontSize: heart.size,
            animationDuration: heart.duration,
            animationDelay: heart.delay,
            "--op": heart.opacity,
            color: '#FF4D7D' // Cor primária Lovers
          } as any}
        >
          ❤️
        </div>
      ))}
    </div>
  );
}