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
    const { channelId, sender, content, messageType, fileUrl } = message;

    // Create message and update channel in parallel
    const [createdMessage, channel] = await Promise.all([
      Message.create({
        sender,
        recipient: null,
        content,
        messageType,
        timestamp: new Date(),
        fileUrl,
      }),
      Channel.findById(channelId).populate("members")
    ]);

    // Get populated message data
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color");

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
    } else {
      console.log("User ID not provided");
    }

    //send messages functionality
    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendMessageToChannel);

    socket.on("disconnect", (socket) => {
      disconnect(socket, userId);
    });
  });
};

export default setupSocket;
