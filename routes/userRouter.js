import {Router} from 'express'
import { forgotPasswordController, loginController, logoutController, refreshToken, registerUserController, resetPassword, updateuserDetails, userDetails, verifyEmailController, verifyForgotPasswordOTP } from '../controller/user.controller.js'
import auth from '../middleware/auth.js'
const userRouter=Router()
userRouter.post('/register',registerUserController)
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/login',loginController)
userRouter.get('/logout',auth,logoutController)
userRouter.put('/update-user',auth,updateuserDetails)
userRouter.put('/forgot-password',forgotPasswordController)
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOTP)
userRouter.put('/reset-password',resetPassword)
userRouter.put('/refresh-token',refreshToken)
userRouter.get('/user-details',auth,userDetails)


export default userRouter