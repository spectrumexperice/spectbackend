import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { ar: String, en: String },
  slug: { type: String, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null } // null للفئات الرئيسية
});

const CategoryModel = mongoose.model("Category", CategorySchema);
export default CategoryModel;
