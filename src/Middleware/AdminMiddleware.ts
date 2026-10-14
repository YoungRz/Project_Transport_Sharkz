import { Response, NextFunction, RequestHandler } from "express";
import { AuthRequest, verifyToken } from "./Authmiddleware";

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Hanya admin yang boleh akses" });
    return;
  }
  next();
}

export const adminOnly: RequestHandler[] = [
  verifyToken as RequestHandler,
  isAdmin as RequestHandler,
];