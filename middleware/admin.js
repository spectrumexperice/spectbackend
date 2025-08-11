 const isAdmin=(req,res,next)=>{
    if(req.userRole !== "ADMIN"){ // from middleware auth
        return res.status(403).json({
            message:"ليس لديك الصلاحيه ..",
            error:true,
            success:false
        })
    }
    next()
}
export default isAdmin