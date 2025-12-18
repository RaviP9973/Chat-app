import { Server as SocketIoServer } from "socket.io";
import Message from "./models/messageModel.js";
import Channel from "./models/channelModel.js";

const setupSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  //disconnect functionality to remove user from userSocketMap when user disconnects.
  const disconnect = (socket, userId) => {
    console.log(`User ${userId} disconnected`);
    // for (const [userId, socketId] of userSocketMap.entries()) {
    //   if (socketId === socket.id) {
    //     userSocketMap.delete(userId);
    //     break;
    //   }
    // }
    userSocketMap.delete(userId);
  };

  // send message functionality to send messages to other users.
  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipentSocketId = userSocketMap.get(message.recipient);

    const createdMessage = await Message.create(message);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "id email firstName lastName image color"
        }
      })
      .exec();

    if (recipentSocketId) {
      // console.log("inside recipentSocketId");
      io.to(recipentSocketId).emit("recieveMessage", messageData);
    }

    if (senderSocketId) {
      // console.log("inside senderSocketId");
      io.to(senderSocketId).emit("recieveMessage", messageData);
    }
  };

  // send message functionality to send messages to channels.
  const sendMessageToChannel = async (message) => {
    const { channelId, sender, content, messageType, fileUrl, replyTo } = message;

    // Create message and update channel in parallel
    const [createdMessage, channel] = await Promise.all([
      Message.create({
        sender,
        recipient: null,
        content,
        messageType,
        timestamp: new Date(),
        fileUrl,
        replyTo,
      }),
      Channel.findById(channelId).populate("members")
    ]);

    // Get populated message data
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "id email firstName lastName image color"
        }
      });

    // Update channel messages array
    await Channel.findByIdAndUpdate(channelId, { 
      $push: {messages: createdMessage._id}
    });

    const finalData = { ...messageData._doc, channelId: channel._id };

    if (channel?.members) {
      // Get all socket IDs including admin
      const socketIds = channel.members
        .map(member => userSocketMap.get(member._id.toString()))
        .concat(userSocketMap.get(channel.admin._id.toString()))
        .filter(Boolean);

      // Emit to all sockets in one go
      socketIds.forEach(socketId => {
        io.to(socketId).emit("recieve-channel-message", finalData);
      });
    }
  };

  io.on("connection", (socket) => {
    console.log("New socket connection");
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} connected`);
      
      // Broadcast to all users that this user is now online
      io.emit("user-online", userId);
    } else {
      console.log("User ID not provided");
    }

    //send messages functionality
    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendMessageToChannel);

    // Handle typing indicator
    socket.on("typing-start", ({ recipientId }) => {
      const recipientSocketId = userSocketMap.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user-typing-start", userId);
      }
    });

    socket.on("typing-stop", ({ recipientId }) => {
      const recipientSocketId = userSocketMap.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user-typing-stop", userId);
      }
    });

    // Handle message deletion
    socket.on("delete-message", async ({ messageId, recipientId, channelId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message && message.sender.toString() === userId) {
          message.isDeleted = true;
          message.deletedAt = new Date();
          await message.save();

          // Emit to recipient in DM
          if (recipientId) {
            const recipientSocketId = userSocketMap.get(recipientId);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit("message-deleted", { messageId });
            }
          }

          // Emit to channel members
          if (channelId) {
            const channel = await Channel.findById(channelId).populate("members");
            if (channel?.members) {
              const socketIds = channel.members
                .map(member => userSocketMap.get(member._id.toString()))
                .concat(userSocketMap.get(channel.admin._id.toString()))
                .filter(Boolean);

              socketIds.forEach(socketId => {
                io.to(socketId).emit("message-deleted", { messageId });
              });
            }
          }

          // Emit back to sender
          const senderSocketId = userSocketMap.get(userId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("message-deleted", { messageId });
          }
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    // Send list of online users to the newly connected user
    socket.emit("online-users", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {
      disconnect(socket, userId);
      // Broadcast to all users that this user is now offline
      io.emit("user-offline", userId);
    });
  });
};

export default setupSocket;
