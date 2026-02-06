import Image from "next/image"
import { TrackedLink } from "../tracked-link"

export default function HeroSection () {
    return (
        <section className="relative flex items-center justify-center min-h-screen px-6 pt-2">
            <div className="absolute w-80 h-80 bg-primary/70 blur-[150px] mix-blend-screen"/>
            <div className="relative z-20 max-w-3xl text-center flex flex-col items-center">
                <Image 
                    src="/hero-detail.svg"
                    alt="detail"
                    width={120}
                    height={120}
                    className="mb-16"
                />
                <h1 className="md:text-6xl text-4xl w-80 md:w-auto font-sans font-extralight tracking-tighter text-white mb-6">
                    Transforme sua história de amor em uma
                    <span className="block text-primary mt-4 font-extrabold bg-primary/10 rounded-xl p-4">
                        Memória Eterna
                    </span>
                </h1>
                <p className="text-lg text-white font-sans font-light w-100 mb-10">
                Uma experiência digital única para guardar memórias, mensagens,
                fotos e emoções.
                </p>
                <TrackedLink
                    href="/create"
                    label="botao-hero"
                    className="pl-8 pr-1 py-1 rounded-2xl flex drop-shadow-[0_5px_0_#FBCDE1]  items-center gap-4 bg-white text-background font-semibold text-lg shadow-lg hover:scale-105 transition-all"
                >
                    Criar página agora
                    
                    <div className="p-4 rounded-xl flex justify-center items-center bg-primary relative">
                        <div className="h-15 w-15 bg-primary absolute -z-1 blur-lg mix-blend-hard-light animate-pulse" />
                        <Image 
                            src="/squares-heart-icon.svg"
                            alt="heart"
                            width={35}
                            height={35}
                        />
                    </div>
                </TrackedLink>
            </div>
            <Image 
                src="/mockup1.png"
                alt="mockup"
                width={400}
                height={400}
                quality={100}
                className="absolute h-auto w-30 left-5 top-150 md:top-80 md:w-60 md:left-40 -rotate-12 z-10 animate-zoom"
            />
            <div className="absolute left-50 w-30 h-30 blur-[100px] mix-blend-lighten bg-primary animate-pulse" />
            <Image 
                src="/mockup2.png"
                alt="mockup"
                width={400}
                height={400}
                quality={100}
                className="absolute h-auto w-30 md:w-80 md:top-80 top-160 right-5 md:right-35 rotate-12 z-10 animate-zoom"
            />
            <div className="absolute top-150 right-40 w-30 h-30 blur-[100px] mix-blend-lighten bg-primary animate-pulse" />
        </section>
    )
}