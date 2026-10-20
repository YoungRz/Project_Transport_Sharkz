# Transportasi Umum API

Kode backend ada di branch `feature-backend`.
Kode UI ada di branch `feature-ui`.

Backend REST API untuk sistem transportasi umum. Dibuat dengan **Express (TypeScript)** dan **MySQL**, dengan autentikasi JWT dan pembagian hak akses berdasarkan role (admin, user, driver).

## Fitur

- Register dan login untuk **user** (penumpang) dan **driver** (motor atau mobil)
- Login untuk **admin** (tanpa register, akun admin dibuat lewat database)
- CRUD **rute** dan **halte** (tambah, edit, hapus khusus admin; lihat data terbuka untuk semua)
- Admin dapat melihat daftar akun, menghapus user dan driver, serta mengganti nama dan password user dan driver
- User dan driver dapat mengganti nama dan password **akunnya sendiri**, dan menghapus akunnya sendiri
- Tidak ada yang dapat mengubah akun orang lain, kecuali admin terhadap user dan driver (admin tidak dapat mengubah sesama admin)
- Password disimpan dalam bentuk hash (bcrypt)

## Teknologi

- Node.js + Express 5
- TypeScript (dijalankan dengan `tsx`)
- MySQL (`mysql2`)
- JWT (`jsonwebtoken`) dan `bcryptjs`
- `dotenv` untuk konfigurasi

## Struktur Folder

```
Project-EXPRESS/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── src/
    ├── app.ts
    ├── seed.ts
    ├── hash-passwords.ts
    ├── db/
    │   └── db.ts
    ├── Middleware/
    │   ├── Authmiddleware.ts
    │   └── Adminmiddleware.ts
    └── routes/
        ├── auth.ts
        ├── rute.ts
        ├── halte.ts
        ├── admin.ts
        └── users.ts
```

## Instalasi

### 1. Prasyarat

- Node.js (versi LTS)
- MySQL Server dan MySQL Workbench (atau XAMPP/Laragon)
- Thunder Client atau Postman untuk menguji endpoint

### 2. Install dependency

```bash
npm install
```

### 3. Buat database

Jalankan script berikut di MySQL Workbench:

```sql
CREATE DATABASE IF NOT EXISTS transportasi_umum;
USE transportasi_umum;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user', 'driver') NOT NULL DEFAULT 'user',
  jenis_kendaraan ENUM('motor', 'mobil') NULL,
  plat_nomor VARCHAR(15) NULL,
  no_hp VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rute (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_rute VARCHAR(10) NOT NULL UNIQUE,
  nama_rute VARCHAR(100) NOT NULL,
  asal VARCHAR(100) NOT NULL,
  tujuan VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE halte (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rute_id INT NOT NULL,
  nama_halte VARCHAR(100) NOT NULL,
  alamat VARCHAR(255),
  urutan INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rute_id) REFERENCES rute(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
```

Relasi: satu rute memiliki banyak halte (`halte.rute_id` mengacu ke `rute.id`). Menghapus rute ikut menghapus halte-nya.

### 4. Konfigurasi `.env`

Buat file `.env` di root project:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=isi_password_mysql
DB_NAME=transportasi_umum

JWT_SECRET=ganti_dengan_string_acak_yang_panjang
PORT=3000
```

File `.env` sudah masuk `.gitignore`, jangan di-commit.

### 5. Isi data awal

Pilih salah satu:

**Opsi A: seed otomatis** (membuat akun contoh, rute, dan halte; semua password `password123`)

```bash
npx tsx src/seed.ts
```

| Email | Role |
|---|---|
| admin@transport.com | admin |
| budi@gmail.com | user |
| siti@gmail.com | user |
| joko@gmail.com | driver (motor) |
| rina@gmail.com | driver (mobil) |

**Opsi B: insert manual lewat SQL**, lalu hash password-nya:

```bash
npx tsx src/hash-passwords.ts
```

Script ini mengubah semua password teks biasa di tabel `users` menjadi hash bcrypt. Aman dijalankan berulang kali.

Untuk menjadikan akun biasa sebagai admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'emailkamu@gmail.com';
```

## Menjalankan

```bash
# development (auto-restart saat file berubah)
npm run dev

# sekali jalan
npx tsx src/app.ts

# build lalu jalankan
npm run build
npm start
```

Server berjalan di `http://localhost:3000`. Cek koneksi database di `http://localhost:3000/db-test`.

## Autentikasi

Login lewat `POST /auth/login`, lalu kirim token di header setiap request yang butuh login:

```
Authorization: Bearer <token>
```

Di Thunder Client: tab **Auth**, pilih **Bearer**, tempel token.

## Hak Akses

| Role | Hak akses |
|---|---|
| Publik (tanpa login) | Register, login, lihat rute dan halte |
| User | Ganti nama sendiri, ganti password sendiri, hapus akun sendiri |
| Driver | Ganti nama sendiri, ganti password sendiri, hapus akun sendiri |
| Admin | Tambah, edit, hapus rute dan halte; lihat daftar akun; hapus user dan driver; ganti nama dan password user dan driver; ganti nama dan password akun sendiri |

Catatan:
- Role tidak pernah diambil dari body request. `/auth/register` selalu membuat `user`, `/auth/register-driver` selalu membuat `driver`.
- Admin tidak bisa register lewat API.
- Akun admin tidak bisa dihapus lewat API.
- Route `/users/me/...` memakai id dari token, bukan dari URL, sehingga user dan driver tidak bisa mengubah akun orang lain.
- Admin tidak bisa mengubah nama atau password sesama admin lewat route `/admin/...` (respons 403).
- Ganti password sendiri mewajibkan `password_lama`.
- Panjang minimal password baru adalah 4 karakter (bisa dinaikkan di kode).

## Daftar Endpoint

### Auth (publik)

| Method | URL | Body |
|---|---|---|
| POST | `/auth/register` | `nama`, `email`, `password`, `no_hp` (opsional) |
| POST | `/auth/register-driver` | `nama`, `email`, `password`, `jenis_kendaraan` (`motor` atau `mobil`), `plat_nomor`, `no_hp` (opsional) |
| POST | `/auth/login` | `email`, `password` |

### Rute

| Method | URL | Akses | Body |
|---|---|---|---|
| GET | `/rute` | Publik | none |
| GET | `/rute/:id` | Publik (termasuk daftar halte) | none |
| POST | `/rute` | Admin | `kode_rute`, `nama_rute`, `asal`, `tujuan` |
| PUT | `/rute/:id` | Admin | `kode_rute`, `nama_rute`, `asal`, `tujuan` |
| DELETE | `/rute/:id` | Admin | none |

### Halte

| Method | URL | Akses | Body |
|---|---|---|---|
| GET | `/halte` | Publik (filter: `?rute_id=1`) | none |
| GET | `/halte/:id` | Publik | none |
| POST | `/halte` | Admin | `rute_id`, `nama_halte`, `alamat` (opsional), `urutan` |
| PUT | `/halte/:id` | Admin | `rute_id`, `nama_halte`, `alamat` (opsional), `urutan` |
| DELETE | `/halte/:id` | Admin | none |

### Admin

Semua route di bawah ini khusus admin.

| Method | URL | Fungsi | Body |
|---|---|---|---|
| GET | `/admin/users` | Lihat semua user dan driver (filter: `?role=user` atau `?role=driver`) | none |
| PUT | `/admin/users/:id/nama` | Ganti nama user atau driver | `nama` |
| PUT | `/admin/users/:id/password` | Ganti password user atau driver | `password_baru` |
| DELETE | `/admin/users/:id` | Hapus user (penumpang) | none |
| DELETE | `/admin/drivers/:id` | Hapus driver | none |

### Akun sendiri

Memakai token milik akun yang bersangkutan. Tidak ada id di URL.

| Method | URL | Akses | Fungsi | Body |
|---|---|---|---|---|
| PUT | `/users/me` | Semua yang login | Ganti nama sendiri | `nama` |
| PUT | `/users/me/password` | Semua yang login | Ganti password sendiri | `password_lama`, `password_baru` |
| DELETE | `/users/me` | User dan driver | Hapus akun sendiri | none |

## Contoh Request

Login:

```json
POST /auth/login
{
  "email": "admin@transport.com",
  "password": "password123"
}
```

Tambah rute (admin):

```json
POST /rute
{
  "kode_rute": "K3",
  "nama_rute": "Koridor 3",
  "asal": "Kalideres",
  "tujuan": "Pasar Baru"
}
```

Tambah halte (admin):

```json
POST /halte
{
  "rute_id": 1,
  "nama_halte": "Halte Sarinah",
  "alamat": "Jl. MH Thamrin",
  "urutan": 4
}
```

Ganti password sendiri (user atau driver):

```json
PUT /users/me/password
{
  "password_lama": "password123",
  "password_baru": "passwordbaru456"
}
```

Admin mengganti password user atau driver:

```json
PUT /admin/users/2/password
{
  "password_baru": "passwordbaru456"
}
```

## Kode Respons

| Kode | Arti |
|---|---|
| 200 / 201 | Berhasil |
| 400 | Field wajib kosong atau tidak valid (termasuk password lama salah) |
| 401 | Token tidak ada, tidak valid, atau login salah |
| 403 | Role tidak punya akses, atau mencoba mengubah akun admin |
| 404 | Data tidak ditemukan |
| 409 | Data duplikat (email atau kode rute sudah dipakai) |
| 500 | Kesalahan server |

## Catatan Keamanan

- Password selalu disimpan sebagai hash bcrypt, bukan teks biasa.
- Ganti `JWT_SECRET` dengan string acak yang panjang.
- Password contoh dari seed (`password123`) hanya untuk development.
- Jangan commit file `.env`.
