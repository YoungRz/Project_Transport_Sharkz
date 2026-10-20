import { pool } from "./db/db";

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','user','driver') NOT NULL DEFAULT 'user',
    jenis_kendaraan ENUM('motor','mobil') NULL,
    plat_nomor VARCHAR(20) NULL,
    no_hp VARCHAR(20) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS rute (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode_rute VARCHAR(20) NOT NULL,
    nama_rute VARCHAR(100) NOT NULL,
    asal VARCHAR(100) NOT NULL,
    tujuan VARCHAR(100) NOT NULL,
    UNIQUE KEY uq_rute_kode (kode_rute)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS halte (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rute_id INT UNSIGNED NOT NULL,
    nama_halte VARCHAR(100) NOT NULL,
    alamat VARCHAR(200) NULL,
    urutan INT NOT NULL,
    UNIQUE KEY uq_halte_urutan (rute_id, urutan),
    CONSTRAINT fk_halte_rute FOREIGN KEY (rute_id) REFERENCES rute(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,
];

async function main() {
  for (const sql of statements) await pool.query(sql);
  console.log("Tabel siap");
  await pool.end();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});