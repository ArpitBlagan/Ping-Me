import jwt from "jsonwebtoken";

export const validateToken = async (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  jwt.verify(token, process.env.SECRET as string, (err: any, val: any) => {
    if (err) {
      return res.status(403).json({ message: "invalide token" });
    }
    req.user = val.user;
    next();
  });
};
