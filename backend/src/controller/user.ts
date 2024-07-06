import { Request, Response } from "express";
import { groupModel, userModel } from "../model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as z from "zod";
import mongoose from "mongoose";
import { populate } from "dotenv";
const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(""),
  password: z.string().min(6, "password should be atleast 6 characters long"),
  image: z.string().optional(),
});

export const logout = async (req: Request, res: Response) => {
  res.cookie("token", "", { sameSite: "none", httpOnly: true, secure: true });
  res.status(200).json({ message: "logged out successfully" });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "user with this email not found" });
    }
    //@ts-ignore
    const pass: string = user.password;
    if (await bcrypt.compare(password, pass)) {
      const token = jwt.sign(
        {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
        },
        process.env.SECRET as string
      );
      res.cookie("token", token, {
        sameSite: "none",
        httpOnly: true,
        secure: true,
      });
      res.status(200).json({
        id: user._id,
        email: user.email,
        name: user.name,
      });
    } else {
      res.status(401).json({ message: "wrong email and password pair" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong" });
  }
};

export const register = async (req: Request, res: Response) => {
  const body = req.body;
  const data = registerSchema.safeParse(body);
  if (!data.success) {
    return res.status(400).json({ message: "Invalid inputs" });
  }
  try {
    const user = await userModel.findOne({ email: body.email });
    console.log("user", user);
    if (!user) {
      const pass = await bcrypt.hash(body.password, 10);
      const val = await userModel.create({
        name: body.name,
        email: body.email,
        password: pass,
        friends: [],
      });
      return res.status(202).json({ user: val });
    } else {
      return res.status(409).json({ message: "email already registered" });
    }
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};

export const addFriend = async (req: Request, res: Response) => {
  const { id } = req.body;
  const userId = req.user.id;
  console.log("add friend", id, userId);
  const session = mongoose.startSession();
  (await session).startTransaction();
  try {
    await userModel.findByIdAndUpdate(userId, {
      $push: {
        friends: id,
      },
    });
    await userModel.findByIdAndUpdate(id, {
      $push: {
        friends: userId,
      },
    });
    (await session).commitTransaction();
    (await session).endSession();
    res.status(202).json({ message: "friend added successfully" });
  } catch (err) {
    (await session).abortTransaction();
    (await session).endSession();
    res.status(500).json({ message: "something went wrong" });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  const userId = req.user.id;
  try {
    const user = await userModel.findById(userId).limit(5).populate("friends");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};

export const searchUser = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { text } = req.query;

  const regex = new RegExp("^" + text, "i");

  try {
    const data = await userModel.find({
      $or: [{ email: { $regex: regex } }, { name: { $regex: regex } }],
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};

export const addMembers = async (req: Request, res: Response) => {
  const { users, groupId } = req.body;
  const userId = req.user.id;
  const session = mongoose.startSession();
  (await session).startTransaction();
  try {
    const uu = users.map(async (ele: any) => {
      await groupModel.findByIdAndUpdate(groupId, {
        $push: {
          users: ele.id,
        },
      });
    });
    Promise.all(uu);
    const uuu = users.map(async (ele: any) => {
      await userModel.findByIdAndUpdate(ele.id, {
        $push: {
          groups: groupId,
        },
      });
    });
    Promise.all(uuu);
    (await session).commitTransaction();
    (await session).endSession();
    res.status(202).json({ message: "member added to the group successfully" });
  } catch (err) {
    (await session).abortTransaction();
    (await session).endSession();
    res.status(500).json({ message: "something went wrong" });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  const id = req.user.id;
  try {
    const user = await userModel
      .findById(id)
      .populate({ path: "groups", populate: { path: "users" } });
    res.status(200).json(user?.groups);
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};

export const userInfo = async (req: Request, res: Response) => {
  const id = req.user.id;
  try {
    const user = await userModel
      .findById(id)
      .populate({ path: "friends", populate: { path: "users" } })
      .populate({ path: "groups", populate: { path: "users" } });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};
