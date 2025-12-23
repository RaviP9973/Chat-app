import React, { useEffect } from "react";
import ProfileInfo from "./components/profile-inof";
import NewDm from "./components/new-dm";
import apiClient from "@/lib/api-client";
import { GET_DM_CONTACTS_ROUTE, GET_USER_CHANNELS_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "@/components/ContactList";
import CreateChannel from "./components/createChannel";

const ContactsContainer = () => {
  const { setDirectMessagesContacts, directMessagesContacts, channels ,setChannels} =
    useAppStore();
  useEffect(() => {
    const getContacts = async () => {
      try {
        const res = await apiClient.get(GET_DM_CONTACTS_ROUTE);
        if (res.data.contacts) {
          // console.log(res.data.contacts);
          setDirectMessagesContacts(res.data.contacts);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    const getChannels = async () => {
      try {
        // console.log("inside the get channels function");
        const res = await apiClient.get(GET_USER_CHANNELS_ROUTE);
        if (res.data.channels) {
          // console.log(res.data.contacts);
          setChannels(res.data.channels);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    getContacts();
    getChannels();
  }, [setChannels,setDirectMessagesContacts]);
  return (
    <div className="relative md:w-[25vw] lg:[30vw] xl:[20vw] bg-[#1b1c24] border-r-2 border-r-[#2f303b] w-full">
      <div className="pt-3">
        <Logo />
        <div className="my-5">
          <div className="flex items-center justify-between pr-10 ">
            <Title text="Direct Messages" />
            <NewDm />
          </div>
          <div className="max-h-[38vh] overflow-y-auto scrollbarHidden ">
            <ContactList contacts={directMessagesContacts} />
          </div>
        </div>
        <div className="my-5">
          <div className="flex items-center justify-between pr-10 ">
            <Title text="Channels" />
            <CreateChannel />
          </div>
          <div className="max-h-[38vh] overflow-y-auto scrollbarHidden ">
            <ContactList contacts={channels} isChannel={true}/>
          </div>
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
};

export default ContactsContainer;

const Logo = () => {
  return (
    <div className="flex p-5  justify-start items-center gap-2">
      <svg
        id="logo-38"
        width="78"
        height="32"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          className="ccustom"
          fill="#8338ec"
        ></path>{" "}
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          className="ccompli1"
          fill="#975aed"
        ></path>{" "}
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          className="ccompli2"
          fill="#a16ee8"
        ></path>{" "}
      </svg>
      <span className="text-3xl font-semibold ">Whispr</span>
    </div>
  );
};

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm ">
      {text}
    </h6>
  );
};
