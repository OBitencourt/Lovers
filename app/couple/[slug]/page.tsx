import { notFound } from "next/navigation";
import { connectToDB } from "@/lib/db-connect";
import Couple from "@/models/couple";
import CouplePolling from "./couple-polling";

export default async function CouplePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await connectToDB();
  const exists = await Couple.exists({ slug });

  if (!exists) notFound();

  return <CouplePolling slug={slug} />;
}
