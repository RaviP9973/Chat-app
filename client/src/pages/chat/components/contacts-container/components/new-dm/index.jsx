import React, { useCallback, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Lottie from "lottie-react";
import animationData from "@/assets/searchContactsAnimation";
import { HOST, SEARCH_CONTACTS_ROUTE } from "@/utils/constants";
import apiClient from "@/lib/api-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { getColor } from "@/lib/utils";

const NewDm = () => {
  const { setSelectedChatType, setSelectedChatData } = useAppStore();

  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedContacts, setSearchedContacts] = useState([]);

  // serach contacts using debounce
  const searchContact = useCallback(async (search) => {
    if (!search.trim()) return; // Ignore empty input
    // console.log("Searching contacts... ", search);

    try {
      const response = await apiClient.post(
        SEARCH_CONTACTS_ROUTE,
        { searchTerm: search },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.contacts) {
        setSearchedContacts(response.data.contacts);
       
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.error("Error searching contacts:", error);
    }
  }, []); // Memoize the function

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchedContacts([]); // Clear results if search is empty
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      searchContact(searchTerm);
    }, 500); // Reduced delay for better responsiveness

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchContact]); // Add `searchContact` to dependencies

  const selectNewContact = (contact) => {
    setOpenNewContactModal(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSearchedContacts([]);
  };
  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light top-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setOpenNewContactModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            Select new Contact
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogTrigger></DialogTrigger>
        <DialogContent
          className={
            "bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col"
          }
        >
          <DialogHeader>
            <DialogTitle>Please Select a contact</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Search Contacts"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchedContacts.length > 0 && (
            <ScrollArea className="max-h-[250px] ">
              <div className="flex flex-col gap-5">
                {searchedContacts.map((contacts,index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-center cursor-pointer"
                    onClick={() => selectNewContact(contacts)}
                  >
                    <div className="w-12 h-12 relative">
                      <Avatar className="h-12 w-12  rounded-full overflow-hidden ">
                        {contacts.image ? (
                          <AvatarImage
                            src={`${HOST}/${contacts.image}`}
                            alt="profile"
                            className="object-cover w-12 h-12 bg-black rounded-full "
                          />
                        ) : (
                          <div
                            className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                              contacts.color
                            )}`}
                          >
                            <p className="text-pink-300">
                              {contacts?.firstName
                                ? contacts?.firstName.split("").shift()
                                : contacts?.email.split("").shift()}
                            </p>
                          </div>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex flex-col">
                      <span>
                        {contacts.firstName && contacts.lastName
                          ? `${contacts.firstName} ${contacts.lastName}`
                          : `${contacts.email}`}
                      </span>
                      <span className="text-xs">{contacts.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {searchedContacts.length <= 0 && (
            <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center  transition-all duration-1000">
              <Lottie
                animationData={animationData}
                loop
                autoplay
                style={{ height: 150, width: 200 }}
              />
              <div className="text-opacity-80 text-white flex flex-col gap-5 items-center  text-xl lg:text-2xl transition-all duration-300 text-center">
                <h3 className="poppins-medium">
                  Hi<span className="text-purple-500 ">!</span> Search new
                  <span className="text-purple-500"> Contact</span>
                  <span className="text-purple-500 ">.</span>
                </h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewDm;
