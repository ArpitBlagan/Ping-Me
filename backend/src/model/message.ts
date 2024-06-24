import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  text: String,
  kind: String,
  by: { type: Schema.Types.ObjectId, ref: "userModel" },
  to: { type: Schema.Types.ObjectId, ref: "userModel" },
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

const conversationSchema = new Schema({
  user1: { type: Schema.ObjectId, ref: "userModel" },
  user2: { type: Schema.ObjectId, ref: "userModel" },
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "messageModel",
    },
  ],
});
export const conversationModel = model("conversationModel", conversationSchema);
export const messageModel = model("messageModel", messageSchema);
