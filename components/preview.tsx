"use client";

import Image from "next/image";
import ImageCarousel from "@/components/images-carousel";
import calculateTimeTogether from "@/lib/calculate-time";
import FallingHearts from "./animations/falling-hearts";

interface PreviewProps {
  names: string;
  message: string;
  startDate: string;
  story?: string;
  imagePreviews: string[];
  audioBlob: boolean;
  plan: "basic" | "premium";
}

export default function Preview({
  names,
  message,
  startDate,
  story,
  imagePreviews,
  audioBlob,
  plan,
}: PreviewProps) {

  return (
    <section className="h-fit bg-background text-white border-2 border-primary/20 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden relative">
      {/* Background Decorativo (Corações) */}
      
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        
        <Image
          src="/big-heart-totheright.png"
          alt="heart"
          width={300}
          height={300}
          className="absolute -left-20 top-50"
        />
        <Image
          src="/big-heart-totheleft.png"
          alt="heart"
          width={300}
          height={300}
          className="absolute -right-20 top-52"
        />
      </div>
    
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Badge de Preview */}
        <div className="bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-8 border border-primary/30">
          Visualização em Tempo Real
        </div>
        <div className="flex items-center gap-1 mb-3">
            <Image 
            src="/logo_lovers.svg"
            alt="logo-lovers"
            width={40}
            height={40}
            />
            <span className="text-4xl tracking-tighter mt-3 font-harmattan font-extrabold text-primary">Lovers</span>
        </div>

        {/* Carrossel de Imagens */}
        <div className="w-full flex flex-col items-center">
            <div
                className=" bg-[#3B252F] w-43.75 px-5 py-2 rounded-lg text-primary font-semibold mb-4 z-10"
            >
                <div className="flex gap-4 flex-row-reverse">
                <Image 
                    src="/music-icon.svg"
                    alt="pause-icon"
                    width={15}
                    height={15}
                />
                <span>Tocar Música</span>
                </div>
            </div>
          {imagePreviews.length > 0 ? (
            <ImageCarousel images={imagePreviews} />
          ) : (
            <div className="aspect-square w-full max-w-75 mx-auto bg-primary/ border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center p-6 mb-6">
              <Image
                src="/image-placeholder.svg"
                alt="fotos"
                width={48}
                height={48}
                className="opacity-20 mb-4"
              />
              <p className="text-xs text-white/40">As vossas fotos aparecerão aqui</p>
            </div>
          )}
            <FallingHearts />
        </div>

        <div className="w-60 h-60 bg-primary blur-[90px] -z-10 mix-blend-lighten absolute top-100" />
        {/* Nomes do Casal */}
        <h1 className="text-3xl md:text-4xl font-sans text-primary font-extrabold mb-4 wrap-break-word w-full">
          {names || "Nomes do Casal"}
        </h1>
          
        {/* Mensagem Principal */}
        <p className="text-base opacity-95 mb-6 italic wrap-break-word w-full">
          {message || "A vossa mensagem especial aparecerá aqui..."}
        </p>

        {/* Contador de Tempo */}
        <div className="flex mb-6 p-3 rounded-xl w-full justify-center items-center bg-[#3B252F] text-sm shadow-inner">
          {startDate ? (
            <>
              Juntos fazem
              <span className="text-[#FBCDE1] ml-2 font-bold">
                {calculateTimeTogether(startDate)}
              </span>
              <Image
                src="/tiny-rose-heart.svg"
                alt="heart"
                width={16}
                height={16}
                className="ml-2 animate-pulse"
              />
            </>
          ) : (
            <span className="opacity-50 italic text-xs">Aguardando data de início...</span>
          )}
        </div>

        <div className="w-full mb-8 wrap-break-word">
            <h3 className="text-primary text-md font-bold uppercase tracking-widest mb-3">
                Nossa História
            </h3>
            <p className="text-sm opacity-80 whitespace-pre-line text-left leading-relaxed">
                {story || "A vossa história de amor será contada aqui..."}
            </p>
        </div>

        {/* Áudio (Apenas Premium) */}
        {plan === "premium" && (
          <div className="w-full pt-6 border-t border-white/10">
            {audioBlob ? (
              <div className="text-sm font-semibold">🎙️ Áudio incluído</div>
            ) : (
              <div className="py-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                <p className="text-[10px] text-white/30 italic">
                  Grave uma mensagem de voz para ouvir aqui
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
