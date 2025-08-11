import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// التأكد من وجود المفتاح
if (!process.env.RESEND_API) {
  throw new Error("Provide RESEND_API inside the .env file");
}

// تهيئة Resend
const resend = new Resend(process.env.RESEND_API);

// دالة الإرسال
const sendEmail = async ({ sendTo, subject, html}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Spectrum <onboarding@resend.dev>',
      to: sendTo,
      subject: subject,
      html: html ,
    });

    if (error) {
      console.error("Email sending error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err };
  }
};

export default sendEmail;
