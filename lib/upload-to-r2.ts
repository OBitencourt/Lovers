// Função de Upload para o R2 (Pasta Temp)

export default async function uploadToR2(file: File, slug: string) {
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