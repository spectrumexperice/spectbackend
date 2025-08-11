import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
    companyName:{
        type:String,required:true
    },
    logoUrl:{
        type:String,required:true
    },
   
    displayOrder:{
        type:Number,default:0
    },//لترتيب عرض الشعارات
    active:{
        type:Boolean,default:true
    },// لاظهار او اخفاء الشريك بسهولة
    publicId: {
    type: String,
    required: true,
    }

    
},{
    timestamps:true
})
const partnerModel=mongoose.model('Partner',partnerSchema)
export default partnerModel
