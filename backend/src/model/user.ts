import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  friends: [{ type: Schema.Types.ObjectId, ref: "userModel" }],
});
export const userModel = model("userModel", userSchema);
