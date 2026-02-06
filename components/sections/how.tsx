import { TrackedLink } from "../tracked-link";
import Image from "next/image";

export default function HowSection() {
  return (
    <section
      id="how"
      className="py-32 px-6 max-w-6xl mx-auto relative flex flex-col items-center"
    >
      <h2 className="text-4xl font-bold text-center text-primary mb-20">
        Como funciona?
      </h2>
      <div className="grid md:grid-cols-6 gap-12 z-10">
        <div className="md:h-60 md:w-100 h-300 w-40 right-25 bg-primary mix-blend-lighten blur-[150px] rounded-full absolute md:right-90 " />

        {["Personalize", "Pagamento", "Surpreenda"].map((title, i) => (
          <div
            key={title}
            className="relative border-2 border-primary/10 z-10 col-span-2 px-8 py-10 rounded-3xl bg-[#160009] backdrop-blur hover:-translate-y-3 transition-all min-h-100"
          >
            <div className="flex justify-center items-center gap-4">
              <div className="py-3 px-5 bg-primary rounded-full text-white border border-border">
                {i + 1}
              </div>
              <h3 className="text-2xl mt-4 font-semibold text-white mb-4">
                {title}
              </h3>
            </div>
            <div className="">
              {i === 0 && (
                <div>
                  <p className="text-muted text-center mt-4">
                    Insira os dados do casal, mensagens, fotos e detalhes
                    especiais e confira tudo no preview.
                  </p>
                  <Image
                    src="/form.png"
                    alt="result"
                    width={400}
                    height={400}
                    quality={100}
                    className="w-80 absolute right-4 md:right-2"
                  />
                </div>
              )}
              {i === 1 && (
                <div>
                  <p className="text-muted text-center mt-4">
                    Realize o pagamento de forma rápida, simples e fácil.
                  </p>
                  <Image
                    src="/payment.png"
                    alt="result"
                    width={400}
                    height={400}
                    quality={100}
                    className="w-80 absolute right-4 md:right-2"
                  />
                </div>
              )}
              {i === 2 && (
                <div className="flex flex-col">
                  <p className="text-muted text-center mt-4 mb-8">
                    Receba um link e um QR Code exclusivo direto no seu email
                    para compartilhar ou presentear!
                  </p>
                  <Image
                    src="/result.png"
                    alt="result"
                    width={400}
                    height={400}
                    quality={100}
                    className="w-80 absolute top-55 right-4 md:-right-6"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <Image
        src="/big-heart.svg"
        alt="heart"
        width={80}
        height={80}
        className="absolute w-200 md:200 h-auto top-160 right-0 md:top-70 md:right-40 "
      />

      <div className="z-20 w-full text-sm md:w-1/3 mt-60 -mb-40 flex flex-col bg-primary/40 h-50 rounded-xl p-3">
        <div className="text-white h-25 text-center text-xl font-medium flex items-center bg-background/70 rounded-lg p-2 mb-3">
          <span>
            Sua história de amor é única. Sua página também merece ser.
          </span>
        </div>
        <TrackedLink
          href="/create"
          label="botao-howitworks"
          className="pl-5 md:pl-8 pr-1 py-1 rounded-lg flex justify-between  items-center gap-4 bg-white text-background font-semibold text-lg shadow-lg hover:bg-white/70 transition-all"
        >
          <span className="pl-2">Quero a minha página!</span>

          <div className="p-4 rounded-md flex justify-center items-center bg-primary relative">
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
    </section>
  );
}
