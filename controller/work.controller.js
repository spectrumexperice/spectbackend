import workImageModel from "../models/workImage.model.js";
import uploadImageCloudinary from "../utilities/uploadImageCloudinary.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_KEY ,
  api_secret: process.env.CLODINARY_API_SECRET_KEY ,
});
// إضافة عمل جديد
export const addWork = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "الرجاء رفع صورة" });
    }

    // رفع الصورة إلى Cloudinary
    const result = await uploadImageCloudinary(req.file)
    const work = new workImageModel({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

    await work.save();

    res.status(201).json({
      success: true,
      message: "تم إضافة الصورة بنجاح",
      data: work,
    });
  } catch (error) {
    console.error("Add Work Error:", error);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء إضافة الصورة" });
  }
};

// جلب جميع الأعمال
export const getWorks = async (req, res) => {
  try {
    const works = await workImageModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: works });
  } catch (error) {
    console.error("Get Works Error:", error);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب الأعمال" });
  }
};

// حذف عمل
export const deleteWork = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("idddd ",id)
    const work = await workImageModel.findById(id);

    if (!work) {
      return res.status(404).json({ success: false, message: "الصورة غير موجودة" });
    }

    // حذف الصورة من Cloudinary
    if (work.publicId) {
       try {
              await cloudinary.uploader.destroy(work.publicId,);
            } catch (err) {
              console.error("خطأ في حذف الصورة  من Cloudinary:", err.message);
            }
    
    }
    

    await workImageModel.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "تم حذف الصورة بنجاح" });
  } catch (error) {
    console.error("Delete Work Error:", error);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء حذف الصورة" });
  }
};
