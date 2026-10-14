import bcrypt from "bcryptjs";
import { pool } from "./db/db";

async function main() {
  const [rows]: any = await pool.query(
    "SELECT id, password FROM users WHERE password NOT LIKE '$2%'"
  );

  for (const u of rows) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hash, u.id]);
  }

  console.log(`${rows.length} password berhasil di-hash`);
  await pool.end();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});