import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-40 text-white/80 leading-relaxed text-center">
      <Link 
        href="/"
        className="text-sm text-primary font-medium p-3 underline hover:bg-zinc-800 rounded-lg"
      >
        Voltar
      </Link>
      <h1 className="text-3xl font-bold mb-8 mt-6 text-rose-500">Política de Reembolso</h1>
      <section className="space-y-6 max-w-xl mx-auto">
        <p>Como nossos produtos são digitais e gerados instantaneamente, temos regras específicas para reembolsos:</p>
        <div className="bg-zinc-900 p-6 rounded-2xl text-left border border-zinc-700">
          <h2 className="text-lg font-semibold mb-2">Arrependimento</h2>
          <p className="text-sm">Devido à natureza do serviço (entrega imediata de bem digital personalizado), o direito de arrependimento não se aplica após a ativação da página.</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl text-left border border-zinc-700">
          <h2 className="text-lg font-semibold mb-2">Falhas Técnicas</h2>
          <p className="text-sm">Caso ocorra um erro técnico que impeça a visualização da página, e nossa equipe não consiga resolver em até 7 dias, o reembolso total será efetuado.</p>
        </div>
        <p className="text-sm text-primary mt-8">Dúvidas? Entre em contato: <strong>loverssupport@gmail.com</strong></p>
      </section>
    </main>
  );
}
