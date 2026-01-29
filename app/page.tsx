// Landing Page – Lovers
// Server Component (App Router)

import Header from "@/components/header";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-pink-50 via-pink-100 to-rose-200 text-gray-900 overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-screen px-6 pt-32">
        <div className="absolute inset-0 animate-pulse opacity-40 bg-[radial-gradient(circle_at_50%_50%,rgba(244,114,182,0.4),transparent_60%)]" />
        <div className="relative z-10 max-w-3xl text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-rose-600 mb-6">
            Transforme sua história de amor
            <span className="block text-pink-500">
              em uma página inesquecível
            </span>
          </h1>
          <p className="text-lg text-rose-900/80 mb-10">
            Uma experiência digital única para guardar memórias, mensagens,
            fotos e emoções.
          </p>
          <Link
            href="/create"
            className="inline-block px-10 py-4 rounded-full bg-rose-500 text-white font-semibold text-lg shadow-lg hover:scale-105 hover:bg-rose-600 transition-all"
          >
            Criar página agora
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-32 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-rose-600 mb-20">
          Como funciona
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {["Preencha", "Personalize", "Surpreenda"].map((title, i) => (
            <div
              key={title}
              className="relative p-10 rounded-3xl bg-white/70 backdrop-blur shadow-xl hover:-translate-y-3 transition-all"
            >
              <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-pink-400 animate-bounce" />
              <h3 className="text-2xl font-semibold text-rose-500 mb-4">
                {title}
              </h3>
              <p className="text-rose-900/70">
                {i === 0 &&
                  "Insira os dados do casal, mensagens, fotos e detalhes especiais."}
                {i === 1 &&
                  "Adicione música, áudio, imagens e deixe tudo com a cara de vocês."}
                {i === 2 &&
                  "Receba um link exclusivo para compartilhar ou presentear."}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 bg-pink-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-rose-600 mb-20">
            O que torna o Lovers especial
          </h2>
          <div className="grid md:grid-cols-2 gap-16">
            {[
              "Áudio personalizado",
              "Música de fundo",
              "QR Code exclusivo",
              "Design romântico",
            ].map((feature) => (
              <div
                key={feature}
                className="p-10 rounded-3xl bg-white shadow-lg hover:shadow-rose-300/50 transition"
              >
                <h3 className="text-2xl font-semibold text-pink-500 mb-4">
                  {feature}
                </h3>
                <p className="text-rose-900/70">
                  Cada detalhe foi pensado para transformar sentimentos em algo
                  visual e memorável.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-32 px-6 bg-pink-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-rose-600 mb-6">
            Escolha o plano ideal
          </h2>
          <p className="text-center text-rose-900/70 mb-20 max-w-2xl mx-auto">
            Dois planos simples. Uma experiência inesquecível para quem você
            ama.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Basic */}
            <div className="relative p-10 rounded-3xl bg-white shadow-xl hover:-translate-y-2 transition-all">
              <span className="absolute top-6 right-6 text-xs font-semibold text-rose-500">
                BASIC
              </span>

              <h3 className="text-3xl font-extrabold text-rose-600 mb-6">
                Lovers Basic
              </h3>

              <ul className="space-y-4 text-rose-900/80 mb-10">
                <li>• Página personalizada do casal</li>
                <li>• Mensagem especial</li>
                <li>• Upload de imagens</li>
                <li>• Música de fundo (YouTube)</li>
                <li>• QR Code exclusivo</li>
                <li>• Link válido por vários meses</li>
              </ul>

              <Link
                href="/create?plan=basic"
                className="inline-block w-full text-center rounded-full bg-rose-500 text-white py-4 font-semibold hover:bg-rose-600 transition"
              >
                Criar página
              </Link>
            </div>

            {/* Premium */}
            <div className="relative p-10 rounded-3xl bg-linear-to-br from-rose-500 via-pink-500 to-rose-600 text-white shadow-2xl scale-[1.03]">
              <span className="absolute top-6 right-6 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                PREMIUM
              </span>

              <h3 className="text-3xl font-extrabold mb-6">Lovers Premium</h3>

              <ul className="space-y-4 opacity-95 mb-10">
                <li>• Tudo do plano Basic</li>
                <li>• 🎙️ Áudio personalizado</li>
                <li>• Player exclusivo na página</li>
                <li>• Impacto emocional máximo</li>
              </ul>

              <Link
                href="/create?plan=premium"
                className="inline-block w-full text-center rounded-full bg-white text-rose-600 py-4 font-bold hover:scale-105 transition"
              >
                Criar página Premium
              </Link>
            </div>
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
