import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!webhookSecret || !signature) {
      return NextResponse.json(
        { message: "Missing webhook secret or Stripe signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { message: `Webhook error: ${err.message}` },
        { status: 400 }
      );
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const slug = session.metadata?.slug;

    switch (event.type) {
      case "checkout.session.completed":
        if (session.payment_status === "paid") {
          console.log("Pagamento confirmado para o slug:", slug);
          // TODO: Salvar dados no DB + enviar arquivos para Cloudflare
        }
        break;

      case "checkout.session.async_payment_succeeded":
        console.log("Pagamento assíncrono (boleto) confirmado para:", slug);
        // TODO: Salvar dados no DB
        break;

      case "checkout.session.async_payment_failed":
        console.log("Pagamento assíncrono (boleto) falhou para:", slug);
        break;

      case "checkout.session.expired":
        console.log("Checkout expirado para:", slug);
        break;

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Erro ao processar webhook:", err);
    return NextResponse.json(
      { message: "Erro interno ao processar webhook" },
      { status: 500 }
    );
  }
}
