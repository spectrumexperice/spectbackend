import MessageCapitalModel from "../models/messageModelCapital.js";
 // دالة رفع الصورة المنفصلة
import uploadImageCloudinary from "../utilities/uploadImageCloudinary.js";
const sendDetailedMessage = async (req, res) => {
  try {
    const {
      fullName,
      email,
      projectName,
      projectStatus,
      projectLocation,
      projectType,
      qty,
      specifications,
      description,
    } = req.body;

    // تحقق الحقول المطلوبة
    if (
      !fullName ||
      !email ||
      !projectName ||
      !projectStatus ||
      !projectLocation
    ) {
      return res.status(400).json({
        message: "الحقول المطلوبة ناقصة",
        error: true,
        success: false,
      });
    }

    // رفع الملفات (attachments) إذا وجدت
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // تمرير الملف لدالة الرفع المنفصلة
        const uploaded = await uploadImageCloudinary(file);
        attachments.push({
          filename: file.originalname,
          url: uploaded.secure_url,
          mimetype: file.mimetype,
          size: file.size,
          publicId: uploaded.public_id,
        });
      }
    }

    // تحضير البيانات للحفظ
    const messageData = {
      fullName,
      email,
      projectName,
      projectStatus,
      projectLocation,
      projectType: projectType || "",
      qty: qty || "",
      specifications: specifications || "",
      description: description || "",
      attachments,
    };

    // حفظ الرسالة التفصيلية في قاعدة البيانات
    const newMessage = new MessageCapitalModel (messageData);
    await newMessage.save();

    // رد بنجاح
    return res.status(201).json({
      message: "تم إرسال الرسالة التفصيلية بنجاح",
      error: false,
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "حدث خطأ في الخادم",
      error: true,
      success: false,
    });
  }
};

export default sendDetailedMessage;
