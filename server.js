// server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/database.js'
import userRouter from './routes/userRouter.js'
import messageRouter from './routes/messageRouter.js'
import partnerRouter from './routes/partnerRouter.js'
import subscripRouter from './routes/subscripRouter.js'
import messageCapitalRouter from './routes/MessageCapitalRouter.js'
import workRouter from './routes/WorkImgRouter.js'
import MessageAdmin from './routes/MsgAdminRouter.js'
import productRouter from './routes/productRouter.js'
dotenv.config()

const app=express()
const PORT =process.env.PORT || 8080


// Middleware

app.use(cors({
 credentials:true,
    origin:process.env.FRONTEND_URL
}
   

))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(helmet({
    crossOriginEmbedderPolicy:false
}))

// connect  to MongoDB

connectDB()

//sample  routre to test 

app.get("/",(req,res)=>{
    res.json("API is Running ...")
})
app.get('/ip', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('🚀 Railway IP:', clientIp);
  res.json({ ip: clientIp });
});


app.use('/api/user',userRouter)
app.use('/api/partner',partnerRouter)
app.use('/api/message',messageRouter)
app.use('/api/messageCapital',messageCapitalRouter)
app.use('/api/subscripe',subscripRouter)
app.use('/api/work',workRouter)
app.use('/api/MsgAdmin',MessageAdmin)
app.use('/api/Product',productRouter)
app.listen(PORT,()=>{  
    console.log(`server running on http://localhost:${PORT}`)
})