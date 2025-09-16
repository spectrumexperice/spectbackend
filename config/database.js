import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

if(!process.env.MONGODATA_URL){
    throw new Error("please provide MONGODB URL")
}
 async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODATA_URL)
        console.log("Connect DB ...")
    }catch(error){
        console.log("MONGODB connect error",error)
        process.exit(1)
    }
}
export default connectDB