import express from 'express'
import sendDetailedMessage from '../controller/sendMessageCapitalController.js'
import upload from '../middleware/multer.js'
const messageCapitalRouter=express.Router()

messageCapitalRouter.post('/send',upload.array('attachments'),sendDetailedMessage)
export default messageCapitalRouter