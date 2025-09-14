import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { ar: { type: String, required: true }, en: { type: String } },
  slug: { type: String, unique: true, index: true }, // slug فريد
  description: { ar: { type: String }, en: { type: String } }, // الوصف الكامل (HTML من المحرر)
  shortDescription: { ar: { type: String }, en: { type: String } }, // وصف مختصر للبطاقات
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // فئة رئيسية
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // فئة فرعية 
 
  tags: [{ type: String }], // وسوم
  specs: {ar:[{ key: String, value: String }],en:[{ key: String, value: String }]}, // المواصفات الفنية
  images: [{ url: String, publicId: String, isMain: Boolean }], // صور متعددة
  attachments: [{ url: String, name: String, publicId: String }], // PDF أو datasheets
  featured: { type: Boolean, default: false }, // مميز في الصفحة الرئيسية
  active: { type: Boolean, default: true },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // منتجات ذات صلة
  
},
 { timestamps: true });

const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;
