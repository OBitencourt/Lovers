import Link from "next/link";

export default function Header () {

    return (
        <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-pink-100/70 border-b border-pink-200">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <span className="text-2xl font-bold text-rose-500">Lovers</span>
                <nav className="hidden md:flex gap-8 text-sm font-medium">
                    <Link href="/#how" className="hover:text-rose-500 transition">
                        Como funciona
                    </Link>
                    <Link href="/#funcionalidades" className="hover:text-rose-500 transition">
                        Funcionalidades
                    </Link>
                    <Link href="/#cta" className="hover:text-rose-500 transition">
                        Criar Página
                    </Link>
                </nav>
            </div>
        </header>
    )
}