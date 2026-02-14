import { headers } from "next/headers";
import { TrackedLink } from "../tracked-link";
import Image from "next/image";
import { PricesByCurrency } from "@/types/prices";
import resolveCurrency from "@/lib/resolve-currency";

const PRICES: PricesByCurrency = {
  EUR: {
    basic: { current: "3,99€" },
    premium: { old: "9,99€", current: "5,99€" },
  },
  BRL: {
    basic: { current: "14,99 R$" },
    premium: { current: "29,99 R$" },
  },
  USD: {
    basic: { current: "$4.49" },
    premium: { current: "$6.99" },
  },
};

export default async function PricesSection() {
    const resolvedHeaders = await headers()

    const country = resolvedHeaders.get("x-vercel-ip-country") ?? "PT";
    const currency = resolveCurrency(country)
        
    const prices = PRICES[currency];

    return (
    <section id="prices" className="py-32 px-6 z-20">
      <div className="max-w-5xl mx-auto z-10">
        <h2 className="text-4xl font-bold text-center text-primary mb-6 z-10">
          Planos
        </h2>
        <p className="text-center text-white/70 mb-20 max-w-2xl mx-auto">
          Dois planos simples. Uma experiência inesquecível para quem você ama.
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

            <p className="text-start text-white/70 text-medium mb-5">
              O que está incluído:
            </p>

            <ul className="space-y-4 text-primary mb-10">
              <li className="flex items center font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                Página personalizada do casal
              </li>
              <li className="flex items center font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                Mensagem especial
              </li>
              <li className="flex items center font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                Upload de 2 imagens
              </li>
              <li className="flex items cente font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                Música de fundo (YouTube)
              </li>
              <li className="flex items center font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                Link válido por 6 meses
              </li>
              <li className="flex items center font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                Preview para você conferir tudo!
              </li>
            </ul>

            <span className="text-white/70 font-bold text-center mb-6 tracking-tight text-4xl">
              {prices.basic.current} {/* 4,99€ */}
            </span>

            <TrackedLink
              href="/create?plan=basic"
              label="botao-prices-basic"
              className="flex gap-4 items-center justify-center w-full rounded-xl text-primary py-4 font-semibold border border-primary hover:bg-primary/20 transition"
            >
              Criar Página Basic
              <Image
                src="/pink-squares-heart-icon.svg"
                alt="heart-pink"
                width={20}
                height={20}
              />
            </TrackedLink>
          </div>

          {/* Premium */}
          <div className="relative hover:-translate-y-2 mt-6 md:mt-0 transition col-span-3 p-10 rounded-3xl bg-[#160009] border-4 border-primary text-white shadow-2xl scale-[1.03] z-10 flex flex-col">
            <div className="bg-primary gap-2 text-white flex items-center justify-center py-2 px-3 rounded-t-2xl absolute -top-10 right-23 md:right-40">
              <Image
                src="/white-shine-icon.svg"
                alt="shine"
                width={15}
                height={15}
              />
              Mais Escolhido
            </div>
            <span className="absolute top-6 right-6 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
              Limitado
            </span>

            <h3 className="text-3xl font-semibold mb-6 text-center">Premium</h3>

            <p className="text-start text-white/70 text-medium mb-5">
              O que está incluído:
            </p>

            <ul className="space-y-4 text-primary mb-10">
              <li className="flex items center font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                <div className="flex gap-1">
                  <span className="font-black text-white/80">TUDO</span>do plano
                  básico
                </div>
              </li>
              <li className="flex items center font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                <div className="flex gap-1">
                  Áudio{" "}
                  <span className="font-black text-white/80">
                    PERSONALIZADO
                  </span>
                </div>
              </li>
              <li className="flex items center font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                <div className="flex gap-1">
                  Upload de{" "}
                  <span className="font-black text-white/80">5 IMAGENS</span>
                </div>
              </li>
              <li className="flex items center font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                Impacto emocional máximo
              </li>
              <li className="flex items center font-semibold gap-3">
                <Image
                  src="/check-icon.svg"
                  alt="check"
                  width={12}
                  height={12}
                />
                <div className="flex gap-1">
                  Link válido para{" "}
                  <span className="font-black text-white/80">SEMPRE</span>
                </div>
              </li>
            </ul>

            <div className="flex flex-col items-center mb-6">
              {prices.premium.old && (
                <span className="text-white/40 text-lg font-bold line-through">
                    {prices.premium.old}
                </span>
            )}
              {/* <span className="text-white/40 text-lg font-bold line-through">
                * 10,99€ 
              </span> */}

              <span className="text-white font-black tracking-tight text-4xl">
                {prices.premium.current} {/* 7,99€ */}
              </span>
            </div>

            <TrackedLink
              href="/create?plan=premium"
              label="botao-prices-premium"
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
            </TrackedLink>
          </div>
          <div className="top-280 -right-8 w-120 h-20 bg-primary rounded-full mix-blend-lighten absolute md:top-130 md:right-2 blur-2xl z-0 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
