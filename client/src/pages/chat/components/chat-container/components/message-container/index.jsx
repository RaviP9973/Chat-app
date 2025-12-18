import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import {
  GET_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES_ROUTE,
  HOST,
} from "@/utils/constants";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { FiTrash2 } from "react-icons/fi";
import { BsReply } from "react-icons/bs";
import { useSocket } from "@/context/SocketContext";

const MessageContainer = () => {
  const socket = useSocket();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    isDownloading,
    setIsDownloading,
    setFileDownloadProgress,
    typingUsers,
    setReplyingTo,
  } = useAppStore(); //appstore
  const scrollRef = useRef();

  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // Check if the selected user is typing
  const isTyping =
    selectedChatType === "contact" && typingUsers[selectedChatData?._id];

  // Handle message deletion
  const handleDeleteMessage = (messageId) => {
    if (socket && selectedChatData) {
      const recipientId = selectedChatType === "contact" ? selectedChatData._id : null;
      const channelId = selectedChatType === "channel" ? selectedChatData._id : null;
      
      socket.emit("delete-message", {
        messageId,
        recipientId,
        channelId,
      });
    }
  };

  // Handle reply
  const handleReplyMessage = (message) => {
    setReplyingTo(message);
  };

  // download file and image function
  const downloadFile = async (url) => {
    try {
      setIsDownloading(true);
      setFileDownloadProgress(0);
      const res = await apiClient.get(`${HOST}/${url}`, {
        responseType: "blob",
        onDownloadProgress: (progress) => {
          const progressPercentage = Math.round(
            (progress.loaded / progress.total) * 100
          );
          setFileDownloadProgress(progressPercentage);
        },
      });
      const urlBlob = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", url.split("/").pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);
      setIsDownloading(false);
      setFileDownloadProgress(0);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;
    // console.log("selected chat messages", selectedChatMessages);
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2 ">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const renderDMMessages = (message) => {
    // console.log("message.messageType", message.messageType);
    const isOwnMessage = message.sender !== selectedChatData._id;

    if (message.isDeleted) {
      return (
        <div
          className={`${isOwnMessage ? "text-right" : "text-left"}`}
        >
          <div className="bg-[#2a2b33]/50 text-gray-500 italic border border-gray-600 inline-block p-4 rounded my-1 max-w-[50%] break-words whitespace-normal">
            This message was deleted
          </div>
          <div className="text-xs text-gray-600">
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`${isOwnMessage ? "text-right" : "text-left"} group relative mb-2`}
        onMouseEnter={() => setHoveredMessageId(message._id)}
        onMouseLeave={() => setHoveredMessageId(null)}
      >
        {/* Reply preview */}
        {message.replyTo && (
          <div
            className={`text-xs mb-1 ${
              isOwnMessage ? "mr-2" : "ml-2"
            } inline-block max-w-[50%]`}
          >
            <div className="bg-[#1c1d25] border-l-2 border-[#8417ff] p-2 rounded opacity-70">
              <div className="text-gray-400 text-[10px]">
                {message.replyTo.sender?.firstName || "User"}
              </div>
              <div className="text-gray-300 truncate">
                {message.replyTo.content || "Attachment"}
              </div>
            </div>
          </div>
        )}

        <div className="relative inline-block">
          {/* Action buttons */}
          {hoveredMessageId === message._id && (
            <div
              className="absolute -top-2 -right-2 flex gap-1 bg-[#2a2b33] p-1 rounded shadow-lg z-10"
            >
              <button
                onClick={() => handleReplyMessage(message)}
                className="p-1.5 hover:bg-[#8417ff]/20 rounded transition-colors"
                title="Reply"
              >
                <BsReply className="text-sm text-gray-300" />
              </button>
              {isOwnMessage && (
                <button
                  onClick={() => handleDeleteMessage(message._id)}
                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete"
                >
                  <FiTrash2 className="text-sm text-red-400" />
                </button>
              )}
            </div>
          )}

          {/* message type is TEXT */}
          {message.messageType === "text" && (
            <div
              className={`${
                isOwnMessage
                  ? "bg-[#8417ff]/5  text-[#8417ff]/90 border-[#8417ff]/50 "
                  : "bg-[#212b33]/5  text-white/80 border-white/20 "
              } border inline-block p-4 rounded my-1  break-words whitespace-normal`}
            >
              {message.content}
            </div>
          )}

          {/* message type is FILE */}
          {message.messageType === "file" && (
            <div
              className={`${
                isOwnMessage
                  ? "bg-[#8417ff]/5  text-[#8417ff]/90 border-[#8417ff]/50 "
                  : "bg-[#212b33]/5  text-white/80 border-white/20 "
              } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
            >
              {checkIfImage(message.fileUrl) ? (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setShowImage(true);
                    setImageUrl(message.fileUrl);
                  }}
                >
                  <img
                    src={`${HOST}/${message.fileUrl}`}
                    alt="file"
                    className="h-[300px] w-[300px] object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                    <MdFolderZip />
                  </span>
                  <span>{message.fileUrl.split("/").pop()}</span>
                  <span
                    className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                    onClick={() => {
                      downloadFile(message.fileUrl);
                    }}
                  >
                    {" "}
                    <IoMdArrowRoundDown />{" "}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-600">
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    );
  };

  const renderChannelMessages = (message) => {
    const isOwnMessage = message.sender._id === userInfo.id;

    if (message.isDeleted) {
      return (
        <div
          className={`mt-5 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          <div className="bg-[#2a2b33]/50 text-gray-500 italic border border-gray-600 inline-block p-4 rounded my-1 max-w-[50%] break-words whitespace-normal ml-9">
            This message was deleted
          </div>
          {!isOwnMessage && (
            <div className="flex items-center justify-start gap-3">
              <Avatar className="h-8 w-8 rounded-full overflow-hidden">
                {message?.sender?.image && (
                  <AvatarImage
                    src={`${HOST}/${message?.sender?.image}`}
                    alt="profile"
                    className="object-cover w-12 h-12 bg-black rounded-full"
                  />
                )}
                <AvatarFallback
                  className={`uppercase h-8 w-8 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                    message?.sender?.color
                  )}`}
                >
                  {message.sender.firstName
                    ? message?.sender?.firstName.split("").shift()
                    : message?.sender?.email.split("").shift()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
              <span className="text-xs text-white/60">
                {moment(message.timestamp).format("LT")}
              </span>
            </div>
          )}
          {isOwnMessage && (
            <div className="text-xs text-white/60 mt-1">
              {moment(message.timestamp).format("LT")}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={`mt-5 ${
          isOwnMessage ? "text-right" : "text-left"
        } group relative mb-2`}
        onMouseEnter={() => setHoveredMessageId(message._id)}
        onMouseLeave={() => setHoveredMessageId(null)}
      >
        {/* Reply preview */}
        {message.replyTo && (
          <div
            className={`text-xs mb-1 ${
              isOwnMessage ? "mr-11" : "ml-11"
            } inline-block max-w-[50%]`}
          >
            <div className="bg-[#1c1d25] border-l-2 border-[#8417ff] p-2 rounded opacity-70">
              <div className="text-gray-400 text-[10px]">
                {message.replyTo.sender?.firstName || "User"}
              </div>
              <div className="text-gray-300 truncate">
                {message.replyTo.content || "Attachment"}
              </div>
            </div>
          </div>
        )}

        <div className="relative inline-block">
          {/* Action buttons */}
          {hoveredMessageId === message._id && (
            <div
              className="absolute -top-2 -right-2 flex gap-1 bg-[#2a2b33] p-1 rounded shadow-lg z-10"
            >
              <button
                onClick={() => handleReplyMessage(message)}
                className="p-1.5 hover:bg-[#8417ff]/20 rounded transition-colors"
                title="Reply"
              >
                <BsReply className="text-sm text-gray-300" />
              </button>
              {isOwnMessage && (
                <button
                  onClick={() => handleDeleteMessage(message._id)}
                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete"
                >
                  <FiTrash2 className="text-sm text-red-400" />
                </button>
              )}
            </div>
          )}

          {message.messageType === "text" && (
            <div
              className={`${
                isOwnMessage
                  ? "bg-[#8417ff]/5  text-[#8417ff]/90 border-[#8417ff]/50 "
                  : "bg-[#212b33]/5  text-white/80 border-white/20 "
              } border inline-block p-4 rounded my-1 max-w-[50%] break-words whitespace-normal ml-9`}
            >
              {message.content}
            </div>
          )}

          {/* message type is FILE */}
          {message.messageType === "file" && (
            <div
              className={`${
                isOwnMessage
                  ? "bg-[#8417ff]/5  text-[#8417ff]/90 border-[#8417ff]/50 "
                  : "bg-[#212b33]/5  text-white/80 border-white/20 "
              } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
            >
              {checkIfImage(message.fileUrl) ? (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setShowImage(true);
                    setImageUrl(message.fileUrl);
                  }}
                >
                  <img
                    src={`${HOST}/${message.fileUrl}`}
                    alt="file"
                    className="h-[300px] w-[300px] object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                    <MdFolderZip />
                  </span>
                  <span>{message.fileUrl.split("/").pop()}</span>
                  <span
                    className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                    onClick={() => {
                      downloadFile(message.fileUrl);
                    }}
                  >
                    {" "}
                    <IoMdArrowRoundDown />{" "}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {!isOwnMessage ? (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8  rounded-full overflow-hidden ">
              {message?.sender?.image && (
                <AvatarImage
                  src={`${HOST}/${message?.sender?.image}`}
                  alt="profile"
                  className="object-cover w-12 h-12 bg-black rounded-full "
                />
              )}

              <AvatarFallback
                className={`uppercase h-8 w-8 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                  message?.sender?.color
                )}`}
              >
                {message.sender.firstName
                  ? message?.sender?.firstName.split("").shift()
                  : message?.sender?.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60 ">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
            <span className="text-xs text-white/60 ">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>
        ) : (
          <div className="text-xs text-white/60 mt-1">
            {moment(message.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
    console.log("selectedChatMessages", selectedChatMessages);
  }, [selectedChatMessages]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );

        if (res.data.messages) {
          setSelectedChatMessages(res.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`,
          { withCredentials: true }
        );
         console.log("response of get channel messages", response);
        if(response.data.messages){
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log("error getting channel messages", error);
      }
    };
    if (selectedChatData._id) {
      if (selectedChatType === "contact") {
        getMessages();
      } else if (selectedChatType === "channel") {
        getChannelMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      {/* Typing Indicator */}
      {isTyping && selectedChatType === "contact" && (
        <div className="text-left mt-2">
          <div className="bg-[#212b33]/5 text-white/60 border border-white/20 inline-block px-4 py-2 rounded">
            <div className="flex items-center gap-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
            </div>
          </div>
        </div>
      )}
      <div ref={scrollRef}></div>
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img
              src={`${HOST}/${imageUrl}`}
              alt=""
              className="h-[80vh] w-full bg-cover"
            />
          </div>
          <div className="flex gap-5 top-0 mt-5 ">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                downloadFile(imageUrl);
              }}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                setShowImage(false);
                setImageUrl(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
