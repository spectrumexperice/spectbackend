import express from 'express'
import upload from '../middleware/multer.js'
import auth from '../middleware/auth.js'

import { addPartner,getAllPartners,updatePartner,deletePartner, getSinglePartner } from '../controller/partnerController.js'
import isAdmin from '../middleware/admin.js'

const partnerRouter=express.Router()

partnerRouter.post('/add',auth ,isAdmin,upload.single("image"),addPartner)
partnerRouter.get("/getall",getAllPartners)
partnerRouter.get("/get/:id", getSinglePartner);
partnerRouter.patch("/update/:id",auth,isAdmin,updatePartner)
partnerRouter.delete("/delete/:id",auth,isAdmin,deletePartner)

export default partnerRouter