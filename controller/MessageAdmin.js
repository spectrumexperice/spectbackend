import MessageModel from "../models/messageModel.js";
import MessageCapitalModel from "../models/messageModelCapital.js"

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_KEY ,
  api_secret: process.env.CLODINARY_API_SECRET_KEY ,
});

import sendEmail from "../config/sendEmail.js"
// جلب جميع الرسائل مع فرز وتصنيف
export const getAllMessages = async (req, res) => {
  try {
    const simpleMSG = await MessageModel.find().sort({ createdAt: -1 });
    const capitalMSG = await MessageCapitalModel.find().sort({ createdAt: -1 });

    const allMSG = [
      ...simpleMSG.map((m) => ({ ...m.toObject(), type: "simple" })),
      ...capitalMSG.map((m) => ({ ...m.toObject(), type: "detailed"})),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, error: false, messages: allMSG });
  } catch (error) {
    return res.status(500).json({ success: false, error: true, message: error.message });
  }
};

// حذف رسالة
export const deleteMessage = async (req, res) => {
  try {
    const { id, type } = req.params;
    let deleted;

    if (type === "simple") {
      deleted = await MessageModel.findByIdAndDelete(id);
    } else if (type === "detailed") {
      const msg = await MessageCapitalModel.findById(id);
      if (!msg) return res.status(404).json({ success: false, message: "الرسالة غير موجودة" });

      if (msg.attachments && msg.attachments.length > 0) {
        for (const att of msg.attachments) {
          if (att.publicId) await cloudinary.uploader.destroy(att.publicId);
        }
      }
      deleted = await MessageCapitalModel.findByIdAndDelete(id);
    }

    if (!deleted) return res.status(404).json({ success: false, message: "الرسالة غير موجودة" });

    return res.json({ success: true, message: "تم حذف الرسالة بنجاح" });
  } catch (error) {
    return res.status(500).json({ success: false, error: true, message: error.message });
  }
};

// الرد على الرسائل
export const replyMessage = async (req, res) => {
try {
      const {id,type}=req.params
      const {replyText}=req.body
      const Model=type==="simple" ?MessageModel:MessageCapitalModel
      const message =await Model.findById(id)
      if(!message){
        return res.status(404).json({
          success:false,message:"الرساله غير موجوده",error:true
        })
      }
      message.replied=true,
      message.replyText=replyText
      message.repliedAt=new Date()
      await message.save()
      try{ 
         await sendEmail({
        sendTo: message.email,
        subject: "رد على رسالتك : شركة سبكتروم",
        html: `
          <p>عزيزي ${message.fullName},</p>
          <p>شكراً على تواصلك:</p>
          <div style="background:#f5f5f5; padding:15px; border-left:4px solid #ddd;">
            ${replyText}
          </div>
          <p>أطيب التحيات,<br/>فريق الدعم</p>
        `
      });
      }catch(error){
         console.error("فشل في ارسال البريد",error)
      }
      return res.json({
        success:true,message:"تم الرد على الرساله بنجاح"
      })
     
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails
    }
};

// تصدير الرسائل بصيغة CSV
import { Parser } from "json2csv";

export const exportMessages = async (req, res) => {
  try {
    // التحقق من الصلاحيات الإضافية
    if (!req.userRole === 'admin') {
      return res.status(403).json({ success: false, message: "غير مصرح لك بهذا الإجراء" });
    }

    const simpleMSG = await MessageModel.find().sort({ createdAt: -1 });
    const capitalMSG = await MessageCapitalModel.find().sort({ createdAt: -1 });

    const allMSG = [
      ...simpleMSG.map((m) => ({ ...m.toObject(), type: "simple" })),
      ...capitalMSG.map((m) => ({ ...m.toObject(), type: "detailed" })),
    ];

    const format = req.query.format || 'csv'; // الحصول على نوع الملف المطلوب

    if (format === 'csv') {
      const fields = ["fullName", "email", "phone", "type", "company", "projectName", 
                     "projectStatus", "projectLocation", "projectType", "quantity", 
                     "specifications", "description", "createdAt"];
      const parser = new Parser({ fields });
      const csv = parser.parse(allMSG);

    res.header("Content-Type", "text/csv; charset=UTF-8");
      res.attachment(`messages_${new Date().toISOString()}.csv`);
      return res.send("\uFEFF" + csv);
    } else if (format === 'pdf') {
      // هنا يمكنك إضافة دالة لتصدير PDF إذا كنت تريد دعمه
      return res.status(501).json({ success: false, message: "تصدير PDF غير مدعوم حالياً" });
    } else {
      return res.status(400).json({ success: false, message: "صيغة التصدير غير مدعومة" });
    }
  } catch (error) {
    console.error("Export error:", error);
    return res.status(500).json({ success: false, message: "حدث خطأ أثناء التصدير" });
  }
};
export default {
  getAllMessages,
  deleteMessage,
  replyMessage,
  exportMessages
};
