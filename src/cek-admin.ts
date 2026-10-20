import bcrypt from "bcryptjs";
import { pool } from "./db/db";

async function main() {
  const email = "admin@transport.com";

  const [rows]: any = await pool.query("SELECT id, email, role FROM users");
  console.log("Isi tabel users sekarang:", rows);

  const hash = await bcrypt.hash("password123", 10);
  const [upd]: any = await pool.query(
    "UPDATE users SET password = ?, role = 'admin' WHERE email = ?",
    [hash, email]
  );

  if (upd.affectedRows === 0) {
    await pool.query(
      "INSERT INTO users (nama, email, password, role, no_hp) VALUES (?, ?, ?, 'admin', ?)",
      ["Admin Utama", email, hash, "081200000001"]
    );
    console.log("Admin dibuat baru");
  } else {
    console.log("Password admin direset");
  }

  console.log("Siap login: admin@transport.com / password123");
  await pool.end();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});