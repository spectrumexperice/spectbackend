import ThanksImage from "../models/thanksImage.js";

// جلب الصور المفَعّلة فقط
export async function getActiveThanksImages(req, res) {
  try {
    const images = await ThanksImage.find({ active: true }).sort({ displayOrder: 1 });

    res.status(200).json({
      data: images,
      message: "تم جلب صور الشكر بنجاح",
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "حدث خطأ أثناء جلب الصور",
      error: true,
      success: false,
    });
  }
}

// إضافة صورة جديدة
export async function addThanksImage(req, res) {
  try {
    const { title, displayOrder } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({
        message: "الصورة مطلوبة",
        error: true,
        success: false,
      });
    }

    const uploaded = await uploadImageCloudinary(image);

    const newImage = new ThanksImage({
      title,
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      displayOrder,
    });

    const saved = await newImage.save();

    res.status(201).json({
      message: "تمت إضافة صورة الشكر بنجاح",
      data: saved,
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "حدث خطأ أثناء الإضافة",
      error: true,
      success: false,
    });
  }
}


// تفعيل / إلغاء التفعيل
export async function toggleImageActive(req, res) {
  try {
    const { id } = req.params;

    const image = await ThanksImage.findById(id);
    if (!image) {
      return res.status(404).json({
        message: "الصورة غير موجودة",
        error: true,
        success: false,
      });
    }

    image.active = !image.active;
    await image.save();

    res.status(200).json({
      message: `تم ${image.active ? "تفعيل" : "إلغاء تفعيل"} الصورة بنجاح`,
      data: image,
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "حدث خطأ أثناء تحديث الحالة",
      error: true,
      success: false,
    });
  }
}
