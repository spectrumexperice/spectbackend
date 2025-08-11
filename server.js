// server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from '../backend/config/database.js'
import userRouter from './routes/userRouter.js'
import messageRouter from './routes/messageRouter.js'
import partnerRouter from './routes/partnerRouter.js'
import subscripeRouter from './routes/subscripRouter.js'
import messageCapitalRouter from './routes/MessageCapitalRouter.js'
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
app.listen(PORT,()=>{  
    console.log(`server running on http://localhost:${PORT}`)
})

app.use('/api/user',userRouter)
app.use('/api/partner',partnerRouter)
app.use('/api/message',messageRouter)
app.use('/api/messageCapital',messageCapitalRouter)
app.use('/api/subscripe',subscripeRouter)
