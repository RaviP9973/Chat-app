import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import mongoose from "mongoose";

export const searchContacts = async (req, res) => {
  try {
    const { searchTerm } = req.body;
    // console.log("Search term:", searchTerm);

    if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
      return res.status(400).json({
        message: "Search term is required and must be a valid string",
      });
    }

    const sanitizedSearchTerm = searchTerm
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(sanitizedSearchTerm, "i");
    // console.log("Regex:", regex);

    const contacts = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } },
      ],
    });

    // console.log("Contacts found:", contacts.length);
    return res.status(200).json({ contacts });
  } catch (error) {
    console.error("Error in searchContacts:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } },
      "firstName lastName _id"
    );

    // console.log("Contacts found:", contacts.length);
    const contacts = users.map((user) => ({
      label: user.firstName
        ? `${user.firstName} ${user.lastName}`
        : `${user.email}`,
      value: user._id,
    }));
    return res.status(200).json({ contacts });
  } catch (error) {
    console.error("Error in get all contacts controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getContactsForDmList = async (req, res) => {
  try {
    let { userId } = req;
    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return res.status(200).json({ contacts });
  } catch (error) {
    console.error("Error in searchContacts:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
