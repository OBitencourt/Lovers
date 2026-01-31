"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AudioRecorder from "./audio-recorder";

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

  const planParam = searchParams.get("plan") ?? "basic";
  const [plan, setPlan] = useState<"basic" | "premium">(planParam === "premium" ? "premium" : "basic");

  const [names, setNames] = useState("Sucesso & Arthur");
  const [message, setMessage] = useState("Nossa história é feita de pequenos momentos que viraram eternos.");
  const [story, setStory] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [currentImage, setCurrentImage] = useState(0);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

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
    const selected = Array.from(files).slice(0, maxImages);
    setImages(selected);
  }

  async function handleCheckout() {
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
          coupleName: names,
          message,
          story,
          youtubeUrl,
          images: uploadedImages,
          audioUrl: uploadedAudio,
        }),
      });

      if (!saveRes.ok) throw new Error("Erro ao salvar rascunho no banco de dados");

      // 5. Cria sessão no Stripe
      const stripeRes = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, slug }),
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
    <div className="grid lg:grid-cols-2 gap-16">
      {/* Form */}
      <section className="bg-white/70 backdrop-blur rounded-3xl p-10 shadow-xl space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-rose-600">Plano selecionado</h2>
          <button
            type="button"
            onClick={() => switchPlan(plan === "basic" ? "premium" : "basic")}
            className="text-sm font-semibold text-pink-500 hover:underline"
          >
            {plan === "basic" ? "Trocar para Premium" : "Trocar para Basic"}
          </button>
        </div>

        <div
          className={`p-4 rounded-2xl text-sm font-medium ${
            plan === "premium"
              ? "bg-linear-to-r from-rose-500 to-pink-500 text-white"
              : "bg-pink-100 text-rose-600"
          }`}
        >
          {plan === "premium"
            ? "🎙️ Plano Premium: áudio + até 3 imagens"
            : "Plano Basic: 1 imagem em destaque"}
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-rose-700 mb-2">Nome do casal</label>
            <input
              required
              value={names}
              onChange={(e) => setNames(e.target.value)}
              className="w-full rounded-xl border border-pink-200 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rose-700 mb-2">Mensagem principal</label>
            <input
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-pink-200 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rose-700 mb-2">História (opcional)</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-pink-200 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rose-700 mb-2">Música de fundo (YouTube)</label>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full rounded-xl border border-pink-200 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rose-700 mb-2">
              {plan === "premium" ? "Imagens do casal (até 3 )" : "Imagem do casal (1)"}
            </label>
            <input
              type="file"
              multiple={plan === "premium"}
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
            />
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
            className="w-full rounded-full bg-rose-500 text-white py-4 font-semibold text-lg hover:bg-rose-600 disabled:opacity-50 transition"
          >
            {loadingCheckout ? "Processando..." : "Continuar para pagamento"}
          </button>
        </form>
      </section>

      {/* Preview */}
      <section className="relative">
        <div className="sticky top-24 rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br from-rose-400 via-pink-400 to-rose-500">
          <div className="p-10 text-white min-h-120 flex flex-col justify-center items-center">
            {imagePreviews.length > 0 && (
              <div className="relative w-full h-64 mb-6 rounded-3xl overflow-hidden">
                {imagePreviews.map((src, index) => (
                  <img
                    key={src}
                    src={src}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentImage ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>
            )}
            <h2 className="text-4xl font-extrabold mb-4">{names}</h2>
            <p className="text-lg opacity-95 mb-4">{message}</p>
            {story && <p className="text-sm opacity-90">{story}</p>}
            {plan === "premium" && audioBlob && (
              <div className="mt-4 text-sm font-semibold">🎙️ Áudio incluído</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
