import mongoose from "mongoose";

const workSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true }, // للCloudinary
}, { timestamps: true });

export default mongoose.model("Work", workSchema);
