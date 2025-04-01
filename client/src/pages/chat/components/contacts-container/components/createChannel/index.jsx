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
import {
  CREATE_CHANNEL_ROUTE,
  GET_ALL_CONTACTS_ROUTE,
} from "@/utils/constants";
import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
  const { setSelectedChatType, setSelectedChatData, addChannel } =

    useAppStore();

  const [newChannelModal, setnewChannelModal] = useState(false);
  //   const [searchTerm, setSearchTerm] = useState("");
  //   const [searchedContacts, setSearchedContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE, {
          withCredentials: true,
        });
        // console.log("response: ", response);
        if (response.status === 200 && response.data.contacts) {
          setAllContacts(response.data.contacts);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getData();
  }, []);

  const createChannel = async () => {
    try {
      if (!channelName || selectedContacts.length === 0) {
        alert("Please fill up all required fields");
      } else {
        const response = await apiClient.post(CREATE_CHANNEL_ROUTE, {
          name:channelName,
          members: selectedContacts.map((contact) => contact.value),
        },{
            withCredentials: true,
        });

        if(response.status === 201 && response.data) {
            setChannelName("");
            setSelectedContacts([]);
            setnewChannelModal(false);
            addChannel(response.data.channel);
        }
      }
    } catch (error) {}
  };

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light top-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setnewChannelModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            {/* Add member in case of adding a new member */}
            Create new Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={newChannelModal} onOpenChange={setnewChannelModal}>
        <DialogTrigger></DialogTrigger>
        <DialogContent
          className={
            "bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col"
          }
        >
          <DialogHeader>
            <DialogTitle>
              Please fill up the details for new channel{" "}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none "
              // value should be fixed to channel name in case of adding a new member
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>
          <div>
            <MultipleSelector
              className={`rounded-lg  bg-[#2c2e3b] border-none py-2 text-white `}
              defaultOptions={allContacts}
              placeholder="Search Contacts"
              // show contacts that are not already in the channel 
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600">
                  No Results found.
                </p>
              }
            />
          </div>
          <div>
            <Button
              className={`w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300  `}
              onClick={createChannel}
            >
              {/* add member in case of adding a new member */}
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateChannel;
