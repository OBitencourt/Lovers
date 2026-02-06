import { NextResponse } from "next/server";
import Stripe from "stripe";
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { connectToDB } from "@/lib/db-connect";
import Couple from "@/models/couple";
import { Resend } from "resend";

const stripe = new Stripe(process.env.SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
} );

async function activateCoupleAndMoveFiles(slug: string, userEmail?: string) {
  console.log(`Iniciando ativação para o slug: ${slug}`);
  await connectToDB();
  const couple = await Couple.findOne({ slug });

  if (!couple) {
    console.error(`Casal não encontrado para o slug: ${slug}`);
    return;
  }

  if (couple.paid) {
    console.log(`Casal ${slug} já está marcado como pago.`);
    return;
  }

  const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

  // 1. Mover Imagens do Temp para Raiz
  const newImages = [];
  for (const oldUrl of couple.images) {
    if (oldUrl.includes("/temp/")) {
      const oldKey = oldUrl.replace(`${R2_PUBLIC_URL}/`, "");
      const newKey = oldKey.replace("temp/", "");
      try {
        await s3Client.send(new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: `${bucketName}/${oldKey}`,
          Key: newKey,
        }));
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey }));
        newImages.push(`${R2_PUBLIC_URL}/${newKey}`);
      } catch (err) {
        console.error(`Erro ao mover imagem ${oldKey}:`, err);
        newImages.push(oldUrl);
      }
    } else {
      newImages.push(oldUrl);
    }
  }

  // 2. Mover Áudio do Temp para Raiz
  let newAudioUrl = couple.audioUrl;
  if (couple.audioUrl && couple.audioUrl.includes("/temp/")) {
    const oldKey = couple.audioUrl.replace(`${R2_PUBLIC_URL}/`, "");
    const newKey = oldKey.replace("temp/", "");
    try {
      await s3Client.send(new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${oldKey}`,
        Key: newKey,
      }));
      await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey }));
      newAudioUrl = `${R2_PUBLIC_URL}/${newKey}`;
    } catch (err) {
      console.error(`Erro ao mover áudio:`, err);
    }
  }

  // 3. Atualizar MongoDB (paid: true, novas URLs e remove cleanupAt)
  await Couple.updateOne(
    { slug },
    { 
      $set: { paid: true, images: newImages, audioUrl: newAudioUrl },
      $unset: { cleanupAt: "" } 
    }
  );

  // 4. Enviar E-mail com QR Code via Resend
  const targetEmail = userEmail || couple.email;
  if (targetEmail) {
    const coupleUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/couple/${slug}`;
    const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(coupleUrl )}&size=300&margin=2`;

    try {
      await resend.emails.send({
        from: "withlove@lovers.pt",
        to: targetEmail,
        subject: `Sua homenagem para ${couple.coupleName} está pronta! ❤️`,
        replyTo: "loversapp.help@gmail.com", // Redireciona resposta para o meu email de suporte
        html: `
          <div style="font-family: sans-serif; text-align: center; color: #e11d48; padding: 20px;">
            <h1>Sua homenagem está no ar!</h1>
            <p>O pagamento foi confirmado e o site do casal já pode ser acessado.</p>
            <div style="margin: 30px 0;">
              <a href="${coupleUrl}" style="background-color: #e11d48; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;">
                Acessar Página do Casal
              </a>
            </div>
            <p>Acesse ou imprima o QR Code abaixo:</p>
            <img src="${qrCodeUrl}" width="250" height="250" style="border: 10px solid #fff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
            <p style="margin-top: 20px; color: #666; font-size: 14px;">Link direto: <a href="${coupleUrl}">${coupleUrl}</a></p>
          </div>
        `,
      });
      console.log(`E-mail enviado com sucesso para ${targetEmail}`);
    } catch (emailErr) {
      console.error("Erro ao enviar e-mail:", emailErr);
    }
  }

  console.log(`Casal ${slug} ativado com sucesso!`);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const slug = session.metadata?.slug;
  const email = session.metadata?.email;

  if (!slug) return NextResponse.json({ received: true });

  switch (event.type) {
    case "checkout.session.completed":
      if (session.payment_status === "paid") {
        await activateCoupleAndMoveFiles(slug, email);
      }
      break;
    case "checkout.session.async_payment_succeeded":
      await activateCoupleAndMoveFiles(slug, email);
      break;
    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
