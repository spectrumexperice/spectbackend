// controllers/subscribeController.js
import SubscriberModel from "../models/subscribe.model.js";

const subscribeController = async (req, res) => {
  try {
    const { email } = req.body;

    // تحقق من وجود الإيميل وصحته
    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "يرجى إدخال بريد إلكتروني صالح.",
      });
    }

    // تحقق إذا البريد مسجل مسبقًا
    const existing = await SubscriberModel.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "هذا البريد مسجل بالفعل.",
      });
    }

    // إنشاء مشترك جديد
    const newSubscriber = new SubscriberModel({ email });
    await newSubscriber.save();

    return res.status(201).json({
      error: false,
      success: true,
      message: "تم الاشتراك بنجاح في النشرة البريدية!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
// controllers/subscribeController.js

// جلب كل المشتركين
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await SubscriberModel.find().sort({ subscribedAt: -1 });
    return res.json({
      success: true,
      error: false,
      data: subscribers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// حذف مشترك
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    await SubscriberModel.findByIdAndDelete(id);
    return res.json({
      success: true,
      error: false,
      message: "تم حذف المشترك بنجاح.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};


export default subscribeController;
