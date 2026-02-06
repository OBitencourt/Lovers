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
  console.log(`[activateCoupleAndMoveFiles] Iniciando ativação para o slug: ${slug} com email: ${userEmail}`);
  await connectToDB();
  const couple = await Couple.findOne({ slug });

  if (!couple) {
    console.error(`[activateCoupleAndMoveFiles] Casal não encontrado para o slug: ${slug}`);
    return;
  }

  if (couple.paid) {
    console.log(`[activateCoupleAndMoveFiles] Casal ${slug} já está marcado como pago. Ignorando ativação.`);
    return;
  }

  console.log(`[activateCoupleAndMoveFiles] Casal ${slug} encontrado e não pago. Prosseguindo com a ativação.`);

  const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

  // 1. Mover Imagens do Temp para Raiz
  const newImages = [];
  console.log(`[activateCoupleAndMoveFiles] Iniciando movimentação de imagens para ${slug}. Imagens atuais: ${couple.images.length}`);
  for (const oldUrl of couple.images) {
    if (oldUrl.includes("/temp/")) {
      const oldKey = oldUrl.replace(`${R2_PUBLIC_URL}/`, "");
      const newKey = oldKey.replace("temp/", "");
      try {
        console.log(`[activateCoupleAndMoveFiles] Movendo imagem de ${oldKey} para ${newKey}`);
        await s3Client.send(new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: `${bucketName}/${oldKey}`,
          Key: newKey,
        }));
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey }));
        newImages.push(`${R2_PUBLIC_URL}/${newKey}`);
        console.log(`[activateCoupleAndMoveFiles] Imagem ${newKey} movida com sucesso.`);
      } catch (err) {
        console.error(`[activateCoupleAndMoveFiles] Erro ao mover imagem ${oldKey}:`, err);
        newImages.push(oldUrl); // Manter a URL antiga em caso de erro
      }
    } else {
      newImages.push(oldUrl);
    }
  }
  console.log(`[activateCoupleAndMoveFiles] Movimentação de imagens concluída para ${slug}.`);

  // 2. Mover Áudio do Temp para Raiz
  let newAudioUrl = couple.audioUrl;
  if (couple.audioUrl && couple.audioUrl.includes("/temp/")) {
    const oldKey = couple.audioUrl.replace(`${R2_PUBLIC_URL}/`, "");
    const newKey = oldKey.replace("temp/", "");
    try {
      console.log(`[activateCoupleAndMoveFiles] Movendo áudio de ${oldKey} para ${newKey}`);
      await s3Client.send(new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${oldKey}`,
        Key: newKey,
      }));
      await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey }));
      newAudioUrl = `${R2_PUBLIC_URL}/${newKey}`;
      console.log(`[activateCoupleAndMoveFiles] Áudio ${newKey} movido com sucesso.`);
    } catch (err) {
      console.error(`[activateCoupleAndMoveFiles] Erro ao mover áudio:`, err);
    }
  }
  console.log(`[activateCoupleAndMoveFiles] Movimentação de áudio concluída para ${slug}.`);

  // 3. Atualizar MongoDB (paid: true, novas URLs e remove cleanupAt)
  try {
    await Couple.updateOne(
      { slug },
      { 
        $set: { paid: true, images: newImages, audioUrl: newAudioUrl },
        $unset: { cleanupAt: "" } 
      }
    );
    console.log(`[activateCoupleAndMoveFiles] MongoDB atualizado para o casal ${slug}.`);
  } catch (dbErr) {
    console.error(`[activateCoupleAndMoveFiles] Erro ao atualizar MongoDB para o casal ${slug}:`, dbErr);
  }

  // 4. Enviar E-mail com QR Code via Resend
  const targetEmail = userEmail || couple.email;
  if (targetEmail) {
    const coupleUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/couple/${slug}`;
    const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(coupleUrl )}&size=300&margin=2`;

    try {
      console.log(`[activateCoupleAndMoveFiles] Tentando enviar e-mail para ${targetEmail} para o casal ${slug}.`);
      await resend.emails.send({
        from: "withlove@lovers.pt",
        to: targetEmail,
        subject: `Sua homenagem para ${couple.coupleName} está pronta! ❤️`,
        replyTo: "loversapp.help@gmail.com",
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
      console.log(`[activateCoupleAndMoveFiles] E-mail enviado com sucesso para ${targetEmail} para o casal ${slug}.`);
    } catch (emailErr) {
      console.error(`[activateCoupleAndMoveFiles] Erro ao enviar e-mail para ${targetEmail} para o casal ${slug}:`, emailErr);
    }
  } else {
    console.warn(`[activateCoupleAndMoveFiles] Nenhum e-mail de destino encontrado para o casal ${slug}.`);
  }

  console.log(`[activateCoupleAndMoveFiles] Casal ${slug} ativado com sucesso!`);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log(`[Webhook] Evento Stripe recebido: ${event.type}`);
  } catch (err: any) {
    console.error(`[Webhook] Erro na construção do Webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  let slug = session.metadata?.slug;
  let email = session.metadata?.email;

  // Tentar obter metadados de PaymentIntent se a sessão não os tiver diretamente (cenário menos comum para checkout.session.completed, mas para robustez)
  if (!slug && session.payment_intent) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
      slug = paymentIntent.metadata?.slug || slug;
      email = paymentIntent.metadata?.email || email;
      console.log(`[Webhook] Metadados recuperados do PaymentIntent: slug=${slug}, email=${email}`);
    } catch (piErr) {
      console.error(`[Webhook] Erro ao recuperar PaymentIntent para metadados:`, piErr);
    }
  }

  if (!slug) {
    console.warn(`[Webhook] Slug não encontrado no evento ou metadados. Ignorando evento ${event.type}.`);
    return NextResponse.json({ received: true });
  }

  console.log(`[Webhook] Processando evento para slug: ${slug}, email: ${email}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const isPaid =
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required";

      console.log(`[Webhook] checkout.session.completed - payment_status: ${session.payment_status}, isPaid: ${isPaid}`);

      if (isPaid) {
        await activateCoupleAndMoveFiles(slug, email);
      } else {
        console.warn(`[Webhook] checkout.session.completed - Pagamento não confirmado para o slug ${slug}. Status: ${session.payment_status}`);
      }
      break;
    }
    case "checkout.session.async_payment_succeeded":
      console.log(`[Webhook] checkout.session.async_payment_succeeded para o slug ${slug}.`);
      await activateCoupleAndMoveFiles(slug, email);
      break;
    default:
      console.log(`[Webhook] Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}