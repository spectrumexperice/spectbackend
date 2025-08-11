
import subscripeModel from '../models/subscribe.model.js'

const subscribeController=async(req,res)=>{
   try{
    if (!email || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      error:true,
      message: "يرجى إدخال بريد إلكتروني صالح.",
    });
  }
  const existing = await subscripeModel.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "هذا البريد مسجل بالفعل.",
      });
    }
     const newSubscriber = new subscripeModel({ email });
    await newSubscriber.save();
      return res.status(201).json({
    error:false,
      success: true,
      message: "تم الاشتراك بنجاح في النشرة البريدية!",
    });

   }catch(error){
    return res.status(500).json({
        message:error.message || error,
        error:true,
        success:false
    })
   }
}
export default subscribeController