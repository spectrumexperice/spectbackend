import MessageModel from '../models/messageModel.js'
import sendEmail from '../config/sendEmail.js'
const SendMessage=async (req,res)=>{
try{
    const {fullName,email,phone,message}= req.body
    if(!fullName || !email || !message){
        return res.status(400).json({
            messgae:"ادخل الحقول المطلوبة..",
            error:true,
            success:false
        })
    }
    const payload=({fullName,email,phone,message})
     const newMessage=await new MessageModel(payload)
     await newMessage.save()
      await sendEmail({
      to: "m.alhazmi@s-spectrum.com",
      subject: `رسالة جديدة من ${fullName}`,
      html: `
        <p>لقد استلمت رسالة جديدة من الزبون:</p>
        <p><strong>الاسم:</strong> ${fullName}</p>
        <p><strong>البريد:</strong> ${email}</p>
        <p><strong>الهاتف:</strong> ${phone}</p>
        <p><strong>الرسالة:</strong></p>
        <p>${message}</p>
      `
    });

     return res.status(201).json({
        message :"تم ارسال رسالتك بنجاح",
        error:false,
        success:true
     })
     

}catch(error){
    return res.status(500).json({
        message :error.message || error,
        error:true,
        success:false
    })
}
}
export default SendMessage