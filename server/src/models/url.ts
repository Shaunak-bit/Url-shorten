import mongoose, { Document, Schema } from "mongoose";

export interface IUrl extends Document {
  title: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  lastClicked?: Date;
}

const UrlSchema = new Schema<IUrl>(
  {
    title: { type: String, trim: true, default: "Untitled" },
    originalUrl: { type: String, required: true, trim: true },
    shortCode: { type: String, required: true, unique: true, index: true },
    clicks: { type: Number, default: 0 },
    lastClicked: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IUrl>("Url", UrlSchema);
