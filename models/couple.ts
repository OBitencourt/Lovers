import mongoose, { Schema, Document } from "mongoose";

export interface ICouple extends Document {
  slug: string;
  plan: "basic" | "premium";
  email: string;
  startDate: Date;
  coupleName: string;
  message: string;
  story?: string;
  youtubeUrl?: string;
  images: string[];
  audioUrl?: string | null;
  paid: boolean;
  createdAt: Date;
  expiresAt?: Date;
  cleanupAt?: Date; // Campo para o TTL automático
}

const CoupleSchema = new Schema<ICouple>({
  slug: { type: String, required: true, unique: true },
  plan: { type: String, enum: ["basic", "premium"], required: true },
  email: { type: String, required: true },
  startDate: { type: Date, required: true },
  coupleName: { type: String, required: true },
  message: { type: String, required: true },
  story: { type: String },
  youtubeUrl: { type: String },
  images: { type: [String], default: [] },
  audioUrl: { type: String, default: null },
  paid: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: false }, // Se o plano for premium, nós deixamos o link ativo para sempre.

  // O MongoDB vai vigiar esse campo, e se o campo existir, ele apaga o doc na data definida.
  // Se o campo NÃO existir (após o pagamento vou excluir esse campo), o doc nunca é apagado por TTL.
  cleanupAt: { 
    type: Date, 
    index: { expires: 0 } // Apaga exatamente na data contida no campo
  },
});

CoupleSchema.index({ slug: 1 });

export default mongoose.models.Couple || mongoose.model<ICouple>("Couple", CoupleSchema);
