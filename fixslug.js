import mongoose from "mongoose";
import CategoryModel from "./models/category.model.js";
import {generateUniqueCategorySlug} from "./controller/productController.js"

mongoose.connect(process.env.MONGODB_URL)

async function fixSlugs() {
  const categories = await CategoryModel.find();
  for (const category of categories) {
      const newSlug = await generateUniqueCategorySlug(category.name.ar || category.name.en, category._id);
      
      if (category.slug !== newSlug) {
        console.log(`Updating category ${category.name.ar}: ${category.slug} -> ${newSlug}`);
        category.slug = newSlug;
        await category.save();
      }
    }
  console.log("تم تصحيح جميع الـ slugs");
  process.exit();
}

fixSlugs();
