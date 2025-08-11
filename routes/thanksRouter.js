import express from "express";
import {
  getActiveThanksImages,
  addThanksImage,
  toggleImageActive
} from "../controller/thanksController.js";

const thanksRouter = express.Router();

thanksRouter.get("/get", getActiveThanksImages);
thanksRouter.post("/add", addThanksImage);
thanksRouter.patch("/toggle/:id", toggleImageActive);

export default thanksRouter;
