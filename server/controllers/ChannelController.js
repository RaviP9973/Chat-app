// import { Channel } from "diagnostics_channel";
import User from "../models/userModel.js";
import Channel from "../models/channelModel.js";
import mongoose from "mongoose";

//Controller for creating a new channel
export const createChannel = async (req, res) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;

    // Validate admin and members in one query
    const [admin, validMembers] = await Promise.all([
      User.findById(userId),
      User.find({ _id: { $in: members } })
    ]);

    if (!admin) {
      return res.status(400).send("Admin not found");
    }

    if (validMembers.length !== members.length) {
      return res.status(400).send("Some of the members are invalid members");
    }

    const channel = await Channel.create({
      name,
      members,
      admin: userId
    });

    return res.status(201).json({ channel });
  } catch (error) {
    console.log("Error in createChannel:", error);
    return res.status(500).send("Internal server error");
  }
};


//controller for adding a new member to a channel
export const addMemberToChannel = async (req, res) => {
  try {
    const { channelId, memberId } = req.body;
    const userId = req.userId;

    const [admin, newMember] = await Promise.all([
      User.findById(userId),
      User.findById(memberId)
    ])
    
    if(!admin || !newMember) {
      return res.status(400).json({ message: "Admin or new member not found" });
    }

    const channel = await Channel.findById(channelId);

    if(!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if(channel.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can add members to the channel" });
    }

    channel.members.push(memberId);
    await channel.save();
    
    return res.status(200).json({ message: "Member added to channel successfully" });
    
  } catch (error) {
    console.log("Error in addMemberToChannel:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// controller for getting all user channels
export const getUserChannels = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return res.status(201).json({ channels });
  } catch (error) {
    console.log("Error in createChannel:", error);
    return res.status(500).send("Internal server error");
  }
};

export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });
    // console.log("channel ", channel);
    if (!channel) {
      return res.status(404).send("channel not found");
    }

    const messages = channel.messages;
    return res.status(201).json({
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
