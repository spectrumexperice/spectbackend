import express from 'express'
import { getAllMessages,deleteMessage ,replyMessage,exportMessages} from '../controller/MessageAdmin.js'
import auth from '../middleware/auth.js'
import isAdmin from '../middleware/admin.js'

const MSGrouter =express.Router()

MSGrouter.get("/all",auth,isAdmin,getAllMessages)
MSGrouter.delete('/delete/:id/:type',auth,isAdmin,deleteMessage)
MSGrouter.post('/reply/:id/:type',auth,isAdmin,replyMessage)
MSGrouter.get("/export",auth,isAdmin,exportMessages)

export default MSGrouter