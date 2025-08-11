import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import sendEmail from '../config/sendEmail.js'
import generateAccessToken from '../utilities/generateAccessToken.js'
import generateRefreshToken from '../utilities/generateRefreshToken.js'
import generateOTP from '../utilities/generateOTP.js'
import jwt from 'jsonwebtoken'
export async function registerUserController(req,res){
    try{
        console.log("req.body",req.body)
        const {name,email,password}=req.body
        
        if(!name || !email || !password){
            return res.status(400).json({
                message:"provide email ,name,password",
                error:true,
                success:false
            })
        }
        const user=await UserModel.findOne({email})
        if(user){
            return res.json({
                message:"already register email",
                error:true,
                success:false
            })
        }
        const salt=await bcryptjs.genSalt(10)
        const hashPassword=await bcryptjs.hash(password,salt)
        const payload={
            name,email,password:hashPassword
        }
        const newUser=new UserModel(payload)
        const save=await newUser.save()
        
        const verifyEmailURL=`${process.env.FRONTEND_URL}/verify-email?code=${save._id}`
        const verifyEmail=await sendEmail({
            sendTo:email,
            subject:"تأكيد حسابك ",
            name:name,
            html:`
            <p>عزيزي ${name},</p>
            <p>شكرا لتسجيلك في شركة سبكتروم </p>
            <p>رجاء اضغط على الزر التالي لتأكيد حسابك</p>
            <a href="${verifyEmailURL}" style="color:white; background:green; padding:10px; text-decoration:none;">
            تأكيد الحساب
            </a>
         `
        })
        return res.json({
            message:"تم تسجيل مستخدم جديد بنجاح",
            error:false,
            success:true,
            data:save
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false 
        })
    }
}

export async function verifyEmailController(req, res) {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "رمز التحقق مفقود",
        error: true,
        success: false
      });
    }

    const user = await UserModel.findById(code);

    if (!user) {
      return res.status(400).json({
        message: "رمز تحقق غير صالح",
        error: true,
        success: false
      });
    }

    if (user.verify_email) {
      return res.status(400).json({
        message: "تم تأكيد البريد مسبقًا",
        error: true,
        success: false
      });
    }

    user.verify_email = true;
    await user.save();

    return res.json({
      message: "✅ تم تأكيد البريد الإلكتروني بنجاح",
      success: true,
      error: false
    });

  } catch (error) {
    console.error("❌ Email Verification Error:", error);
    return res.status(500).json({
      message: error.message || "حدث خطأ أثناء تأكيد البريد",
      error: true,
      success: false
    });
  }
}

export async function loginController(req,res){
    try{
        const {email,password}=req.body
        if(!email || !password){
            return res.json({
                message:"الرجاء ادخال الايميل وكلمه المرور",
                error:true,
                success:false
            })
        }
        const user=await UserModel.findOne({email})
        if(!user){
           return res.status(400).json({
                message:"المستخدم غير مسجل ..",
                error:true,
                success:false
            }) 
        }
        const checkPassword=await bcryptjs.compare(password,user.password)
        if(!checkPassword){
             return res.status(400).json({
                message:"حاول مرة اخرى",
                error:true,
                success:false
            })
        }
        const accessToken=await generateAccessToken(user._id)
        const refreshToken=await generateRefreshToken(user._id)
        const cookiesOptions={
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }
        res.cookie('accessToken',accessToken,cookiesOptions)
        res.cookie('refreshToken',refreshToken,cookiesOptions)
        const updateUser=await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date:new Date()
        })
        return res.json({
            message:"تم تسجيل الدخول بنجاح",
            error:false,
            success:true,
            data:{
                accessToken,refreshToken
            }
        })

    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export async function logoutController(req,res){
    try{
        const userId=req.userId  // from midleware
        const cookiesOptions={
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }
        res.clearCookie("accessToken",cookiesOptions)
        res.clearCookie("refreshToken",cookiesOptions)
        const removeRefreshToken=await UserModel.findByIdAndUpdate(userId,{
            refresh_token:""
        })
        return res.json({
            message:"تم تسجيل الخروج بنجاح",
            error:false,
            success:true
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export async function updateuserDetails(req,res){
    try{
        const userId=req.userId    // auth middleware
        const {name,email,mobile,password}=req.body
        let hashPassword=""
        if(password){
            const salt=await bcryptjs.genSalt(10)
            hashPassword=await bcryptjs.hash(password,salt)
        }
        const updateuser=await UserModel.updateOne({_id:userId},{
            ...(name && {name:name}),
            ...(email && {email:email}),
            ...(mobile && {mobile:mobile}),
            ...(password && {password:hashPassword}),
        })
        return res.json({
            message:"تم تحديث بيانات المستخدم بنجاح",
            error:false,
            success:true,
            data:updateuser
        })

    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}


export async function forgotPasswordController(req,res){
    try{
        const {email} =req.body
        const user =await UserModel.findOne({email})
        if(!user){
            return res.json({
                message:"الايميل غير متاح..",
                error:true,
                success:false
            })
        }
        const otp=generateOTP()
        const expiryTime=new Date(Date.now()+60*60*1000)
        const update=await UserModel.findByIdAndUpdate(user._id,{
           forgot_password_otp:otp,
           forgot_password_expiry:new Date(expiryTime).toISOString()
        })
        await sendEmail({
            sendTo:email,
            subject:"استعادة كلمة المرور",
            html:
            `
            <div>
                <p> Dear , ${user.name} </p>
                <p>
                لقد طلبت  إعادة تعيين كلمة المرور. يُرجى استخدام الرمز  التالي لإعادة تعيين كلمة المرور
                . </p>
                <div style="background : yellow; font-size :20px">${otp}</div>
                <p>
                هذه الرمز صالح لمدة ساعة واحدة فقط. أدخلها في موقع سبيكرتوم الإلكتروني لإعادة تعيين كلمة المرور
                </p>
                <br/></br>
                <p>شكراً لك .. </p><p>شركة سبكتروم للحلول الصوتيه</p>
            </div>

            `
        })
        return res.json({
            message:"افحص الايميل الخاص بك !",
            error:false,
            success:true
        })



    }catch(error){
        return res.status(500).json({
            message:error.message || error ,
            error:true,
            success:false
        })
    }
}

export async function verifyForgotPasswordOTP(req,res){
    try{
        const {email,otp}=req.body
        if(!email,!otp){
            return res.status(400).json({
                message:"ادخل الحقول المطلوبة..الايميل ورمز التحقق",
                error:true,
                success:false
            })
        }
        const user=await UserModel.findOne({email})
        if(!user){
            return res.status(400).json({
                message:"..الايميل غير متاح..",
                error:true,
                success:false
            })
        }
        const currentTime=new Date().toISOString()
        if(user.forgot_password_expiry<currentTime){
            return res.status(400).json({
                message:"انتهت صلاحيه رمز التحقق",
                error:true,
                success:false
            })
        }
        if(otp !== user.forgot_password_otp){
            return res.status(400).json({
                message:"تاكد من رمز التحقق ..",
                error:true,
                success:false
            })
        }
         const updateUser=await UserModel.findByIdAndUpdate(user._id,{
           forgot_password_otp:"",
           forgot_password_expiry:""
        })
        return res.json({
            message:"تم تاكيد رمز التحقق بنجاح..",
            error:false,
            success:true
        })
       
   } catch(error){
    return res.status(500).json({
        message:error.message || error,
        error:true,
        success:false
    })
   }
}
export async function resetPassword(req,res){
    try{
        
        const {email,newPassword,confirmPassword}=req.body
        if(!email || !newPassword || !confirmPassword){
            return res.status(400).json({
                message:"ادخل الحقول المطلوبه ..",
                error:true,
                success:false
            })
        }

        const user=await UserModel.findOne({email})
        
        if(!user){
                return res.status(400).json({
                    message:"الايميل غير متاح..",
                    error:true,
                    success:false
                })
        }
        if(newPassword !== confirmPassword){
           return res.status(400).json({
                    message:"تاكد من تطابق كلمة المرور ..",
                    error:true,
                    success:false
                })  
        }
       const salt=await bcryptjs.genSalt(10)
        const hashPassword=await bcryptjs.hash(newPassword,salt)
        const update=await UserModel.findOneAndUpdate({_id:user._id},{
            password:hashPassword
        })
        return res.json({
            message:"تم تحديث كلمه المرور بنجاح..",
            error:false,
            success:true
        })

    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export async function refreshToken(req,res){
    try{
        const refreshToken=req.cookies.refreshToken || 
        req?.header?.authorization?.split(" ")[1]
        if(!refreshToken){
            return res.status(401).json({
                message:"invalide token..",
                error:true,
                success:false
            })
        }
        const verifyToken=await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)
        if(!verifyToken){
            return res.status(401).json({
                message:"token is expire , login again",
                error:true,
                success:false
            })
        }
        const userId=verifyToken?._id
        const newAccessToken=await generateAccessToken(userId)
        const cookiesOptions={
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }
        res.cookie('accessToken',newAccessToken,cookiesOptions)
        return res.status(200).json({
            message:"new access token generated",
            error:false,
            success:true
        })
    }catch(error){
        return res.status(500).json({
           message:error.message || error ,
           error:true,
           success:false 
        })
    }
}

export async function userDetails(req,res){
    try{
        const userId=req.userId  // middleware
        const user=await UserModel.findById(userId).select('-password -refresh_token')
        
        return res.json({
            message:'user Details',
            data:user,
            error:false,
            success:true
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}


