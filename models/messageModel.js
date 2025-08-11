import mongoose from 'mongoose'

const messageSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:[true,"الاسم الكامل مطلوب"],
        trim:true
    },
    email:{
        type:String,
        required:[true,"البريد الإلكتروني مطلوب"],
        trime:true
    },
    phone:{
        type:String,
        trime:true,
    },
    message:{
        type:String,
        required:[true,"الرساله مطلوبة"],
        trim :true
    }
},{
    timestamps:true
}
)
const MessageModel=mongoose.model('Message',messageSchema)
export default MessageModel