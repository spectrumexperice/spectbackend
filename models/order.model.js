import mongoose from 'mongoose'
const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    orderId:{
        type:String,
        required:[true,"Provide orderid"],
        unique:true
    },
    porderId:{
        type:mongoose.Schema.ObjectId,
        ref:'Product'
    },
    product_details:{
        name:String,
        image:[string]
    },
    payment_status:{
        type:String,
        default:""
    },
    delivery_address:{
        type:mongoose.Schema.ObjectId,
        ref:'Address'
    },
    subtotalAmt:{
        type:Number,
        default:0
    },
    totalAmt:{
        type:Number,
        default:0
    },
    invoice_receipt:{
        type:String,
        default:""
    },
}, { timestamps: true })
const OrderModel=mongoose.model("Order",orderSchema)
export default OrderModel