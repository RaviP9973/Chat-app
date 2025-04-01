import { compare } from "bcrypt";
import User from "../models/userModel.js";
// import { sign } from "jsonwebtoken";
import jwt from "jsonwebtoken";
const { sign } = jwt;
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
  return sign({ email, userId }, process.env.JWT_KEY, { expiresIn: "3d" });
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password is required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already exists");
    }

    const user = await User.create({ email, password });

    res.cookie("jwt", createToken(email, user._id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and password is required");
    }

    // console.log("pass", password)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const passMatch = await compare(password, user.password);
    // console.log("passMatch", passMatch);

    if (!passMatch) {
      return res.status(400).send("Password is incorrect");
    }
    res.cookie("jwt", createToken(email, user._id), {
      httpOnly: true,
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        color: user.color,
      },
    });
  } catch (error) {
    console.log("error in login ", error);
    return res.status(500).send("Internal server error");
  }
};

export const getUserInfo = async (req, res) => {
  try {
    // console.log(req.usereId);
    // console.log(req.body);
    const userData = await User.findById(req.userId);

    if (!userData) {
      return res.status(404).send("User with the given user id not found");
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, color = 0 } = req.body;
    // console.log(req.body);
    if (!firstName || !lastName) {
      return res.status(400).send("Fill all data");
    }
    const userData = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );

    if (!userData) {
      return res.status(404).send("User with the given user id not found");
    }

    return res.status(200).json({
      id: userData._id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      color: userData.color,
      profileSetup: userData.profileSetup,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
export const addProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    const date = Date.now();
    let fileName = "uploads/profiles/" + date + req.file.originalname;

    renameSync(req.file.path, fileName);
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        image: fileName,
      },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
export const removeProfileImage = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.image) {
      unlinkSync(user.image);
    }

    user.image = null;
    await user.save();

    return res.status(200).send("Profile image removed successfully.");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
export const logout = async (req, res) => {
  try {
    // console.log("inside logout");

    res.cookie("jwt", "", {
      expires: new Date(0),
      secure: true,
      sameSite: "None",
    });

    return res.status(200).send("Logout Successful.");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
