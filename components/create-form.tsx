"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AudioRecorder from "./audio-recorder";
import Image from "next/image";
import calculateTimeTogether from "@/lib/calculate-time";
import { sendGAEvent } from "@next/third-parties/google";
import { CurrencyPrices } from "@/types/prices";
import uploadToR2 from "@/lib/upload-to-r2";
import Preview from "./preview";

// Esquema de validação com Zod
const formSchema = z.object({
  email: z.string().email("Insira um e-mail válido.").min(1, "O e-mail é obrigatório."),
  startDate: z.string().min(1, "A data de início é obrigatória."),
  names: z.string().min(2, "O nome do casal deve ter pelo menos 2 caracteres.").max(50, "Nome muito longo."),
  message: z.string().min(1, "A mensagem principal é obrigatória.").max(200, "Mensagem muito longa (máx 200 caracteres)."),
  story: z.string().max(2000, "A história é muito longa.").optional(),
  youtubeUrl: z.string().url("Insira uma URL válida do YouTube.").or(z.literal("")).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateForm({ initialPrice }: { initialPrice: CurrencyPrices}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const planParam = searchParams.get("plan") ?? "premium";
  const [plan, setPlan] = useState<"basic" | "premium">(planParam === "premium" ? "premium" : "basic");

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: formErrors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      startDate: "",
      names: "",
      message: "",
      story: "",
      youtubeUrl: "",
    }
  });

  // Estados para campos não controlados pelo Hook Form (Imagens e Áudio)
  const [images, setImages] = useState<File[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // Watchers para o Preview
  const watchedValues = watch();

  const imagePreviews = useMemo(() => {
    return images.map((file) => URL.createObjectURL(file));
  }, [images]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleRecordComplete = useCallback((blob: Blob | null) => {
    setAudioBlob(blob);
  }, []);

  useEffect(() => {
    router.replace(`/create?plan=${plan}`);
  }, [plan, router]);

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
    setErrors({});
  }

  function handleImageUpload(files: FileList | null) {
    if (!files) return;
    const maxImages = plan === "premium" ? 5 : 2;
    const selectedFiles = Array.from(files);

    if (selectedFiles.length > maxImages) {
      setErrors((prev) => ({
        ...prev,
        images: plan === "premium"
            ? "O plano premium permite no máximo 5 imagens."
            : "O plano basic permite apenas 2 imagem.",
      }));
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });
    setImages(selectedFiles);
  }

  // Função de submissão principal (chamada pelo handleSubmit do Hook Form)
  const onSubmit = async (data: FormData) => {
    // Validação manual de imagens (já que não estão no Hook Form)
    const imageError = plan === "basic" && images.length !== 1 
      ? "O plano basic exige exatamente 1 imagem." 
      : (plan === "premium" && images.length === 0 ? "Adicione ao menos 1 imagem." : null);

    if (imageError) {
      setErrors(prev => ({ ...prev, images: imageError }));
      return;
    }

    try {
      setLoadingCheckout(true);
      const slug = data.names.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 7);

      let uploadedImages: string[] = [];
      try {
        uploadedImages = await Promise.all(images.map((file) => uploadToR2(file, slug)));
      } catch (err) {
        alert("Erro ao enviar imagens. Verifique sua conexão.");
        setLoadingCheckout(false);
        return;
      }

      let uploadedAudio: string | null = null;
      if (plan === "premium" && audioBlob) {
        try {
          const extension = audioBlob.type.split("/")[1]?.split(";")[0] || "bin";
          const audioFile = new File([audioBlob], `${slug}.${extension}`, { type: audioBlob.type });
          uploadedAudio = await uploadToR2(audioFile, slug);
        } catch (err) {
          alert("Erro ao enviar áudio.");
          setLoadingCheckout(false);
          return;
        }
      }

      const saveRes = await fetch("/api/couples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          plan,
          email: data.email,
          startDate: data.startDate,
          coupleName: data.names,
          message: data.message,
          story: data.story,
          youtubeUrl: data.youtubeUrl,
          images: uploadedImages,
          audioUrl: uploadedAudio,
        }),
      });

      if (!saveRes.ok) throw new Error("Erro ao salvar rascunho no banco de dados");
      sendGAEvent({ event: 'begin_checkout', value: plan === 'premium' ? initialPrice.premium.current : initialPrice.basic.current});

      const stripeRes = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, slug, email: data.email }),
      });

      if (!stripeRes.ok) throw new Error("Erro ao criar checkout");
      const { checkoutUrl } = await stripeRes.json();
      window.location.href = checkoutUrl;

    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
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

        <div className={`py-4 px-6 rounded-2xl text-sm font-bold tracking-wide ${plan === "premium" ? "bg-linear-to-r from-rose-500 to-primary text-white" : "bg-pink-100 text-rose-600"}`}>
          {plan === "premium" ? (
              <div className="flex gap-4 items-center">
                <p>Plano Premium: áudio + até 5 imagens ({ initialPrice.premium.current })</p>
                <Image src="/white-microphone-icon.svg" alt="speaker" width={20} height={20} className="w-5 h-5" /> 
              </div>
            ) : `Plano Basic: 1 imagem em destaque (${ initialPrice.basic.current })` }
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Seu E-mail</label>
            <input
              {...register("email")}
              type="email"
              placeholder="(Para receber o link e QR Code)"
              className="w-full rounded-xl border border-primary placeholder:text-white/70 bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
            {formErrors.email && <p className="text-sm text-rose-400 mt-1">{formErrors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Início do relacionamento</label>
            <input
              {...register("startDate")}
              type="date"
              className="w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
            {formErrors.startDate && <p className="text-sm text-rose-400 mt-1">{formErrors.startDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Nome do casal</label>
            <input
              {...register("names")}
              placeholder="ex: Pedro & Maria"
              className="w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
            {formErrors.names && <p className="text-sm text-rose-400 mt-1">{formErrors.names.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Mensagem principal</label>
            <input
              {...register("message")}
              placeholder="ex: Feliz 1 ano de namoro!"
              className="w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
            {formErrors.message && <p className="text-sm text-rose-400 mt-1">{formErrors.message.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Nossa história (opcional)</label>
            <textarea
              {...register("story")}
              rows={4}
              placeholder="Conte um pouco sobre vocês..."
              className="w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none resize-none"
            />
            {formErrors.story && <p className="text-sm text-rose-400 mt-1">{formErrors.story.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Link de música do YouTube (opcional)</label>
            <input
              {...register("youtubeUrl")}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border border-primary bg-primary/5 px-4 py-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
            {formErrors.youtubeUrl && <p className="text-sm text-rose-400 mt-1">{formErrors.youtubeUrl.message}</p>}
          </div>

          {/* Seção de Imagens (Mantida a lógica original) */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              {plan === "premium" ? "Fotos do casal (até 5)" : "Foto em destaque (1)"}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              multiple={plan === "premium"}
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-primary/40 rounded-2xl text-white/60 hover:text-white hover:border-primary transition-all"
            >
              {images.length > 0 ? `${images.length} imagem(ns) selecionada(s)` : "Clique para selecionar fotos"}
            </button>
            {errors.images && <p className="text-sm text-rose-400 mt-1">{errors.images}</p>}
          </div>

          {/* Seção de Áudio (Mantida a lógica original) */}
          {plan === "premium" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white">Grave um áudio especial (opcional)</label>
              <AudioRecorder audioBlob={audioBlob} onRecordComplete={handleRecordComplete} />
            </div>
          )}

          <button
            type="submit"
            disabled={loadingCheckout}
            className="w-full rounded-xl bg-white text-background py-4 font-semibold text-lg hover:bg-white/80 disabled:opacity-50 disabled:animate-pulse transition"
          >
            {loadingCheckout ? "Processando..." : (
              <div className="flex gap-6 justify-center items-center">
                <p>Continuar para pagamento</p>
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

      {/* Preview Section (Sincronizada com watchedValues) */}
      <section className="hidden md:block sticky top-10 h-fit">
        <Preview 
          names={watchedValues.names || "Seu Nome & Nome Dela"}
          message={watchedValues.message || "Sua mensagem principal aparecerá aqui."}
          startDate={watchedValues.startDate}
          story={watchedValues.story}
          imagePreviews={imagePreviews}
          plan={plan}
          audioBlob={audioBlob ? true : false}
        />
      </section>
    </div>
  );
}
