import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  thankImageUrl: {
    type: String,
    default: null, // رابط صورة الشكر
  },
  thankImagePublicId: {
    type: String,
    default: null, // ID الصورة في Cloudinary
  },
  displayOrder: {
    type: Number,
    default: 0, // لترتيب عرض الشعارات
  },
  active: {
    type: Boolean,
    default: true, // لاظهار او اخفاء الشريك بسهولة
  },
}, {
  timestamps: true
});

const partnerModel = mongoose.model("Partner", partnerSchema);
export default partnerModel;
