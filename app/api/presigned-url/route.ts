export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configurações do R2 via AWS SDK
const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false
});

export async function POST(req: Request) {
  try {
    const { fileName, fileType, slug } = await req.json();
    const safeFileName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();

    if (!fileName || !fileType || !slug) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }

    // Definir pasta com base no tipo de arquivo
    let folder: string;
    if (fileType.startsWith("image/")) {
      folder = "images";
    } else if (fileType.startsWith("audio/")) {
      folder = "audios";
    } else {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado" },
        { status: 400 }
      );
    }
    console.log(fileType)
    // Path no bucket: temp/{slug}/images ou temp/{slug}/audios
    const key = `temp/${folder}/${slug}-${safeFileName}`;

    // Comando para criar URL pré-assinada
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 60 * 5  }); // 5 min de validade

    return NextResponse.json({ uploadUrl: url, key });
  } catch (err) {
    console.error("Erro ao gerar presigned URL:", err);
    return NextResponse.json(
      { error: "Erro interno ao gerar URL" },
      { status: 500 }
    );
  }
}
