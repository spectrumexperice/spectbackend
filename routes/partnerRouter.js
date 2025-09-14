import express from 'express'
import upload from '../middleware/multer.js'
import auth from '../middleware/auth.js'

import { addPartner,getAllPartners,updatePartner,deletePartner, getSinglePartner } from '../controller/partnerController.js'
import isAdmin from '../middleware/admin.js'

const partnerRouter=express.Router()


partnerRouter.post(
  '/add',
  auth,
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "thankImage", maxCount: 1 }
  ]),
  addPartner
);
partnerRouter.get("/getall",getAllPartners)
partnerRouter.get("/get/:id", getSinglePartner);
partnerRouter.patch(
  "/update/:id",
  auth,
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "thankImage", maxCount: 1 }
  ]),
  updatePartner
);

partnerRouter.delete("/delete/:id",auth,isAdmin,deletePartner)

export default partnerRouter