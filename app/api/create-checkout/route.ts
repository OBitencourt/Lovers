import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { plan, slug } = await req.json(); // agora recebemos o slug do frontend

    if (!slug) {
      return NextResponse.json(
        { error: "Slug não fornecido" },
        { status: 400 }
      );
    }

    const priceId =
      plan === "premium"
        ? process.env.STRIPE_PRICE_PREMIUM_ID
        : process.env.STRIPE_PRICE_BASIC_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID não configurado" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "mb_way", "multibanco"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Envia o slug como metadata
      metadata: {
        slug,
        plan,
        sessionIdPlaceholder: "will-be-replaced"
      },
      // Redireciona direto para a página do casal usando o slug
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/couple/${slug}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/create?plan=${plan}`,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}
