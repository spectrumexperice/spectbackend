import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "الاسم الكامل مطلوب"],
      trim: true,
      minlength: [3, "يجب أن يكون الاسم على الأقل 3 أحرف"],
      maxlength: [100, "الاسم طويل جدًا"],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, "اسم الشركة طويل جدًا"],
      default: "",
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "البريد الإلكتروني غير صالح",
      ],
    },
   phone: {
  type: String,
  trim: true,
  validate: {
    validator: function (v) {
      if (!v) return true; // يسمح بالقيمة الفارغة إذا الحقل اختياري
      return /^(05\d{8}|\+9665\d{8})$/.test(v);
    },
    message: (props) => `${props.value} رقم هاتف سعودي غير صالح`,
  },
  default: "",
},

    projectName: {
      type: String,
      required: [true, "اسم المشروع مطلوب"],
      trim: true,
      maxlength: [150, "اسم المشروع طويل جدًا"],
    },
    projectStatus: {
      type: String,
      required: [true, "حالة المشروع مطلوبة"],
      enum: ["مخطط", "قيد التنفيذ", "مكتمل", "آخر"],
      default: "مخطط",
    },
    projectLocation: {
      type: String,
      required: [true, "موقع المشروع مطلوب"],
      trim: true,
    },
    projectType: {
      type: String,
      trim: true,
      maxlength: [100, "نوع المشروع طويل جدًا"],
      default: "",
    },
    quantity: {
      type: Number,
      min: [1, "الكمية يجب أن تكون على الأقل 1"],
      default: 1,
    },
    specifications: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    attachments: [
      {
        filename: String,
        url: String,
        mimetype: String,
        size: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MessageCapitalModel = mongoose.model("MessageCapital", messageSchema);
export default MessageCapitalModel;
