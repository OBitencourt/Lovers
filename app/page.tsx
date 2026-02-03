// Landing Page – Lovers
// Server Component (App Router)

import Header from "@/components/header";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-gray-900 overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-screen px-6 pt-2">
        <div className="absolute w-80 h-80 bg-primary animate-pulse blur-[150px] mix-blend-screen"/>
        <div className="relative z-10 max-w-3xl text-center flex flex-col items-center">
          <Image 
            src="/hero-detail.svg"
            alt="detail"
            width={120}
            height={120}
            className="mb-16"
          />
          <h1 className="text-5xl md:text-6xl font-sans font-extralight tracking-tighter text-white mb-6">
            Transforme sua história de amor em uma
            <span className="block text-primary mt-4 font-extrabold bg-primary/10 rounded-xl p-4">
              Página Inesquecível
            </span>
          </h1>
          <p className="text-lg text-white font-sans font-light w-100 mb-10">
            Uma experiência digital única para guardar memórias, mensagens,
            fotos e emoções.
          </p>
          <Link
            href="/create"
            className="pl-8 pr-1 py-1 rounded-2xl flex drop-shadow-[0_5px_0_#FBCDE1]  items-center gap-4 bg-white text-background font-semibold text-lg shadow-lg hover:scale-105 transition-all"
          >
            Criar página agora
            
            <div className="p-4 rounded-xl flex justify-center items-center bg-primary relative">
              <div className="h-15 w-15 bg-primary absolute -z-1 blur-lg mix-blend-hard-light" />
              <Image 
                src="/squares-heart-icon.svg"
                alt="heart"
                width={35}
                height={35}
              />
            </div>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-32 px-6 max-w-6xl mx-auto relative">
        <h2 className="text-4xl font-bold text-center text-primary mb-20">
          Como funciona?
        </h2>
        <div className="grid md:grid-cols-3 gap-12 z-10">
          <div className="h-60 w-100 bg-primary mix-blend-lighten blur-[150px] rounded-full absolute right-90 " />
          {["Personalize", "Pagamento", "Surpreenda"].map((title, i) => (
            <div
              key={title}
              className="relative z-10 px-8 py-10 rounded-3xl bg-[#160009] backdrop-blur hover:-translate-y-3 transition-all min-h-50"
            >
              <div className="flex justify-center items-center gap-4">
                <div className="py-3 px-5 bg-primary rounded-full text-white border border-border">
                  {i + 1}
                </div>
                <h3 className="text-2xl mt-4 font-semibold text-white mb-4">
                  {title}
                </h3>
              </div>
              <p className="text-muted text-center mt-4">
                {i === 0 &&
                  "Insira os dados do casal, mensagens, fotos e detalhes especiais."}
                {i === 1 &&
                  "Realize o pagamento de forma rápida e fácil."}
                {i === 2 &&
                  "Receba um link exclusivo para compartilhar ou presentear."}
              </p>
            </div>
          ))}
        </div>
        <Image 
          src="/big-heart.svg"
          alt="heart"
          width={80}
          height={80}
          className="absolute w-200 h-auto top-70 right-40 z-0"
        />
      </section>

      {/* Plans */}
      <section id="prices" className="py-32 px-6">
        <div className="max-w-5xl mx-auto z-10">
          <h2 className="text-4xl font-bold text-center text-white mb-6 z-10">
            Planos
          </h2>
          <p className="text-center text-primary/80 mb-20 max-w-2xl mx-auto">
            Dois planos simples. Uma experiência inesquecível para quem você
            ama.
          </p>

          <div className="grid md:grid-cols-6 gap-12 relative">
            {/* Basic */}
            <div className="relative flex flex-col p-10 col-span-3 rounded-3xl bg-[#160009] border-2 border-border/20 hover:-translate-y-2 transition-all">
              <span className="absolute top-6 right-6 text-xs font-semibold text-rose-500">
                BASIC
              </span>

              <h3 className="text-3xl font-semibold text-white text-center mb-6">
                Básico
              </h3>

              <p className="text-start text-white/70 text-medium mb-5">O que está incluído:</p>

              <ul className="space-y-4 text-primary mb-10">
                <li className="flex items center gap-3">
                  <Image 
                    src="/check-icon.svg"
                    alt="check"
                    width={12}
                    height={12}
                  />
                  Página personalizada do casal
                </li>
                <li className="flex items center gap-3">
                  <Image 
                    src="/check-icon.svg"
                    alt="check"
                    width={12}
                    height={12}
                  />
                  Mensagem especial
                </li>
                <li className="flex items center gap-3">
                  <Image 
                    src="/check-icon.svg"
                    alt="check"
                    width={12}
                    height={12}
                  />
                  Upload de imagens
                </li>
                <li className="flex items center gap-3">
                  <Image 
                    src="/check-icon.svg"
                    alt="check"
                    width={12}
                    height={12}
                  />
                  Música de fundo (YouTube)
                </li>
                <li className="flex items center gap-3">
                  <Image 
                    src="/check-icon.svg"
                    alt="check"
                    width={12}
                    height={12}
                  />
                  Link válido por 6 meses
                </li>
              </ul>

              <span className="text-white/70 font-bold text-center mb-6 tracking-tight text-4xl">4,99€</span>

              <Link
                href="/create?plan=basic"
                className="flex gap-4 items-center justify-center w-full rounded-xl text-primary py-4 font-semibold border border-primary hover:bg-primary/20 transition"
              >
                Criar Página Basic 
                <Image 
                  src="/pink-squares-heart-icon.svg"
                  alt="heart-pink"
                  width={20}
                  height={20}
                />
              </Link>
            </div>

            {/* Premium */}
            <div className="relative hover:-translate-y-2 transition col-span-3 p-10 rounded-3xl bg-[#160009] border-4 border-primary text-white shadow-2xl scale-[1.03] z-10 flex flex-col">
              <div className="bg-primary gap-2 text-white flex items-center justify-center py-2 px-3 rounded-t-2xl absolute -top-10 right-40">
                <Image 
                  src="/white-shine-icon.svg"
                  alt="shine"
                  width={15}
                  height={15}
                />
                Mais Escolhido
              </div>
              <span className="absolute top-6 right-6 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                PREMIUM
              </span>

              <h3 className="text-3xl font-semibold mb-6 text-center">Premium</h3>

              <p className="text-start text-white/70 text-medium mb-5">O que está incluído:</p>

              <ul className="space-y-4 text-primary mb-10">
                <li className="flex items center gap-3">
                  <Image 
                    src="/check-icon.svg"
                    alt="check"
                    width={12}
                    height={12}
                  />
                  <div className="flex gap-1">
                    <span className="font-bold">TUDO</span>do plano básico
                  </div>
                </li>
                <li className="flex items center gap-3">
                  <Image 
                    src="/check-icon.svg"
                    alt="check"
                    width={12}
                    height={12}
                  />
                  <div className="flex gap-1">
                    Áudio <span className="font-bold">PERSONALIZADO</span>
                  </div>
                </li>
                <li className="flex items center gap-3">
                  <Image 
                    src="/check-icon.svg"
                    alt="check"
                    width={12}
                    height={12}
                  />
                  <div className="flex gap-1">
                    Upload de <span className="font-bold">3 IMAGENS</span>
                  </div>
                </li>
                <li className="flex items center gap-3">
                  <Image 
                    src="/check-icon.svg"
                    alt="check"
                    width={12}
                    height={12}
                  />
                  Impacto emocional máximo
                </li>
                <li className="flex items center gap-3">
                  <Image 
                    src="/check-icon.svg"
                    alt="check"
                    width={12}
                    height={12}
                  />
                  <div className="flex gap-1">
                    Link válido para <span className="font-bold">SEMPRE</span>
                  </div>
                </li>
              </ul>

              <span className="text-white font-bold text-center mb-6 tracking-tight text-4xl">7,99€</span>

              <Link
                href="/create?plan=premium"
                className="flex gap-4 items-center justify-center w-full rounded-xl bg-primary text-white py-4 font-semibold border border-primary hover:scale-[1.02] hover:bg-primary/50 transition"
              >
                <Image 
                  src="/squares-heart-icon.svg"
                  alt="heart-pink"
                  width={20}
                  height={20}
                />
                Criar página Premium
                <Image 
                  src="/squares-heart-icon.svg"
                  alt="heart-pink"
                  width={20}
                  height={20}
                />
              </Link>
              
            </div>
            <div className="w-120 h-20 bg-primary rounded-full mix-blend-lighten absolute top-110 right-2 blur-3xl z-0" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 text-center relative">
        <div className="absolute inset-0 bg-linear-to-r from-rose-300 via-pink-300 to-rose-300 animate-gradient-x opacity-60" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold text-white mb-8">
            Footer
          </h2>
        </div>
      </footer>
    </main>
  );
}
