import { Router } from "express";
import { verifyToken } from "../middleware/AtuhMiddleware.js";
import { addMemberToChannel, createChannel, getChannelMessages, getUserChannels } from "../controllers/ChannelController.js";

const channelRoute = Router();

channelRoute.post("/create-channel",verifyToken, createChannel)
channelRoute.get("/get-user-channels",verifyToken,getUserChannels);

channelRoute.get("/get-channel-messages/:channelId", verifyToken, getChannelMessages);
channelRoute.post("/add-member-to-channel", verifyToken, addMemberToChannel);
export default channelRoute;