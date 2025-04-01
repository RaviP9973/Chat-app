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


      //i will use it when i have to show online status in chat list
      
      // socket.current.on("connect", () => {
      //   // console.log("Connected to the socket server");
      // });

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




      
      socket.current.on("recieveMessage", handleRecieveMessage);

      socket.current.on("recieve-channel-message", handleRecieveChannelMessage);

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
