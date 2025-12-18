import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();
  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });


      //listening for incoming messages
      const handleRecieveMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage,addContactsInDmContacts } =
          useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          addMessage(message);
        }

        addContactsInDmContacts(message)
      };



      // listening for incoming channel messages
      const handleRecieveChannelMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage ,addChannelInChannelList} =
          useAppStore.getState();
        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message)
        }

        addChannelInChannelList(message);
      };

      // Handle online users
      const handleOnlineUsers = (users) => {
        const { setOnlineUsers } = useAppStore.getState();
        setOnlineUsers(users);
      };

      const handleUserOnline = (userId) => {
        const { addOnlineUser } = useAppStore.getState();
        addOnlineUser(userId);
      };

      const handleUserOffline = (userId) => {
        const { removeOnlineUser } = useAppStore.getState();
        removeOnlineUser(userId);
      };

      // Handle typing indicators
      const handleUserTypingStart = (userId) => {
        const { setTypingUser } = useAppStore.getState();
        setTypingUser(userId, true);
      };

      const handleUserTypingStop = (userId) => {
        const { setTypingUser } = useAppStore.getState();
        setTypingUser(userId, false);
      };

      // Handle message deletion
      const handleMessageDeleted = ({ messageId }) => {
        const { deleteMessage } = useAppStore.getState();
        deleteMessage(messageId);
      };




      
      socket.current.on("recieveMessage", handleRecieveMessage);

      socket.current.on("recieve-channel-message", handleRecieveChannelMessage);

      // Online status listeners
      socket.current.on("online-users", handleOnlineUsers);
      socket.current.on("user-online", handleUserOnline);
      socket.current.on("user-offline", handleUserOffline);

      // Typing indicator listeners
      socket.current.on("user-typing-start", handleUserTypingStart);
      socket.current.on("user-typing-stop", handleUserTypingStop);

      // Message deletion listener
      socket.current.on("message-deleted", handleMessageDeleted);

      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
