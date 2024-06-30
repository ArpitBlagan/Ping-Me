import { Request, Response } from "express";
import { conversationModel, messageModel } from "../model/message";
import mongoose from "mongoose";
import { groupModel, userModel } from "../model/user";
import { ObjectId } from "mongodb";
import fs from "fs";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
const s3Client = new S3Client({
  region: process.env.NEXT_AWS_S3_REGION as string,
  credentials: {
    accessKeyId: process.env.NEXT_AWs_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.NEXT_AWS_S3_SECRET_KEY as string,
  },
});
const uploadToS3 = async (file: any, name: any) => {
  const params = {
    Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME as string,
    Key: `${name}`,
    Body: file,
    ContentType: ["image/jpg", "image/png", "image/svg"],
  };

  const command = new PutObjectCommand(params as any);
  try {
    const response = await s3Client.send(command);
    console.log("File uploaded successfully:", response);
    return response;
  } catch (error) {
    throw error;
  }
};
export const imageUpload = async (req: Request, res: Response) => {
  //Image compression

  //Upload to S3
  if (req.file) {
    try {
      const compressedImage = await sharp(req.file.path)
        .resize(800)
        .png({ quality: 80 })
        .toBuffer();
      await uploadToS3(compressedImage, req.file.filename);
      const imageUrl = `https://${process.env.NEXT_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${req.file.filename}`;
      console.log(imageUrl);
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "something went wrong:(" });
        }
      });
      return res.status(200).json(imageUrl);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "something went wrong:(" });
    }
  }
  return res.status(400).json({ message: "file not found :(" });
};

export const createGroup = async (req: Request, res: Response) => {
  const id = req.user.id;
  let imageUrl = "";
  const name = req.body.name;
  const users = JSON.parse(req.body.users);
  users.push({ id });
  const another: any[] = [];
  users.forEach((ele: any) => {
    another.push(ele.id);
  });
  console.log(name, req.file, users);
  if (req.file) {
    try {
      const compressedImage = await sharp(req.file.path)
        .resize(800)
        .png({ quality: 80 })
        .toBuffer();
      await uploadToS3(compressedImage, req.file.filename);
      imageUrl = `https://${process.env.NEXT_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${req.file.filename}`;
      console.log(imageUrl);
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "something went wrong:(" });
        }
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "something went wrong:(" });
    }
  }
  const session = mongoose.startSession();
  (await session).startTransaction();
  try {
    const group = await groupModel.create({
      name,
      profileImage: imageUrl,
      users: another,
      messages: [],
      admin: id,
    });
    const pp = users.map(async (ele: any) => {
      await userModel.findByIdAndUpdate(ele.id, {
        $push: {
          groups: group._id,
        },
      });
    });
    await Promise.all(pp);
    (await session).commitTransaction();
    (await session).endSession();
    res.status(202).json({ message: "group created successfully" });
  } catch (err) {
    console.log(err);
    (await session).abortTransaction();
    (await session).endSession();
    return res.status(500).json({ message: "something went wrong:(" });
  }
};
