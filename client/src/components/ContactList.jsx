import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
// import { Avatar } from "@radix-ui/react-avatar";
import React from "react";
import { Avatar, AvatarImage } from "./ui/avatar";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatType,
    setSelectedChatType,
    setSelectedChatMessages,
    selectedChatData,
    setSelectedChatData,
  } = useAppStore();

  const handleClick = (contact) => {
    if (isChannel) {
      setSelectedChatType("channel");
    } else {
      setSelectedChatType("contact");
    }

    // console.log("contact",contact)
    setSelectedChatData(contact);
    // console.log("selectedChatData", selectedChatData);
    if (selectedChatData && selectedChatData._id === contact._id) {
      setSelectedChatMessages([]);
    }
  };
  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className={`pl-10 py-2  transition-all duration-300 cursor-pointer ${
            selectedChatData && selectedChatData._id === contact._id
              ? "bg-[#8417ff] hover:bg-[$8417ff] "
              : "hover:bg-[#f1f1f111]"
          }`}
          onClick={() => {
            handleClick(contact);
          }}
        >
          <div className="flex gap-3 items-center justify-start text-neutral-300 ">
            {!isChannel && (
              <Avatar className="h-10 w-10  rounded-full  overflow-hidden ">
                {contact.image ? (
                  <AvatarImage
                    src={`${HOST}/${contact.image}`}
                    alt="profile"
                    className="object-cover w-10 h-10 bg-black rounded-full  "
                  />
                ) : (
                  <div
                    className={`
                        ${
                          selectedChatData &&
                          selectedChatData._id === contact._id
                            ? "bg-[#ffffff22] border border-white/70 "
                            : getColor(contact.color)
                        }
                        uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full `}
                  >
                    <p className="text-pink-300">
                      {contact?.firstName
                        ? contact?.firstName.split("").shift()
                        : contact?.email.split("").shift()}
                    </p>
                  </div>
                )}
              </Avatar>
            )}
            {isChannel && (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
            {isChannel ? (
              <span>{contact.name} </span>
            ) : (
              <span>{contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.email}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
