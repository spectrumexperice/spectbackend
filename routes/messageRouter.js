import express from 'express'
import SendMessage from '../controller/sendMessage.js'

const messageRouter=express.Router()

messageRouter.post('/send',SendMessage)
export default messageRouter