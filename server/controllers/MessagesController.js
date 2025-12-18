import Message from "../models/messageModel.js";
import {mkdirSync, renameSync} from "fs"
export const getMessages = async (req, res) => {
    try {
      const user1 = req.userId;
      const user2 = req.body.id;

      if(!user2 || !user2) { 
        return res.status(400).send("both User id's are required");
      }
      
      const messages = await Message.find(
        {
            $or:[
                {sender:user1,recipient:user2},
                {sender:user2,recipient:user1},
            ]
        }
      ).sort({timestamp: 1});
      return res.status(200).json({ messages });
    } catch (error) {
      console.error("Error in get messages controller:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  export const uploadFile = async (req, res) => {
    try {
      // console.log("request", req.file);
      if(!req.file) {
        return res.status(400).send("There is no file to upload.");
      }

      const date = Date.now();
      let fileDir = `uploads/files/${date}`
      let fileName = fileDir + "/" + req.file.originalname;

      mkdirSync(fileDir, {recursive: true});
      
      renameSync(req.file.path,fileName);
      return res.status(200).json({ filePath: fileName });

    } catch (error) {
      console.log("error in uploadFile controller:", error);
      return res.status(500).send("Internal server error");
    }
  }

  export const deleteMessage = async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.userId;

      if (!messageId) {
        return res.status(400).send("Message ID is required");
      }

      const message = await Message.findById(messageId);

      if (!message) {
        return res.status(404).send("Message not found");
      }

      // Check if the user is the sender of the message
      if (message.sender.toString() !== userId) {
        return res.status(403).send("You can only delete your own messages");
      }

      // Soft delete: mark as deleted instead of removing from database
      message.isDeleted = true;
      message.deletedAt = new Date();
      await message.save();

      return res.status(200).json({ message: "Message deleted successfully", messageId });
    } catch (error) {
      console.log("error in deleteMessage controller:", error);
      return res.status(500).send("Internal server error");
    }
  }
