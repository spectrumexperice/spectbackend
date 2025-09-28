/* import { Resend } from 'resend';
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

export default sendEmail; */


import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config()
//التاكد من وجود المتغيرات البيئيه
if(!process.env.MAIL_HOST || !process.env.MALI_PORT || !process.env.MAIL_USER || !process.env.MAIL_PASS){
  throw new Error("please provide all the env varibales in the .env file")
}
const transporter=nodemailer.createTransport({
  host:process.env.MAIL_HOST,
  port:Number(process.env.MALI_PORT),
  secure:true,
  auth:{
    user:process.env.MAIL_USER,
    pass:process.env.MAIL_PASS
  }
})
//داله الارسال
const sendEmail=async({to,subject,html})=>{
  try{
      const info=await transporter.sendMail({
        from :`"Spectrum"<${process.env.MAIL_USER}>`,
        to:to,
        subject:subject,
        html:html
      })
      console.log("✅ Email sent:", info.messageId);
      return { success: true, info };
  }catch (error) {
    console.error("❌ Email error:", error);
    return { success: false, error };
  }
}
export default sendEmail