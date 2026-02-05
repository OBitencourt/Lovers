"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AudioRecorder from "./audio-recorder";
import Image from "next/image";
import calculateTimeTogether from "@/lib/calculate-time";
import { sendGAEvent } from "@next/third-parties/google";

// Função de Upload para o R2 (Pasta Temp)
async function uploadToR2(file: File, slug: string) {
  try {
    const res = await fetch("/api/presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        slug,
      }),
    });

    if (!res.ok) throw new Error("Erro ao obter URL de upload");
    const { uploadUrl, key } = await res.json();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadRes.ok) throw new Error("Erro no upload para o R2");

    const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    return `${R2_PUBLIC_URL}/${key}`;
  } catch (err) {
    console.error("Upload falhou:", err);
    throw err;
  }
}

export default function CreateForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);


  const planParam = searchParams.get("plan") ?? "premium";
  const [plan, setPlan] = useState<"basic" | "premium">(planParam === "premium" ? "premium" : "basic");

  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");

  const [names, setNames] = useState("");
  const [message, setMessage] = useState("");
  const [story, setStory] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [currentImage, setCurrentImage] = useState(0);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* Sincroniza plano com URL */
  useEffect(() => {
    router.replace(`/create?plan=${plan}`);
  }, [plan, router]);

  /* Carousel de imagens */
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  function switchPlan(nextPlan: "basic" | "premium") {
    setPlan(nextPlan);
    setImages([]);
    setAudioBlob(null);
  }

  function handleImageUpload(files: FileList | null) {
    if (!files) return;
    const maxImages = plan === "premium" ? 3 : 1;

    //const selected = Array.from(files).slice(0, maxImages);
    const selectedFiles = Array.from(files);

    if (selectedFiles.length > maxImages) {
      setErrors((prev) => ({
        ...prev,
        images:
          plan === "premium"
            ? "O plano premium permite no máximo 3 imagens."
            : "O plano basic permite apenas 1 imagem.",
      }));

      // 🔥 ZERA o estado para evitar inconsistência
      setImages([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      return;
    }

    clearError("images");
    setImages(selectedFiles)
  }

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }


  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "Informe seu e-mail.";
    if (!startDate) newErrors.startDate = "Informe a data de início.";
    if (!names) newErrors.names = "Informe o nome do casal.";
    if (!message) newErrors.message = "A mensagem principal é obrigatória.";

    if (plan === "basic" && images.length !== 1) {
      newErrors.images = "O plano basic exige exatamente 1 imagem.";
    }

    if (plan === "premium" && images.length === 0) {
      newErrors.images = "Adicione ao menos 1 imagem.";
    }

    if (plan === "premium" && images.length > 3) {
      newErrors.images = "O plano premium permite no máximo 3 imagens.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCheckout() {
    if (!validateForm()) return;

    try {
      setLoadingCheckout(true);

      // 1. Gera slug único
      const slug = names.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 7);

      // 2. Upload das imagens para R2 (Pasta Temp)
      let uploadedImages: string[] = [];
      try {
        uploadedImages = await Promise.all(images.map((file) => uploadToR2(file, slug)));
      } catch (err) {
        alert("Erro ao enviar imagens. Verifique sua conexão.");
        setLoadingCheckout(false);
        return;
      }

      // 3. Upload do áudio (se for premium e houver áudio)
      let uploadedAudio: string | null = null;
      if (plan === "premium" && audioBlob) {
        try {
          const audioFile = new File([audioBlob], `${slug}.webm`, { type: audioBlob.type || "audio/webm" });
          uploadedAudio = await uploadToR2(audioFile, slug);
        } catch (err) {
          alert("Erro ao enviar áudio.");
          setLoadingCheckout(false);
          return;
        }
      }

      // 4. Salva no MongoDB (Status: paid = false)
      const saveRes = await fetch("/api/couples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          plan,
          email,
          startDate,
          coupleName: names,
          message,
          story,
          youtubeUrl,
          images: uploadedImages,
          audioUrl: uploadedAudio,
        }),
      });

      if (!saveRes.ok) throw new Error("Erro ao salvar rascunho no banco de dados");
      sendGAEvent({ event: 'begin_checkout', value: plan === 'premium' ? 7.99 : 4.99})
      // 5. Cria sessão no Stripe
      const stripeRes = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, slug, email }),
      });

      if (!stripeRes.ok) throw new Error("Erro ao criar checkout");

      const { checkoutUrl } = await stripeRes.json();

      // 6. Redireciona para o Stripe
      window.location.href = checkoutUrl;

    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoadingCheckout(false);
    }
  }

  const imagePreviews = images.map((file) => URL.createObjectURL(file));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      {/* Form */}
      <section className="bg-[#160009] border-2 border-border/20 backdrop-blur rounded-3xl p-5 py-8 md:p-10 shadow-xl space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Plano selecionado</h2>
          <button
            type="button"
            onClick={() => switchPlan(plan === "basic" ? "premium" : "basic")}
            className="text-sm font-semibold text-white/50 hover:underline"
          >
            {plan === "basic" ? "Trocar para Premium >" : "Trocar para Basic >"}
          </button>
        </div>

        <div
          className={`py-4 px-6 rounded-2xl text-sm font-bold tracking-wide ${
            plan === "premium"
              ? "bg-linear-to-r from-rose-500 to-primary text-white"
              : "bg-pink-100 text-rose-600"
          }`}
        >
          {plan === "premium" ? (
              <div className="flex gap-4 items-center">
                <p>
                  Plano Premium: áudio + até 3 imagens (7,99€)
                </p>
                <Image 
                  src="/white-microphone-icon.svg"
                  alt="speaker"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                /> 
              </div>
            )
            : "Plano Basic: 1 imagem em destaque (4,99€)" }
        </div>

        <form className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-white mb-2">Seu E-mail</label>
            <input
              type="email"
              required
              placeholder="(Para receber o link e QR Code)"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearError("email");
              }}
              className="w-full rounded-xl border border-primary placeholder:text-white/70 bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
            {errors.email && (
              <p className="text-sm text-rose-400 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Campo: Data de Início */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Início do relacionamento</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                clearError("startDate");
              }}
              className="w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
            {errors.startDate && (
              <p className="text-sm text-rose-400 mt-1">
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Nome do casal</label>
            <input
              required
              value={names}
              placeholder="ex: Pedro & Maria"
              onChange={(e) => {
                setNames(e.target.value)
                clearError("names");
              }}
              className="w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
            {errors.names && (
              <p className="text-sm text-rose-400 mt-1">{errors.names}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Mensagem principal</label>
            <input
              required
              value={message}
              placeholder="ex: Nossa história é feita de pequenos momentos que viraram eternos."
              onChange={(e) => {
                setMessage(e.target.value)
                clearError("message");
              }}
              className="w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
            {errors.message && (
              <p className="text-sm text-rose-400 mt-1">
                {errors.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">História (opcional)</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Música de fundo (YouTube) (opcional) </label>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {plan === "premium" ? "Imagens do casal (até 3 )" : "Imagem do casal (1)"}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              multiple={plan === "premium"}
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="bg-primary p-3 w-full rounded-xl"
            />
            {errors.images && (
              <p className="text-sm text-rose-400 mt-1">
                {errors.images}
              </p>
            )}
          </div>

          {plan === "premium" && (
            <AudioRecorder
              audioBlob={audioBlob}
              onRecordComplete={setAudioBlob}
            />
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loadingCheckout}
            className="w-full rounded-xl bg-white text-background py-4 font-semibold text-lg hover:bg-white/80 disabled:opacity-50 disabled:animate-pulse transition"
          >
            {loadingCheckout ? (
              "Processando..."
            ) : (
              <div className="flex gap-6 justify-center items-center">
                <p>
                  Continuar para pagamento
                </p>
                <Image 
                  src="/pink-squares-heart-icon.svg"
                  alt="heart"
                  width={30}
                  height={30}
                />
              </div>
            )}
          </button>
        </form>
      </section>

      {/* Preview */}
      <section className="relative">
        <div className="sticky top-24 rounded-3xl overflow-hidden shadow-2xl bg-background border-border/20 border-2">
          <div className=" absolute top-6 right-6 px-5 py-2 bg-zinc-900/50 border border-zinc-700 rounded-full">Preview</div>
          <div className="p-4 py-10 md:px-10 md:py-10 text-white min-h-120 flex flex-col justify-center items-center">
            <div className="flex items-center gap-1 mb-6">
              <Image 
                src="/logo_lovers.svg"
                alt="logo-lovers"
                width={50}
                height={50}
              />
              <span className="text-4xl tracking-tighter mt-3 font-harmattan font-extrabold text-primary">Lovers</span>
            </div>

            <div
              className=" bg-[#3B252F] px-5 py-2 rounded-lg text-primary font-semibold mb-4 z-10"
            >
              <div className="flex gap-4 flex-row-reverse">
                <Image 
                  src="/music-icon.svg"
                  alt="pause-icon"
                  width={15}
                  height={15}
                />
                <span>Tocar Música</span>
                </div>
            </div>

            <div className="w-2/3 bg-[#3B252F] px-2 rounded-xl flex justify-center items-center mb-6 z-10">

              {imagePreviews.length > 0 && (
                <div className="relative w-full h-80 overflow-hidden">
                  {imagePreviews.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      className={`absolute inset-0 w-80 h-80 mx-auto object-cover transition-opacity duration-1000 ${
                        index === currentImage ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <Image 
              src="/big-heart-totheright.png"
              alt="heart"
              width={300}
              quality={100}
              height={100}
              className="absolute h-auto md:-left-20 -left-40"
            />
            <Image 
              src="/big-heart-totheleft.png"
              alt="heart"
              width={300}
              quality={100}
              height={100}
              className="absolute h-auto md:-right-20 -right-40"
            />

            <div className="w-50 h-50 bg-primary blur-[90px] -z-10 mix-blend-lighten absolute" />

            <h2 className="text-4xl text-center text-primary font-extrabold mb-4">{names}</h2>
            <p className="text-lg opacity-95 mb-4 text-center">{message}</p>

            <div className="flex mb-6 p-2 rounded-xl w-full text-white font-sans justify-center items-center z-10 bg-[#3B252F]">
              Juntos fazem : <span className="text-[#FBCDE1] ml-2">{calculateTimeTogether(startDate)}</span>
              <Image 
                src="/tiny-rose-heart.svg"
                alt="tiny-heart"
                width={20}
                height={20}
                className="ml-2"
              />
            </div>

            {story && <p className="text-sm opacity-90 text-center">{story}</p>}
            {plan === "premium" && audioBlob && (
              <div className="mt-4 text-sm font-semibold">🎙️ Áudio incluído</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
