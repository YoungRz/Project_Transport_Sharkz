import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { pool } from "./db/db";
import authRoutes from "./route/auth";
import ruteRoutes from "./route/rute";
import halteRoutes from "./route/halte";
import adminRoutes from "./route/admin";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET belum diisi di .env");
  process.exit(1);
}

const app = express();
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

// Error handler (Express 5 otomatis meneruskan error dari async handler ke sini)
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
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});