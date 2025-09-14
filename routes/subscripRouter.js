import express from "express";
import subscribeController from "../controller/subscripe.js";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/admin.js";
import { getSubscribers ,deleteSubscriber} from "../controller/subscripe.js";
const subscripRouter=express.Router()
subscripRouter.post("/subscribe",subscribeController)
subscripRouter.get("/all", auth, isAdmin, getSubscribers);
subscripRouter.delete("/:id", auth, isAdmin, deleteSubscriber);
export default subscripRouter