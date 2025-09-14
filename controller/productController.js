import ProductModel from "../models/product.model.js";
import CategoryModel from "../models/category.model.js";
import uploadImageCloudinary from "../utilities/uploadImageCloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config(); // الآن process.env.MONGO_URI متاحة
// ========== Slug Generator ==========
async function generateUniqueSlug(name, excludeId = null) {
  let slug = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")       // تحويل الفراغات إلى شرطات
    .replace(/[^a-z0-9-]/g, "") // إزالة أي رموز غير مسموح بها
    .replace(/^-+|-+$/g, "");   // إزالة أي شرطات في البداية أو النهاية

  let exists = await ProductModel.findOne({ slug, _id: { $ne: excludeId } });
  let counter = 1;
  while (exists) {
    const newSlug = `${slug}-${counter}`;
    exists = await ProductModel.findOne({ slug: newSlug, _id: { $ne: excludeId } });
    if (!exists) {
      slug = newSlug;
      break;
    }
    counter++;
  }
  return slug;
}

export async function generateUniqueCategorySlug(name, excludeId = null) {
  let slug = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");

  let exists = await CategoryModel.findOne({ slug, _id: { $ne: excludeId } });
  let counter = 1;
  while (exists) {
    const newSlug = `${slug}-${counter}`;
    exists = await CategoryModel.findOne({ slug: newSlug, _id: { $ne: excludeId } });
    if (!exists) {
      slug = newSlug;
      break;
    }
    counter++;
  }
  return slug;
}



// ========== إضافة منتج ==========
export const addProduct = async (req, res) => {
  const {  category, subCategory } = req.body;
     // parse fields that may come as JSON string
    let name = req.body.name;
    let description = req.body.description;
    let shortDescription = req.body.shortDescription;
    let specs = req.body.specs;
    let tags = req.body.tags;
    let relatedProducts = req.body.relatedProducts;
    try {
      if (typeof name === "string") name = JSON.parse(name);
      if (typeof description === "string") description = JSON.parse(description);
      if (typeof shortDescription === "string") shortDescription = JSON.parse(shortDescription);
      if (typeof specs === "string") specs = JSON.parse(specs);
      if (typeof tags === "string") tags = JSON.parse(tags);
      if (typeof relatedProducts === "string") relatedProducts = JSON.parse(relatedProducts);
    } catch (e) {
      return res.status(400).json({ message: "خطأ في صيغة البيانات", success: false });
    }
  try {
    
    if (!name?.ar?.trim() || !name?.en?.trim())
      return res.status(400).json({ message: "الاسم بالعربية والإنجليزية مطلوب", success: false });

    // التحقق من وجود الفئات
    const categoryDoc = await CategoryModel.findById(category);
    if (!categoryDoc) return res.status(400).json({ message: "الفئة الرئيسية غير موجودة", success: false });

    let subCategoryDoc = null;
    if (subCategory) {
      subCategoryDoc = await CategoryModel.findById(subCategory);
      if (!subCategoryDoc) return res.status(400).json({ message: "الفئة الفرعية غير موجودة", success: false });
    }

    const slug = await generateUniqueSlug(name.ar || name.en);

    // رفع الصور
    const images = [];
    if (req.files?.images?.length) {
      for (const file of req.files.images) {
        const result = await uploadImageCloudinary(file);
        images.push({ url: result.secure_url, publicId: result.public_id, isMain: images.length === 0 });
      }
    }

    // رفع المرفقات
    const attachments = [];
    if (req.files?.attachments?.length) {
      for (const file of req.files.attachments) {
        const result = await uploadImageCloudinary(file);
        attachments.push({ url: result.secure_url, publicId: result.public_id, name: file.originalname });
      }
    }

    const payload = {
      name,
      slug,
      description: description || { ar: "", en: "" },
      shortDescription: shortDescription || { ar: "", en: "" },
      category: categoryDoc._id,
      subCategory: subCategoryDoc?._id || null,
      specs: specs || { ar: [], en: [] },
      tags: tags || [],
      images,
      attachments,
      featured: req.body.featured === true || req.body.featured === "true",
      relatedProducts: relatedProducts || [],
      active: true,
    };

    const product = new ProductModel(payload);
    const saved = await product.save();
    res.status(201).json({ message: "تمت إضافة المنتج بنجاح", data: saved, success: true });

  } catch (error) {
    res.status(500).json({ message: error.message || "حدث خطأ أثناء إضافة المنتج", success: false });
  }
};

// ========== تحديث المنتج ==========
// افتراض: لديك cloudinary و uploadImageCloudinary كما عندك الآن
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود", success: false });

    // === استخراج الحقول ===
    let {
      name,
      description,
      shortDescription,
      category,
      subCategory,
      specs,
      tags,
      relatedProducts,
      featured,
      existingImages,
      existingAttachments,
    } = req.body;

    // === Parsing للحقول إذا كانت strings ===
    try {
      if (typeof name === "string") name = JSON.parse(name);
      if (typeof description === "string") description = JSON.parse(description);
      if (typeof shortDescription === "string") shortDescription = JSON.parse(shortDescription);
      if (typeof specs === "string") specs = JSON.parse(specs);
      if (typeof tags === "string") tags = JSON.parse(tags);
      if (typeof relatedProducts === "string") relatedProducts = JSON.parse(relatedProducts);
      if (typeof existingImages === "string") existingImages = JSON.parse(existingImages);
      if (typeof existingAttachments === "string") existingAttachments = JSON.parse(existingAttachments);
    } catch (e) {
      return res.status(400).json({ message: "خطأ في صيغة البيانات", success: false });
    }

    // === تعديل الحقول ===
    if (name) {
      product.name = name;
      product.slug = await generateUniqueSlug(name.ar || name.en, product._id);
    }
    if (description) product.description = description;
    if (shortDescription) product.shortDescription = shortDescription;

    if (category) {
      const catDoc = await CategoryModel.findById(category);
      if (!catDoc) return res.status(400).json({ message: "الفئة الرئيسية غير موجودة", success: false });
      product.category = catDoc._id;
    }

    if (subCategory) {
      const subDoc = await CategoryModel.findById(subCategory);
      if (!subDoc) return res.status(400).json({ message: "الفئة الفرعية غير موجودة", success: false });
      product.subCategory = subDoc._id;
    }

    if (specs) product.specs = specs;
    if (tags) product.tags = tags;
    if (relatedProducts) product.relatedProducts = relatedProducts;
    if (featured !== undefined) product.featured = featured === true || featured === "true";

    // ===== معالجة الصور =====
    let keptImages = Array.isArray(existingImages) ? existingImages : [];
    const previousImages = product.images || [];
    const toRemove = previousImages.filter(prevImg => !keptImages.find(k => (k.publicId && k.publicId === prevImg.publicId) || (k.url && k.url === prevImg.url)));

    for (const img of toRemove) {
      try { if (img.publicId) await cloudinary.uploader.destroy(img.publicId); } catch (err) { console.warn("Failed to destroy image:", img.publicId, err); }
    }

    product.images = keptImages.map(i => ({
      url: i.url,
      publicId: i.publicId,
      isMain: !!i.isMain,
    }));

    if (req.files?.images?.length) {
      for (const file of req.files.images) {
        const result = await uploadImageCloudinary(file);
        product.images.push({
          url: result.secure_url,
          publicId: result.public_id,
          isMain: false,
        });
      }
    }

    // ضمان صورة رئيسية واحدة
    let mainFound = false;
    for (let i = 0; i < product.images.length; i++) {
      if (product.images[i].isMain && !mainFound) mainFound = true;
      else product.images[i].isMain = false;
    }
    if (!mainFound && product.images.length > 0) product.images[0].isMain = true;

    // ===== معالجة المرفقات =====
    let keptAttachments = Array.isArray(existingAttachments) ? existingAttachments : [];
    const prevAtt = product.attachments || [];
    const attToRemove = prevAtt.filter(pa => !keptAttachments.find(k => (k.publicId && k.publicId === pa.publicId) || (k.url && k.url === pa.url)));

    for (const a of attToRemove) {
      try { if (a.publicId) await cloudinary.uploader.destroy(a.publicId); } catch (err) { console.warn("Failed to destroy attachment:", a.publicId, err); }
    }

    product.attachments = keptAttachments.map(a => ({
      url: a.url,
      publicId: a.publicId,
      name: a.name,
    }));

    if (req.files?.attachments?.length) {
      for (const file of req.files.attachments) {
        const result = await uploadImageCloudinary(file);
        product.attachments.push({
          url: result.secure_url,
          publicId: result.public_id,
          name: file.originalname,
        });
      }
    }

    await product.save();
    return res.status(200).json({ message: "تم تحديث المنتج بنجاح", success: true, data: product });
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ message: error.message || "Server error", success: false });
  }
};



// ========== حذف المنتج ==========
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود", success: false });

    for (const img of product.images || []) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
    }
    for (const att of product.attachments || []) {
      if (att.publicId) await cloudinary.uploader.destroy(att.publicId);
    }

    await ProductModel.findByIdAndDelete(id);
    res.status(200).json({ message: "تم حذف المنتج بنجاح", success: true });

  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// ========== جلب كل المنتجات ==========


export const getAllProducts = async (req, res) => {
  try {
    // اقرأ القيم من query (كلها strings أو undefined)
    const { page, limit, category, subCategory, featured, tags } = req.query;

    // حضّر أرقام الصفحة والحدّ
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 20, 1);

    // فلتر أساسي
    const filter = { active: true };

    // ====== معالجة category (id أو slug) مع تضمين الفرعيات ======
    if (category) {
      // حاول نوجد الـ categoryDoc أولًا بالـ id إن كان صالحًا، وإلا بالـ slug
      let categoryDoc = null;
      if (mongoose.Types.ObjectId.isValid(String(category))) {
        categoryDoc = await CategoryModel.findById(category).lean();
      }
      if (!categoryDoc) {
        categoryDoc = await CategoryModel.findOne({ slug: String(category) }).lean();
      }

      if (categoryDoc) {
        // اجلب الفرعيات (ids)
        const subCategoryIds = await CategoryModel.find({ parent: categoryDoc._id }).distinct("_id");
        // فلترة: منتجات للفئة أو لأي فرعية تابعة
        filter.$or = [
          { category: categoryDoc._id },
          { subCategory: { $in: subCategoryIds } }
        ];
      } else {
        // لم نجد الفئة — ارجع نتيجة فارغة بدل رمي خطأ
        return res.status(200).json({
          success: true,
          data: [],
          page: pageNum,
          totalPages: 0,
          total: 0
        });
      }
    }

    // ====== معالجة subCategory (id أو slug) ======
    if (subCategory) {
      let subDoc = null;
      if (mongoose.Types.ObjectId.isValid(String(subCategory))) {
        subDoc = await CategoryModel.findById(subCategory).lean();
      }
      if (!subDoc) {
        subDoc = await CategoryModel.findOne({ slug: String(subCategory) }).lean();
      }
      if (subDoc) {
        // إذا كنا قد وضعنا filter.$or سابقاً لِـ category + subCategories،
        // فلإعطاء أولوية للـ subCategory المحدد نضيف شرطًا مناسبًا:
        // — أبسط: أضف شرط subCategory فقط (سيقيد النتيجة أكثر)
        filter.subCategory = subDoc._id;
        // وإذا رغبت بإزالة الـ $or السابق عند وجود subCategory محدد:
        if (filter.$or) delete filter.$or;
      } else {
        // لو لم نجد subCategory، نرجع نتيجة فارغة أو نتجاهل (أنا أخليها فارغة)
        return res.status(200).json({
          success: true,
          data: [],
          page: pageNum,
          totalPages: 0,
          total: 0
        });
      }
    }

    // ====== featured ======
    if (typeof featured !== "undefined") {
      filter.featured = String(featured) === "true" || String(featured) === "1";
    }

    // ====== tags ======
    if (tags) {
      const tagList = String(tags)
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      if (tagList.length) filter.tags = { $in: tagList };
    }

    // ====== Logging مفيد للـ debug ======
    console.log("getAllProducts filter:", JSON.stringify(filter));

    // ====== تنفيذ الاستعلام ======
    const total = await ProductModel.countDocuments(filter);
    const products = await ProductModel.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .lean();

    return res.status(200).json({
      success: true,
      data: products,
      page: pageNum,
      totalPages: total ? Math.ceil(total / limitNum) : 0,
      total
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


// ========== البحث ==========



// ========== جلب الفئات الرئيسية ==========
export const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find({}, { name: 1, slug: 1, parent: 1 });
    const formattedCategories = categories.map(cat => ({
      _id: cat._id,
      name: { ar: cat.name.ar, en: cat.name.en },
      slug: cat.slug,
      parent: cat.parent || null
    }));
    res.status(200).json({ success: true, data: formattedCategories });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};



// ========== جلب الفئات الفرعية ==========
// ========== جلب الفئات الفرعية حسب الفئة الرئيسية ==========
export const getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.query;
    if (!parentId) return res.status(400).json({ message: "معرف الفئة الرئيسية مطلوب", success: false });

    const subcategories = await CategoryModel.find(
      { parent: parentId },
      { name: 1, slug: 1 }
    ).lean();

    res.status(200).json({ success: true, data: subcategories });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
// ========== جلب الفئات الفرعية والمنتجات الخاصة بها ==========
export const getSubcategoryProducts = async (req, res) => {
  try {
    const subcategoryDoc = await CategoryModel.findOne({ slug: subcategorySlug });
  
    
    if (subcategoryDoc && subcategoryDoc.parent) {
      // ابحث عن الفئة الرئيسية
     
       const filter = {
    active: true,
    subCategory: subcategoryDoc._id // ✅ هنا الأساس!
  };

      const total = await ProductModel.countDocuments(filter);
      const products = await ProductModel.find(filter)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate("category", "name slug")
        .populate("subCategory", "name slug")
        .lean();

      return res.status(200).json({
        success: true,
        data: {
          subcategory: subcategoryDoc,
          parentCategory, // ✅ أضف الفئة الرئيسية هنا
          products,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total
        }
      });
    }
    // ... باقي الكود
  } catch (error) {
    // ...
  }
};


// ========== جلب المنتجات بهيكل هرمي ==========
export const getProductsGrouped = async (req, res) => {
  try {
    const categories = await CategoryModel.find({ parent: null }).lean();

    const data = [];
    for (const cat of categories) {
      const subs = await CategoryModel.find({ parent: cat._id }).lean();
      const subCategories = [];

      for (const sub of subs) {
        const products = await ProductModel.find(
          { category: cat._id, subCategory: sub._id, active: true },
          { name: 1, slug: 1 }
        );

        subCategories.push({ 
          name: sub.name, 
          slug: sub.slug || await generateUniqueCategorySlug(sub.name.ar || sub.name.en), // fallback
          products 
        });
      }

      data.push({ 
        name: cat.name, 
        slug: cat.slug || await generateUniqueCategorySlug(cat.name.ar || cat.name.en), // fallback
        subCategories 
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// ========== جلب منتج عبر الـ slug ==========
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "الـ slug مطلوب", success: false });
    }

    const product = await ProductModel.findOne({ slug, active: true })
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود", success: false });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: error.message || "حدث خطأ أثناء جلب المنتج", success: false });
  }
};
export const addCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body; // parentId يكون null للفئة الرئيسية

    if (!name?.ar?.trim() || !name?.en?.trim()) {
      return res.status(400).json({ message: "الاسم بالعربية والإنجليزية مطلوب", success: false });
    }

    // توليد slug بناءً على الاسم العربي
    let slug = await generateUniqueCategorySlug(name.ar);

    // التأكد من عدم تكرار الـ slug
    let exists = await CategoryModel.findOne({ slug });
    let counter = 1;
    while (exists) {
      const newSlug = `${slug}-${counter}`;
      exists = await CategoryModel.findOne({ slug: newSlug });
      if (!exists) {
        slug = newSlug;
        break;
      }
      counter++;
    }

    const category = new CategoryModel({
      name,
      slug,
      parent: parentId || null
    });

    const saved = await category.save();
    res.status(201).json({ message: "تمت إضافة الفئة بنجاح", data: saved, success: true });

  } catch (error) {
    res.status(500).json({ message: error.message || "حدث خطأ أثناء إضافة الفئة", success: false });
  }
};
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "أدخل كلمة للبحث", success: false });

    const regex = new RegExp(q, "i");
    const products = await ProductModel.find({
      active: true,
      $or: [
        { "name.ar": regex },
        { "name.en": regex },
        { "shortDescription.ar": regex },
        { "shortDescription.en": regex },
        { tags: regex },
      ]
    })
    .populate("category", "name slug")
    .populate("subCategory", "name slug");

    res.status(200).json({ success: true, data: products });

  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

export default addProduct
