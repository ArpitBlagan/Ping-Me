import { Request, Response } from "express";
import { conversationModel, messageModel } from "../model/message";
import mongoose from "mongoose";
import { userModel } from "../model/user";
import { ObjectId } from "mongodb";

export const saveMessage = async (
  text: string,
  kind: string,
  by: string,
  to: string
) => {
  let user1, user2;
  if (by > to) {
    user1 = to;
    user2 = by;
  } else {
    user1 = by;
    user2 = to;
  }
  const session = mongoose.startSession();
  (await session).startTransaction();
  try {
    const message = await messageModel.create({
      text: text,
      kind: kind,
      by,
      to,
    });
    const conversation = await conversationModel.findOne({ user1, user2 });
    if (!conversation) {
      await conversationModel.create({
        user1,
        user2,
        messages: [message._id],
      });
    } else {
      await conversationModel.updateOne(
        {
          user1,
          user2,
        },
        {
          $push: {
            messages: message._id,
          },
        }
      );
    }
    const frndList1 = await userModel.findById(by);
    const frndList2 = await userModel.findById(to);
    const byId = new ObjectId(by);
    const toId = new ObjectId(to);
    console.log(by, to);
    console.log("frnds");
    console.log(frndList1?.friends, frndList2?.friends);
    const val1 = frndList1?.friends.filter((ele: any) => {
      return !ele.equals(toId);
    });
    const val2 = frndList2?.friends.filter((ele) => {
      return !ele.equals(byId);
    });
    console.log("val");
    val1?.unshift(toId);
    val2?.unshift(byId);
    console.log(val1, val2);
    await userModel.findByIdAndUpdate(by, {
      friends: val1,
    });
    await userModel.findByIdAndUpdate(to, {
      friends: val2,
    });
    (await session).commitTransaction();
    (await session).endSession();
    return { message: "saved", id: message._id };
  } catch (err) {
    console.log(err);
    (await session).abortTransaction();
    (await session).endSession();
    return { message: "something went wrong" };
  }
};

export const getMessage = async (req: Request, res: Response) => {
  const by = req.user.id;
  console.log(req.query);
  const { to } = req.query;
  if (!to) {
    return res.status(400).json({ message: "invalid queries" });
  }
  let user1, user2;
  if (by > to) {
    user1 = to;
    user2 = by;
  } else {
    user1 = by;
    user2 = to;
  }
  try {
    const conversations = await conversationModel
      .findOne({
        user1,
        user2,
      })
      .populate({
        path: "messages",
        populate: { path: "by to", select: "name,email" },
      });
    res.status(200).json(conversations);
  } catch (err) {
    res.status(400).json({ message: "something went wrong" });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {};
