import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db/db";
import authRoutes from "./route/auth";
import ruteRoutes from "./route/rute";
import halteRoutes from "./route/halte";
import adminRoutes from "./route/admin";
import userRoutes from "./route/users";
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET belum diisi di .env");
  process.exit(1);
}

const app = express();
// Izinkan UI dari localhost di port mana pun (3000, 3001, dst)
app.use(cors({ origin: /^http:\/\/(localhost|127\.0\.0\.1):\d+$/ }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API transportasi umum jalan" });
});

app.get("/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS hasil");
    res.json({ connected: true, rows });
  } catch (err) {
    res.status(500).json({ connected: false, error: String(err) });
  }
});

app.use("/auth", authRoutes);
app.use("/rute", ruteRoutes);
app.use("/halte", halteRoutes);
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === "ER_DUP_ENTRY") {
    res.status(409).json({ message: "Data duplikat (kode/email sudah dipakai)" });
    return;
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    res.status(400).json({ message: "rute_id tidak ditemukan" });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Server error: " + (err.sqlMessage ?? err.message) });
});

const PORT = process.env.PORT || 777;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});