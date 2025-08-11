import partnerModel from "../models/parteners.js";
import uploadImageCloudinary  from '../utilities/uploadImageCloudinary.js'
import { v2 as cloudinary } from 'cloudinary';
// إضافة شريك جديد
export async function addPartner(req, res) {
  try {
    const { companyName, displayOrder } = req.body;
    const image = req.file;
    const disorder=await partnerModel .findOne({displayOrder})
    if(disorder){
      return res.status(400).json({
        message:"رقم الترتيب موجود مسبقاً",
        error:true,
        success:false
      })
    }
    if (!companyName || !image) {
      return res.status(400).json({
        message: "اسم الشركة والصورة مطلوبة",
        success: false,
        error: true,
      });
    }
    

    const uploadResult = await uploadImageCloudinary(image);
    const exists=await partnerModel.findOne({companyName})
    if(exists){
      return res.status(400).json({
        message:"الشريك موجود مسبقا",
        error:true,
        success:false
      })
    }
    const payload = {
      companyName,
      displayOrder,
      logoUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
    


    const partner = new partnerModel(payload);
    const saved = await partner.save();

    res.status(201).json({
      message: "تمت إضافة الشريك بنجاح",
      data: saved,
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "حدث خطأ أثناء إضافة الشريك",
      error: true,
      success: false,
    });
  }
}

// جلب جميع الشركاء
export async function getAllPartners(req, res) {
  try {
    const partners = await partnerModel.find({active:true}).sort({ displayOrder: 1 });
    res.status(200).json({
      data: partners,
      message: "تم جلب الشركاء بنجاح",
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء جلب الشركاء",
      error: true,
      success: false,
    });
  }
}

// تحديث بيانات شريك
export async function updatePartner(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await partnerModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({
        message: "الشريك غير موجود",
        success: false,
        error: true,
      });
    }

    res.status(200).json({
      message: "تم تحديث بيانات الشريك",
      data: updated,
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء تحديث الشريك",
      error: true,
      success: false,
    });
  }
}

// حذف شريك
export async function deletePartner(req, res) {
  try {
    const { id } = req.params;
    
    const deleted = await partnerModel.findByIdAndDelete(id);
    if (deleted?.publicId) {
    await cloudinary.uploader.destroy(deleted.publicId);
    }
    if (!deleted) {
      return res.status(404).json({
        message: "الشريك غير موجود",
        success: false,
        error: true,
      });
    }
    
    res.status(200).json({
      message: "تم حذف الشريك بنجاح",
      data: deleted,
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء حذف الشريك",
      error: true,
      success: false,
    });
  }
}
// controller
export async function getSinglePartner(req, res) {
  try {
    const { id } = req.params;
    const partner = await partnerModel.findById(id);
    if (!partner) {
      return res.status(404).json({
        message: "الشريك غير موجود",
        success: false,
        error: true,
      });
    }
    res.status(200).json({
      message: "تم جلب بيانات الشريك",
      data: partner,
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء جلب بيانات الشريك",
      success: false,
      error: true,
    });
  }
}

