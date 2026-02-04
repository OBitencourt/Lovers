import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-40 text-white/80 leading-relaxed">
      <Link 
        href="/"
        className="text-sm text-primary font-medium p-3 underline hover:bg-zinc-800 rounded-lg"
      >
        Voltar
      </Link>
      <h1 className="text-3xl font-bold mb-8 mt-6 text-rose-500">Política de Privacidade</h1>
      <section className="space-y-6">
        <p>Na <strong>Lovers</strong>, a sua privacidade é nossa prioridade. Esta política descreve como coletamos e usamos seus dados.</p>
        <h2 className="text-xl font-semibold">1. Coleta de Dados</h2>
        <p>Coletamos apenas as informações necessárias para criar sua homenagem: nomes, mensagens, fotos, áudios e e-mail para entrega.</p>
        <h2 className="text-xl font-semibold">2. Armazenamento</h2>
        <p>Suas mídias são armazenadas de forma segura no Cloudflare R2 e seus dados no MongoDB Atlas. Rascunhos não pagos são excluídos automaticamente após 24 horas.</p>
        <h2 className="text-xl font-semibold">3. Pagamentos</h2>
        <p>Não armazenamos dados de cartão de crédito. Todas as transações são processadas de forma segura pelo <strong>Stripe</strong>.</p>
      </section>
    </main>
  );
}
