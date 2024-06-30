import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  friends: [{ type: Schema.Types.ObjectId, ref: "userModel" }],
  groups: [{ type: Schema.Types.ObjectId, ref: "groupModel" }],
});
const groupSchema = new Schema({
  name: String,
  profileImage: String,
  users: [{ type: Schema.Types.ObjectId, ref: "userModel" }],
  messages: [{ type: Schema.Types.ObjectId, ref: "groupMessageModel" }],
  admin: { type: Schema.Types.ObjectId, ref: "userModel" },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const groupMessageSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: "groupModel" },
  by: { type: Schema.Types.ObjectId, ref: "userModel" },
  text: String,
  kind: String,
  sendAt: {
    type: Date,
    default: Date.now(),
  },
  edited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
    default: Date.now(),
  },
});
export const groupModel = model("groupModel", groupSchema);
export const groupMessageModel = model("groupMessageModel", groupMessageSchema);
export const userModel = model("userModel", userSchema);
