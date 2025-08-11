import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Provide name"]
    },
    email:{
        type:String,
        required:[true,"Provide email"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"provide password"]
    },
    mobile:{
        type:String,
        default:""
    },
    refresh_token:{
        type:String,
        default:""
    },
    verify_email:{
        type:Boolean,
        default:false
    },
    last_login_date:{
        type:Date,
        default:""
    },
    address_details:[{
        type:mongoose.Schema.ObjectId,
        ref:'Address'
    }],
    shopping_cart:[{
        type:mongoose.Schema.ObjectId,
        ref:'CartProduct'
    }],
    orderHistory:[{
        type:mongoose.Schema.ObjectId,
        ref:'Order'
    }],
    forgot_password_otp:{
        type:String,
        default:null
    },
    forgot_password_expiry:{
        type:Date,
        default:""
    },
    role:{
        type:String,
        enum:['ADMIN','USER'],
        default:"USER"
    },
   
}, { timestamps: true })
const UserModel=mongoose.model("User",userSchema)
export default UserModel