import bcrypt from "bcryptjs";
import { pool } from "./db/db";

async function seed() {
  const hash = await bcrypt.hash("password123", 10);

  // users: admin, penumpang, driver motor, driver mobil
  const users = [
    ["Admin Utama", "admin@transport.com", hash, "admin", null, null, "081200000001"],
    ["Budi Penumpang", "budi@gmail.com", hash, "user", null, null, "081200000002"],
    ["Siti Penumpang", "siti@gmail.com", hash, "user", null, null, "081200000003"],
    ["Joko Ojek", "joko@gmail.com", hash, "driver", "motor", "B 1234 ABC", "081200000004"],
    ["Rina Sopir", "rina@gmail.com", hash, "driver", "mobil", "B 5678 XYZ", "081200000005"],
  ];

  for (const u of users) {
    await pool.query(
      `INSERT IGNORE INTO users
       (nama, email, password, role, jenis_kendaraan, plat_nomor, no_hp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      u
    );
  }

  // rute + halte
  const rute = [
    ["K1", "Koridor 1", "Blok M", "Kota", [
      ["Halte Blok M", "Jl. Melawai", 1],
      ["Halte Bundaran HI", "Jl. MH Thamrin", 2],
      ["Halte Monas", "Jl. Medan Merdeka", 3],
    ]],
    ["K2", "Koridor 2", "Pulo Gadung", "Harmoni", [
      ["Halte Pulo Gadung", "Jl. Bekasi Raya", 1],
      ["Halte Matraman", "Jl. Matraman Raya", 2],
      ["Halte Harmoni", "Jl. Gajah Mada", 3],
    ]],
  ] as const;

  for (const [kode, nama, asal, tujuan, haltes] of rute) {
    await pool.query(
      `INSERT IGNORE INTO rute (kode_rute, nama_rute, asal, tujuan)
       VALUES (?, ?, ?, ?)`,
      [kode, nama, asal, tujuan]
    );

    const [rows]: any = await pool.query(
      "SELECT id FROM rute WHERE kode_rute = ?",
      [kode]
    );
    const ruteId = rows[0].id;

    const [existing]: any = await pool.query(
      "SELECT COUNT(*) AS n FROM halte WHERE rute_id = ?",
      [ruteId]
    );
    if (existing[0].n === 0) {
      for (const [namaHalte, alamat, urutan] of haltes) {
        await pool.query(
          `INSERT INTO halte (rute_id, nama_halte, alamat, urutan)
           VALUES (?, ?, ?, ?)`,
          [ruteId, namaHalte, alamat, urutan]
        );
      }
    }
  }

  console.log("Seed selesai");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed gagal:", err);
  process.exit(1);
});