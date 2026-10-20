import bcrypt from "bcryptjs";
import { pool } from "./db/db";
 
const PASSWORD = "password123";
 
type UserSeed = [nama: string, email: string, role: "user" | "driver", jenis: "motor" | "mobil" | null, plat: string | null, hp: string];
 
const users: UserSeed[] = [
  // penumpang
  ["Dewi Lestari", "dewi@gmail.com", "user", null, null, "081200000011"],
  ["Andi Pratama", "andi@gmail.com", "user", null, null, "081200000012"],
  ["Maya Putri", "maya@gmail.com", "user", null, null, "081200000013"],
  ["Rizky Hakim", "rizky@gmail.com", "user", null, null, "081200000014"],
  // driver motor
  ["Agus Ojek", "agus@gmail.com", "driver", "motor", "B 2345 DEF", "081200000021"],
  ["Bambang Motor", "bambang@gmail.com", "driver", "motor", "B 3456 GHI", "081200000022"],
  ["Cahyo Ojek", "cahyo@gmail.com", "driver", "motor", "B 4567 JKL", "081200000023"],
  // driver mobil
  ["Dedi Sopir", "dedi@gmail.com", "driver", "mobil", "B 6789 MNO", "081200000031"],
  ["Eka Sopir", "eka@gmail.com", "driver", "mobil", "B 7890 PQR", "081200000032"],
  ["Fajar Sopir", "fajar@gmail.com", "driver", "mobil", "B 8901 STU", "081200000033"],
];
 
type RuteSeed = { kode: string; nama: string; asal: string; tujuan: string; halte: [string, string][] };
 
const rute: RuteSeed[] = [
  {
    kode: "K3", nama: "Koridor 3", asal: "Kalideres", tujuan: "Pasar Baru",
    halte: [
      ["Halte Kalideres", "Jl. Daan Mogot"],
      ["Halte Rawa Buaya", "Jl. Daan Mogot"],
      ["Halte Grogol", "Jl. Letjen S. Parman"],
      ["Halte Harmoni", "Jl. Gajah Mada"],
      ["Halte Pasar Baru", "Jl. Pasar Baru"],
    ],
  },
  {
    kode: "K4", nama: "Koridor 4", asal: "Pulo Gadung", tujuan: "Manggarai",
    halte: [
      ["Halte Pulo Gadung 2", "Jl. Perintis Kemerdekaan"],
      ["Halte Pramuka BPKP", "Jl. Pramuka"],
      ["Halte Utan Kayu", "Jl. Matraman Raya"],
      ["Halte Matraman 1", "Jl. Matraman Raya"],
      ["Halte Manggarai", "Jl. Manggarai Utara"],
    ],
  },
  {
    kode: "K5", nama: "Koridor 5", asal: "Kampung Melayu", tujuan: "Ancol",
    halte: [
      ["Halte Kampung Melayu", "Jl. Jatinegara Barat"],
      ["Halte Jatinegara", "Jl. Jatinegara Timur"],
      ["Halte Pasar Senen", "Jl. Pasar Senen"],
      ["Halte Kemayoran", "Jl. Benyamin Sueb"],
      ["Halte Ancol", "Jl. Lodan Raya"],
    ],
  },
  {
    kode: "K6", nama: "Koridor 6", asal: "Ragunan", tujuan: "Dukuh Atas",
    halte: [
      ["Halte Ragunan", "Jl. Harsono RM"],
      ["Halte Pejaten", "Jl. Warung Buncit Raya"],
      ["Halte Buncit Indah", "Jl. Warung Buncit Raya"],
      ["Halte Mampang Prapatan", "Jl. Mampang Prapatan Raya"],
      ["Halte Dukuh Atas", "Jl. Jenderal Sudirman"],
    ],
  },
];
 
async function idByEmail(email: string): Promise<number | null> {
  const [rows]: any = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  return rows[0]?.id ?? null;
}
 
async function halteRute(kode: string): Promise<{ ruteId: number; haltes: number[] } | null> {
  const [r]: any = await pool.query("SELECT id FROM rute WHERE kode_rute = ?", [kode]);
  if (!r[0]) return null;
  const [h]: any = await pool.query("SELECT id FROM halte WHERE rute_id = ? ORDER BY urutan", [r[0].id]);
  return { ruteId: r[0].id, haltes: h.map((x: any) => x.id) };
}
 
async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);
 
  for (const [nama, email, role, jenis, plat, hp] of users) {
    await pool.query(
      `INSERT IGNORE INTO users (nama, email, password, role, jenis_kendaraan, plat_nomor, no_hp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nama, email, hash, role, jenis, plat, hp]
    );
  }
 
  // 2) Rute + halte
  for (const r of rute) {
    await pool.query(
      "INSERT IGNORE INTO rute (kode_rute, nama_rute, asal, tujuan) VALUES (?, ?, ?, ?)",
      [r.kode, r.nama, r.asal, r.tujuan]
    );
    const [rows]: any = await pool.query("SELECT id FROM rute WHERE kode_rute = ?", [r.kode]);
    const ruteId = rows[0].id;
 
    const [ada]: any = await pool.query("SELECT COUNT(*) AS n FROM halte WHERE rute_id = ?", [ruteId]);
    if (ada[0].n === 0) {
      for (let i = 0; i < r.halte.length; i++) {
        const [namaHalte, alamat] = r.halte[i];
        await pool.query(
          "INSERT INTO halte (rute_id, nama_halte, alamat, urutan) VALUES (?, ?, ?, ?)",
          [ruteId, namaHalte, alamat, i + 1]
        );
      }
    }
  }

  const [cnt]: any = await pool.query("SELECT COUNT(*) AS n FROM pesanan");
  if (cnt[0].n === 0) {
    type Hist = [user: string, driver: string, kode: string, asal: number, tujuan: number, jenis: "motor" | "mobil", status: "selesai" | "dibatalkan", hariLalu: number];
    const history: Hist[] = [
      ["budi@gmail.com", "joko@gmail.com", "K1", 0, 2, "motor", "selesai", 3],
      ["budi@gmail.com", "rina@gmail.com", "K1", 1, 2, "mobil", "selesai", 7],
      ["siti@gmail.com", "rina@gmail.com", "K2", 0, 2, "mobil", "selesai", 2],
      ["siti@gmail.com", "joko@gmail.com", "K2", 1, 2, "motor", "dibatalkan", 5],
      ["dewi@gmail.com", "agus@gmail.com", "K3", 0, 3, "motor", "selesai", 1],
      ["andi@gmail.com", "dedi@gmail.com", "K6", 0, 4, "mobil", "selesai", 4],
      ["maya@gmail.com", "eka@gmail.com", "K5", 1, 4, "mobil", "dibatalkan", 6],
    ];
 
    for (const [userEmail, driverEmail, kode, asal, tujuan, jenis, status, hari] of history) {
      const userId = await idByEmail(userEmail);
      const driverId = await idByEmail(driverEmail);
      const rt = await halteRute(kode);
      if (!userId || !driverId || !rt || !rt.haltes[asal] || !rt.haltes[tujuan]) continue;
 
      await pool.query(
        `INSERT INTO pesanan (user_id, driver_id, rute_id, halte_asal_id, halte_tujuan_id, jenis_kendaraan, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
        [userId, driverId, rt.ruteId, rt.haltes[asal], rt.haltes[tujuan], jenis, status, hari]
      );
    }
  }
 
  console.log("Seed data selesai");
  console.log("Semua akun contoh memakai password: " + PASSWORD);
  await pool.end();
}
 
main().catch((err) => {
  console.error("Seed data gagal:", err);
  process.exit(1);
});