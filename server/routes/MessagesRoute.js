import { Router } from "express";
import { getMessages, uploadFile } from "../controllers/MessagesController.js";
import { verifyToken  } from "../middleware/AtuhMiddleware.js";
import multer from "multer";

const messageRoutes = Router();

messageRoutes.post("/get-messages", verifyToken,getMessages)
const upload = multer({dest: "uploads/files"})

messageRoutes.post("/upload-file", verifyToken, upload.single("file"), uploadFile)

export default messageRoutes;