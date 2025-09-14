import express from "express";
import auth from '../middleware/auth.js'
import isAdmin from '../middleware/admin.js'
import upload from "../middleware/multer.js";
import { addWork,getWorks,deleteWork } from "../controller/work.controller.js";

const workRouter = express.Router();

workRouter.post("/add", auth, isAdmin, upload.single("image"), addWork);
workRouter.get("/getall", getWorks);
workRouter.delete("/delete/:id", auth, isAdmin, deleteWork);


export default workRouter;
