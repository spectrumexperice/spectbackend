import express from "express";
import subscribeController from "../controller/subscripe.js";
const subscripRouter=express.Router()
subscripRouter.post("/sub",subscribeController)
export default subscripRouter