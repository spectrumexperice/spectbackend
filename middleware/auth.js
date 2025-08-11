import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'
const auth=async (req,res,next)=>{
    try{
        const token=req.cookies.accessToken || req?.header?.authorization?.split(" ")[1]
        if(!token){
            return res.status(401).json({
                message: "يرجى تقديم رمز الدخول (Access Token)",
                error:true,
                success:false
            })
        }
        const decode=await jwt.verify(token,process.env.SECRET_KEY_ACCESS_TOKEN)
        if(!decode){
            return res.status(401).json({
                message:"رمز دخول غير صالح",
                error:true,
                success:false
            })
        }
        const user=await UserModel.findById(decode._id || decode.id)
        if(!user){
            return res.status(404).json({
                message:"المستخدم غير موجود",
                error:true,
                success:false
            })
        }
        req.userId=user._id
        req.userRole=user.role
        next()
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}
export default auth 