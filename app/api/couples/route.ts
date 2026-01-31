import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db-connect";
import Couple from "@/models/couple";

// POST - Salvar rascunho do casal (antes do checkout)
export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const data = await req.json();
    const {
      slug,
      plan,
      coupleName,
      message,
      story,
      youtubeUrl,
      images,
      audioUrl,
    } = data;

    // 1. Validação de dados obrigatórios
    if (!slug || !plan || !coupleName || !message) {
      return NextResponse.json(
        { message: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }

    // 2. Verificar se o slug já existe para evitar duplicidade
    const existingCouple = await Couple.findOne({ slug });
    if (existingCouple) {
      // Se já existe e já foi pago, não permitimos alteração por esta rota
      if (existingCouple.paid) {
        return NextResponse.json(
          { message: "Este link já está em uso e pago." },
          { status: 409 }
        );
      }
      // Se existe mas não foi pago, podemos atualizar os dados (caso o user tenha voltado e mudado algo)
      Object.assign(existingCouple, {
        plan,
        coupleName,
        message,
        story,
        youtubeUrl,
        images,
        audioUrl,
        createdAt: new Date(), // renovamos o tempo de criação
        cleanupAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      await existingCouple.save();
      return NextResponse.json({ message: "Rascunho atualizado", slug });
    }

    // 3. Criar novo registro
    const createdAt = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(createdAt.getMonth() + 6); // expira em 6 meses

    const newCouple = new Couple({
      slug,
      plan,
      coupleName,
      message,
      story,
      youtubeUrl,
      images,
      audioUrl,
      paid: false, // SEMPRE começa como false
      createdAt,
      expiresAt,
      cleanupAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await newCouple.save();

    return NextResponse.json({ message: "Rascunho salvo com sucesso", slug });
  } catch (err) {
    console.error("Erro ao criar casal:", err);
    return NextResponse.json(
      { message: "Erro interno ao criar casal" },
      { status: 500 }
    );
  }
}

// GET - Buscar por slug (usado na página final)
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ message: "Slug é obrigatório" }, { status: 400 });
    }

    const couple = await Couple.findOne({ slug });

    if (!couple) {
      return NextResponse.json({ message: "Casal não encontrado" }, { status: 404 });
    }

    // Retornamos o objeto completo. O frontend lerá a propriedade 'paid'.
    // Adicionamos um header para evitar que o Next.js ou o navegador façam cache agressivo
    // desta resposta enquanto o status de pagamento pode mudar a qualquer segundo.
    return NextResponse.json(couple, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Erro ao buscar casal:", err);
    return NextResponse.json(
      { message: "Erro interno ao buscar casal" },
      { status: 500 }
    );
  }
}