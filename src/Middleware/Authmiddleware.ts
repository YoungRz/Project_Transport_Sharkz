import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  id: number;
  role: "admin" | "user" | "driver";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "Token tidak ada" });
    return;
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ message: "Token tidak valid atau kadaluarsa" });
  }
}

export function requireRole(...roles: AuthPayload["role"][]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Akses ditolak" });
      return;
    }
    next();
  };
}