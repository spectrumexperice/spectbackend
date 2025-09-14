import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';

const auth = async (req, res, next) => {
    try {
        // 1. الحصول على التوكن من مصادر مختلفة
        const token = req.cookies?.accessToken || 
                     req?.headers?.authorization?.replace('Bearer ', '') 
                    

        if (!token) {
            return res.status(401).json({
                message: "مطلوب توكن دخول للوصول إلى هذا المورد",
                error: true,
                success: false
            });
        }

        // 2. التحقق من صحة التوكن
        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
        
        if (!decoded?.id) {
            return res.status(401).json({
                message: "توكن دخول غير صالح أو منتهي الصلاحية",
                error: true,
                success: false
            });
        }

        // 3. البحث عن المستخدم في قاعدة البيانات
        const user = await UserModel.findById(decoded.id||decoded._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                message: "المستخدم غير موجود في النظام",
                error: true,
                success: false
            });
        }

        // 4. إضافة معلومات المستخدم إلى الطلب
        req.userId = user._id,
        req.userRole = user.role,
           
        
            // يمكن إضافة المزيد من الحقول حسب الحاجة
        

        next();
    } catch (error) {
        // معالجة أنواع الأخطاء المختلفة
        let message = "خطأ في المصادقة";
        let statusCode = 500;

        if (error instanceof jwt.TokenExpiredError) {
            message = "انتهت صلاحية توكن الدخول";
            statusCode = 401;
        } else if (error instanceof jwt.JsonWebTokenError) {
            message = "توكن دخول غير صالح";
            statusCode = 401;
        }

        return res.status(statusCode).json({
            message: message,
            error: true,
            success: false,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default auth;