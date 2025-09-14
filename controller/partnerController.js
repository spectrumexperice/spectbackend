import partnerModel from "../models/parteners.js";
import uploadImageCloudinary  from '../utilities/uploadImageCloudinary.js'
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_KEY ,
  api_secret: process.env.CLODINARY_API_SECRET_KEY ,
});
// إضافة شريك جديد
export async function addPartner(req, res) {
  try {
    const { companyName, displayOrder } = req.body;

    // ملفات الصور
    const image = req.files?.image?.[0];
    const thankImage = req.files?.thankImage?.[0];

    // تحقق من وجود ترتيب مسبق
    const disorder = await partnerModel.findOne({ displayOrder });
    if (disorder) {
      return res.status(400).json({
        message: "رقم الترتيب موجود مسبقاً",
        error: true,
        success: false,
      });
    }

    if (!companyName || !image) {
      return res.status(400).json({
        message: "اسم الشركة والصورة مطلوبة",
        success: false,
        error: true,
      });
    }

    // رفع صورة الشعار
    const logoUploadResult = await uploadImageCloudinary(image);

    // رفع صورة الشكر إذا كانت موجودة
    let thankUploadResult = null;
    if (thankImage) {
      thankUploadResult = await uploadImageCloudinary(thankImage);
    }

    // تحقق من وجود اسم الشركة مسبقاً
    const exists = await partnerModel.findOne({ companyName });
    if (exists) {
      return res.status(400).json({
        message: "الشريك موجود مسبقا",
        error: true,
        success: false,
      });
    }

    // إنشاء كائن بيانات الشريك الجديد
    const payload = {
      companyName,
      displayOrder,
      logoUrl: logoUploadResult.secure_url,
      publicId: logoUploadResult.public_id,
      thankImageUrl: thankUploadResult ? thankUploadResult.secure_url : null,
      thankImagePublicId: thankUploadResult ? thankUploadResult.public_id : null,
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
     const partners = await partnerModel.find({ active: true })
      .sort({ displayOrder: 1 })
     

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

    // الملفات المرفوعة (شعار وصورة شكر)
    const image = req.files?.image?.[0];
    const thankImage = req.files?.thankImage?.[0];

    // جلب الشريك الحالي
    const partner = await partnerModel.findById(id);
    if (!partner) {
      return res.status(404).json({
        message: "الشريك غير موجود",
        success: false,
        error: true,
      });
    }

    // تحديث الشعار إذا تم رفع صورة جديدة
    if (image) {
      if (partner.publicId) {
        await cloudinary.uploader.destroy(partner.publicId);
      }
      const logoUploadResult = await uploadImageCloudinary(image);
      partner.logoUrl = logoUploadResult.secure_url;
      partner.publicId = logoUploadResult.public_id;
    }

    // تحديث صورة الشكر إذا تم رفع صورة جديدة
    if (thankImage) {
      if (partner.thankImagePublicId) {
        await cloudinary.uploader.destroy(partner.thankImagePublicId);
      }
      const thankUploadResult = await uploadImageCloudinary(thankImage);
      partner.thankImageUrl = thankUploadResult.secure_url;
      partner.thankImagePublicId = thankUploadResult.public_id;
    }

    // تحديث باقي الحقول النصية
    if (req.body.companyName !== undefined) {
      partner.companyName = req.body.companyName;
    }
    if (req.body.displayOrder !== undefined) {
      partner.displayOrder = req.body.displayOrder;
    }
    if (req.body.active !== undefined) {
      partner.active = req.body.active;
    }

    const updated = await partner.save();

    res.status(200).json({
      message: "تم تحديث بيانات الشريك",
      data: updated,
      success: true,
      error: false,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message || "حدث خطأ أثناء تحديث الشريك",
      error: true,
      success: false,
    });
  }
}


// حذف شريك
export async function deletePartner(req, res) {
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

    // حذف الصورة من Cloudinary إذا موجودة
    if (partner.publicId) {
      try {
        await cloudinary.uploader.destroy(partner.publicId);
      } catch (err) {
        console.error("خطأ في حذف صورة الشعار من Cloudinary:", err.message);
      }
    }

    // حذف بيانات الشريك
    await partnerModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "تم حذف الشريك بنجاح",
      data: partner,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("خطأ في deletePartner:", error.message);
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

