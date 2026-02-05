import Image from "next/image";
import Link from "next/link";
import { TrackedLink } from "./tracked-link";

export default function Header () {

    return (
        <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/95">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image 
                        src="/logo_lovers.svg"
                        alt="logo-lovers"
                        width={80}
                        height={80}
                        className="w-12"
                    />
                    <span className="text-3xl mt-3 tracking-tighter font-harmattan font-extrabold text-primary">Lovers</span>
                </Link>


                <nav className="gap-8 flex text-sm font-medium items-center">
                    <Link href="/#how" className="hidden md:flex hover:text-primary font-sans text-black transition">
                        Como funciona?
                    </Link>
                    <Link href="/#prices" className="hidden md:flex hover:text-primary font-sans text-black transition">
                        Preços
                    </Link>
                    <Link href="/#faq" className="hidden md:flex hover:text-primary font-sans text-black transition">
                        FAQ
                    </Link>
                    <TrackedLink label="botao-header" href="/create?plan=premium" className="transition py-3 px-5 text-white drop-shadow-[0_5px_0_var(--color-background)]  rounded-2xl bg-primary flex items-center gap-2 color-white font-sans font-extrabold tracking-wide active:drop-shadow-[0_0_0_var(--color-background)] active:translate-y-1">
                        Criar página
                        
                        <Image 
                            src="/white-heart-icon.svg"
                            alt="white-heart"
                            width={20}
                            height={20}
                            className="w-6 h-6"
                        />
                    </TrackedLink>
                </nav>
            </div>
        </header>
    )
}