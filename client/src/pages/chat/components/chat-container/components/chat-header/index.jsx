import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import React, { useEffect } from "react";
import { RiCloseFill } from "react-icons/ri";
import { CiCirclePlus } from "react-icons/ci";
import NewDm from "../../../contacts-container/components/new-dm";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType, onlineUsers, typingUsers } = useAppStore();
  
  const isOnline = selectedChatType === "contact" && onlineUsers.includes(selectedChatData?._id);
  const isTyping = selectedChatType === "contact" && typingUsers[selectedChatData?._id];

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20 ">
      <div className="flex gap-5 items-center justify-between w-full">
        <div className="flex gap-3 items-center justify-center">
          <div className="flex gap-3 items-center cursor-pointer">
            <div className="w-12 h-12 relative">
              {selectedChatType === "contact" ? (
                <Avatar className="h-12 w-12  rounded-full overflow-hidden ">
                  {selectedChatData?.image ? (
                    <AvatarImage
                      src={`${HOST}/${selectedChatData.image}`}
                      alt="profile"
                      className="object-cover w-12 h-12 bg-black rounded-full "
                    />
                  ) : (
                    <div
                      className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                        selectedChatData.color
                      )}`}
                    >
                      <p className="text-pink-300">
                        {selectedChatData?.firstName
                          ? selectedChatData?.firstName.split("").shift()
                          : selectedChatData?.email.split("").shift()}
                      </p>
                    </div>
                  )}
                </Avatar>
              ) : (
                <div className="bg-[#ffffff22] h-12 w-12 flex items-center justify-center rounded-full">
                  #
                </div>
              )}
              {/* Online Status Indicator */}
              {selectedChatType === "contact" && (
                <div
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1c1d25] ${
                    isOnline ? "bg-green-500" : "bg-gray-500"
                  }`}
                  title={isOnline ? "Online" : "Offline"}
                />
              )}
            </div>
            <div className="flex flex-col">
              {selectedChatType === "channel" && selectedChatData.name}
              {selectedChatType === "contact" && (
                <>
                  <span>
                    {selectedChatData.firstName && selectedChatData.lastName
                      ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                      : `${selectedChatData.email}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {isTyping ? "typing..." : isOnline ? "Online" : "Offline"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5">
          <button
            className="text-neutral-500 hover:text-white focus:outline-none transition-colors duration-300"
            onClick={closeChat}
            aria-label="Close chat"
          >
            <RiCloseFill className="text-3xl" />
          </button>

          {selectedChatType === "channel" && (
            // <Button 
            //   className="text-white hover:text-white/80 focus:outline-none transition-colors duration-300 flex items-center gap-2 "
            //   aria-label="Add member to channel"
            //   onClick={handleAddMember}
            // >
            //   <span>Add Member</span>
            //   <CiCirclePlus className="text-3xl" />
            // </Button>
            <NewDm isChannelHeader={true} channelId={selectedChatData._id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
