import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";

const MessageBar = () => {
  const [message, setMessage] = useState("");
  const emojiRef = useRef();
  const fileInputRef = useRef();


// app store hooks
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setIsUploading,
    setIsDownloading,
    setFileUploadProgress
  } = useAppStore();



  const socket = useSocket();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);


  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  // handle click outside emoji picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);


  // send message handlers
  const handleSendMessage = async () => {

    // single person chat 
    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });

    }


    // group chat 
    else if(selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        sender: userInfo.id,
        content: message,
        // recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData._id,
      })
    }
    
    setMessage("");
  };


  // attachment handlers
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };



  const handleAttachmentChange = async (e) => {
    try {

      //uploading file to servers
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);
        const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
          withCredentials: true,
          // tracking progress for file upload (optional)
          onUploadProgress: data => {
            setFileUploadProgress(Math.round((data.loaded / data.total) * 100));
          }
        });
        setIsUploading(false);

        if (response.status === 200 && response.data) {

          // single person chat file upload
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", {
              sender: userInfo.id,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: response.data.filePath,
            });
          }


          // group chat file upload 
          else if(selectedChatType === "channel") {
            

            socket.emit("send-channel-message", {
              sender: userInfo.id,
              content: undefined,
              // recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: response.data.filePath,
              channelId: selectedChatData._id,
            })

          }
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.log("Error while sedning file in chatbar", error);
    }
  };
  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        {/* input for sending text messages*/}
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
          placeholder="Enter Message"
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          value={message}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevent form submission
              handleSendMessage();
            }
          }}
        />

        {/* button for input */}
        <button
          className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-2xl" />
        </button>

          {/* input for sending files and images */}
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />

        {/* emoji picker */}
        <div className="ralative">
          <button
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            onClick={() => {
              setEmojiPickerOpen(true);
            }}
          >
            <RiEmojiStickerLine className="text-2xl" />
          </button>
          <div className="absolute bottom-16 right-0 " ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>

      </div>

      {/* send button */}
      <button
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5  focus:border-none focus:outline-none focus:text-white duration-300 transition-all hover:bg-[#741bda] focus:bg-[#741bda]"
        onClick={handleSendMessage}
      >
        <IoSend className="text-2xl" />
      </button>
    </div>
  );
};

export default MessageBar;
