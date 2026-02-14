import CreateForm from "@/components/create-form";
import Header from "@/components/header";
import resolveCurrency from "@/lib/resolve-currency";
import { PricesByCurrency } from "@/types/prices";
import { headers } from "next/headers";
import { Suspense } from "react";

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

export default async function Create () {
    const resolvedHeaders = await headers()
    
    const country = resolvedHeaders.get("x-vercel-ip-country") ?? "PT";
    const currency = resolveCurrency(country)
        
    const prices = PRICES[currency];

    return (
        <main className="min-h-screen px-2 bg-background md:px-6 py-24">
            <Header />
            
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-extrabold text-primary my-16 text-center">
                    Crie sua página Lovers
                </h1>

                <Suspense fallback={<div>Carregando formulário...</div>}>
                    <CreateForm initialPrice={prices} />
                </Suspense>
            </div>
        </main>
    )
}