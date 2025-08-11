import mongoose from "mongoose";

const thanksImageSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "",
  },
  imageUrl: {
    type: String,
    required: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true
});

const ThanksImage = mongoose.model("ThanksImage", thanksImageSchema);
export default ThanksImage;
