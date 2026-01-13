import mongoose, { mongo } from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: false,
  },
  messageType: {
    type: String,
    required: true,
    enum: ["text", "file"],
  },
  content: {
    type: String,
    required: function () {
      return this.messageType === "text";
    },
  },
  iv: {
    type: String,
    required: function () {
      return this.messageType === "text";
    }
  },
  authTag: {
    type: String,
    required: function () {
      return this.messageType === "text";
    }
  },
  fileUrl: {
    type: String,
    required:function(){
        return this.messageType === "file";
    }
  },
  timestamp:{
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null,
  },

});


const Message = mongoose.model("Message",messageSchema);
export default Message;