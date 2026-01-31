import { NextResponse } from "next/server";
import Stripe from "stripe";
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { connectToDB } from "@/lib/db-connect";
import Couple from "@/models/couple";

const stripe = new Stripe(process.env.SECRET_KEY!);

// Configuração do Cliente S3 para o R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
} );

// Função auxiliar para mover arquivos no R2 e atualizar URLs
async function activateCoupleAndMoveFiles(slug: string) {
  await connectToDB();
  const couple = await Couple.findOne({ slug });

  if (couple && !couple.paid) {
    const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

    // 1. Mover Imagens
    const newImages = [];
    for (const oldUrl of couple.images) {
      const oldKey = oldUrl.replace(`${R2_PUBLIC_URL}/`, "");
      const newKey = oldKey.replace("temp/", "");

      try {
        await s3Client.send(new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: `${bucketName}/${oldKey}`,
          Key: newKey,
        }));
        await s3Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: oldKey,
        }));
        newImages.push(`${R2_PUBLIC_URL}/${newKey}`);
      } catch (err) {
        console.error(`Erro ao mover imagem ${oldKey}:`, err);
        newImages.push(oldUrl); // Fallback para manter a URL antiga se falhar
      }
    }

    // 2. Mover Áudio (se existir)
    let newAudioUrl = couple.audioUrl;
    if (couple.audioUrl) {
      const oldKey = couple.audioUrl.replace(`${R2_PUBLIC_URL}/`, "");
      const newKey = oldKey.replace("temp/", "");

      try {
        await s3Client.send(new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: `${bucketName}/${oldKey}`,
          Key: newKey,
        }));
        await s3Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: oldKey,
        }));
        newAudioUrl = `${R2_PUBLIC_URL}/${newKey}`;
      } catch (err) {
        console.error(`Erro ao mover áudio ${oldKey}:`, err);
      }
    }

    // 3. Atualizar MongoDB
    await Couple.updateOne(
      { slug },
      {
        $set: {
          paid: true,
          images: newImages,
          audioUrl: newAudioUrl,
        },
        $unset: { cleanupAt: "" },
      }
    );
    console.log(`Sucesso: Casal ${slug} ativado.`);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const slug = session.metadata?.slug;

  if (!slug) {
    return NextResponse.json({ received: true }); // Ignora se não tiver slug no metadata
  }

  switch (event.type) {
    case "checkout.session.completed":
      // Se o pagamento for imediato (cartão, etc), o status será 'paid'
      if (session.payment_status === "paid") {
        await activateCoupleAndMoveFiles(slug);
      }
      break;

    case "checkout.session.async_payment_succeeded":
      // Para pagamentos assíncronos como Boleto ou Multibanco
      await activateCoupleAndMoveFiles(slug);
      break;

    case "checkout.session.async_payment_failed":
      // Opcional: Lógica para avisar o usuário que o boleto falhou
      console.log(`Pagamento assíncrono falhou para o slug: ${slug}`);
      break;

    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
