"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: "Quanto tempo leva para o meu site ficar pronto?",
    answer: "O seu site é gerado instantaneamente! Assim que o pagamento é confirmado pelo Stripe (o que geralmente leva alguns segundos), o link da sua homenagem é ativado automaticamente."
  },
  {
    question: "Por quanto tempo a homenagem ficará disponível?",
    answer: "Depende do plano escolhido. No plano Basic, a homenagem fica disponível por 6 meses. No plano Premium, ela fica ativa para SEMPRE!"
  },
  {
    question: "Posso alterar as fotos ou a mensagem depois de pagar?",
    answer: "Atualmente, para garantir a integridade da homenagem, os dados são fixos após o pagamento. Recomendamos revisar tudo no 'Preview' antes de finalizar o checkout."
  },
  {
    question: "Quais são as formas de pagamento aceitas?",
    answer: "Aceitamos Cartão de Crédito, MB WAY e Multibanco através da segurança do Stripe. O processamento é imediato e 100% seguro."
  },
  {
    question: "O site é privado? Quem pode ver?",
    answer: "O site é acessível apenas através do link exclusivo (slug) que você criou. Ele não é indexado pelo Google, então apenas quem tiver o link poderá visualizar a homenagem."
  },
  {
    question: "Como funciona a música de fundo do YouTube?",
    answer: "Basta colar o link de qualquer vídeo do YouTube. Na página da homenagem, haverá um botão para o seu parceiro(a) dar o play e curtir a trilha sonora enquanto lê a sua linda mensagem."
  },
  {
    question: "Como faço para ter meu QR Code?",
    answer: "O QR Code e o link da sua homenagem são automaticamente enviados para o email que você inseriu no formulário!"
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-rose-600 text-center mb-10">
        Dúvidas Frequentes
      </h2>
      
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div 
            key={index} 
            className="border border-pink-100 rounded-2xl overflow-hidden bg-white shadow-sm"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-pink-50 transition-colors"
            >
              <span className="font-semibold text-primary">{item.question}</span>
              <span className={`text-rose-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-5 pt-4 text-gray-600 leading-relaxed border-t border-pink-50">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
