import { Router } from "express";
import { deleteMessage, getMessage } from "./controller/message";
import {
  login,
  register,
  addFriend,
  getFriends,
  searchUser,
  logout,
} from "./controller/user";
import { validateToken } from "./middleware";

export const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/logout").get(logout);
router.use(validateToken);
router.route("/friends").get(getFriends);
router.route("/search").get(searchUser);
router.route("/addFriend").patch(addFriend);
router.route("/conversation").get(getMessage).delete(deleteMessage);
router.route("/isloggedin").get((req, res) => {
  return res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
  });
});
