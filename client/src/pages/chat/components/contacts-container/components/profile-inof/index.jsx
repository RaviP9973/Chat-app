import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST, LOGOUT_ROUTE } from "@/utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

import React from "react";
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoLogOut } from "react-icons/io5";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();

  const logout = async () => {
    try {
      console.log("logout clicked");
      const toastId = toast.loading("Logging out...");
      
      const { error } = await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setUserInfo(null);
            toast.dismiss(toastId);
            toast.success("Logged out successfully");
            navigate("/auth");
          },
          onError: (ctx) => {
            toast.dismiss(toastId);
            toast.error(ctx.error.message || "Failed to logout");
          },
        },
      });

      if (error) {
        toast.dismiss(toastId);
        toast.error(error.message || "Failed to logout");
        return;
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
      <div className="flex items-center justify-center ">
        <div className="w-12 h-12 relative">
          <Avatar className="h-12 w-12  rounded-full overflow-hidden ">
            {userInfo.image ? (
              <AvatarImage
                src={`${HOST}/${userInfo.image}`}
                alt="profile"
                className="object-cover w-12 h-12 bg-black rounded-full "
              />
            ) : (
              <div
                className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                  userInfo.color
                )}`}
              >
                <p className="text-pink-300">
                  {userInfo?.firstName
                    ? userInfo?.firstName.split("").shift()
                    : userInfo?.email.split("").shift()}
                </p>
              </div>
            )}
          </Avatar>
        </div>
        <div>
          {userInfo.firstName && userInfo.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : `${userInfo.email}`}
        </div>
      </div>
      <div className="flex gap-5 ">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2
                onClick={() => navigate("/profile")}
                className="text-purple-500 text-xl font-medium"
              />
            </TooltipTrigger>
            <TooltipContent className={" border-none text-white"}>
              <p>Edit Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <IoLogOut
                onClick={logout}
                className="text-red-500 text-xl font-medium"
              />
            </TooltipTrigger>
            <TooltipContent className={" border-none text-white"}>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProfileInfo;
