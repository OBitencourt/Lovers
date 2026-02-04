import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-40 text-white/80 leading-relaxed">
      <Link 
        href="/"
        className="text-sm text-primary font-medium p-3 underline hover:bg-zinc-800 rounded-lg"
      >
        Voltar
      </Link>
      <h1 className="text-3xl font-bold mb-8 mt-6 text-rose-500">Termos de Uso</h1>
      <section className="space-y-6">
        <p>Ao utilizar a Lovers, você concorda com os seguintes termos:</p>
        <h2 className="text-xl font-semibold">1. Uso do Serviço</h2>
        <p>O serviço destina-se à criação de homenagens pessoais. É proibido o upload de conteúdo ofensivo, ilegal ou que viole direitos autorais.</p>
        <h2 className="text-xl font-semibold">2. Disponibilidade</h2>
        <p>Homenagens do plano Basic ficam disponíveis por 6 meses. O plano Premium oferece disponibilidade vitalícia (enquanto o serviço estiver ativo).</p>
        <h2 className="text-xl font-semibold">3. Responsabilidade</h2>
        <p>A Lovers não se responsabiliza pelo conteúdo inserido pelos usuários nas páginas geradas.</p>
      </section>
    </main>
  );
}
