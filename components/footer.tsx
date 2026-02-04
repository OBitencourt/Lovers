import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-primary/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-extrabold text-rose-500 tracking-tight">
              Lovers<span className="text-pink-400">.</span>
            </Link>
            <p className="mt-4 text-zinc-200 text-sm leading-relaxed">
              Eternizando momentos e criando homenagens únicas para quem você mais ama.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-4">Produto</h4>
            <ul className="space-y-2">
              <li><Link href="/create" className="text-zinc-200 hover:text-rose-500 text-sm transition-colors">Criar Homenagem</Link></li>
              <li><Link href="/#precos" className="text-zinc-200 hover:text-rose-500 text-sm transition-colors">Preçário</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/termos" className="text-zinc-200 hover:text-rose-500 text-sm transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-zinc-200 hover:text-rose-500 text-sm transition-colors">Privacidade</Link></li>
              <li><Link href="/reembolso" className="text-zinc-200 hover:text-rose-500 text-sm transition-colors">Reembolso</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-4">Suporte</h4>
            <p className="text-zinc-200 mb-4 text-sm transition-colors">Precisando de ajuda? Contacte-nos.</p>
            <a href="mailto:suporte@seusite.com" className="text-rose-500 font-medium text-sm hover:underline">
              loverssupport@gmail.com
            </a>
          </div>
        </div>
        <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-300 text-xs">&copy; {currentYear} Lovers. Todos os direitos reservados.</p>
            <div className="flex items-center gap-1 text-zinc-300 text-xs">
                Feito com <span className="text-rose-400">❤️</span> para casais apaixonados.
            </div>
        </div>
      </div>
    </footer>
  );
}
