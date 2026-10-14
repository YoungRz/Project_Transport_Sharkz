import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/db";

const router = Router();

// Register penumpang (role selalu 'user')
router.post("/register", async (req, res) => {
  const { nama, email, password, no_hp } = req.body ?? {};
  if (!nama || !email || !password) {
    res.status(400).json({ message: "nama, email, password wajib diisi" });
    return;
  }

  const [exists]: any = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (exists.length > 0) {
    res.status(409).json({ message: "Email sudah terdaftar" });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const [result]: any = await pool.query(
    "INSERT INTO users (nama, email, password, role, no_hp) VALUES (?, ?, ?, 'user', ?)",
    [nama, email, hash, no_hp ?? null]
  );
  res.status(201).json({ message: "Register berhasil", id: result.insertId });
});

// Register driver (role selalu 'driver')
router.post("/register-driver", async (req, res) => {
  const { nama, email, password, no_hp, jenis_kendaraan, plat_nomor } = req.body ?? {};
  if (!nama || !email || !password || !jenis_kendaraan || !plat_nomor) {
    res.status(400).json({
      message: "nama, email, password, jenis_kendaraan, plat_nomor wajib diisi",
    });
    return;
  }
  if (!["motor", "mobil"].includes(jenis_kendaraan)) {
    res.status(400).json({ message: "jenis_kendaraan harus 'motor' atau 'mobil'" });
    return;
  }

  const [exists]: any = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (exists.length > 0) {
    res.status(409).json({ message: "Email sudah terdaftar" });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const [result]: any = await pool.query(
    `INSERT INTO users (nama, email, password, role, jenis_kendaraan, plat_nomor, no_hp)
     VALUES (?, ?, ?, 'driver', ?, ?, ?)`,
    [nama, email, hash, jenis_kendaraan, plat_nomor, no_hp ?? null]
  );
  res.status(201).json({ message: "Register driver berhasil", id: result.insertId });
});

// Login (admin, user, driver semuanya lewat sini)
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ message: "email dan password wajib diisi" });
    return;
  }

  const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  const user = rows[0];
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) {
    res.status(401).json({ message: "Email atau password salah" });
    return;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  res.json({
    message: "Login berhasil",
    token,
    user: {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      jenis_kendaraan: user.jenis_kendaraan,
      plat_nomor: user.plat_nomor,
    },
  });
});

export default router;