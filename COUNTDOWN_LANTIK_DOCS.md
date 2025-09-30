# Fitur Countdown Lantik

Fitur countdown "Lantik" memungkinkan admin untuk membuat countdown timer dan mengontrol tampilan website secara keseluruhan.

## Fitur Utama

### 1. **Countdown Timer**
- Admin dapat membuat countdown dengan judul, deskripsi, dan waktu target
- Timer menampilkan sisa waktu dalam format: Hari, Jam, Menit, Detik
- Update real-time setiap detik

### 2. **Mode Tampilan**

#### Mode Normal
- Countdown muncul sebagai banner di atas website
- Semua konten website tetap dapat diakses
- Tampilan tidak mengganggu navigasi normal

#### Mode "Countdown Only"
- Seluruh website hanya menampilkan countdown fullscreen
- Semua konten lain disembunyikan
- Cocok untuk acara khusus seperti pelantikan

### 3. **Kontrol Admin**
- Aktifkan/nonaktifkan countdown
- Toggle mode "Countdown Only"
- Edit atau hapus countdown
- Akses melalui menu terpisah di `/admin/lantik`

## Setup Database

1. **Jalankan script setup:**
   ```bash
   # Windows
   scripts\setup-countdown-table.bat
   
   # Manual dengan psql
   psql "DATABASE_URL" -f "database\create_countdown_settings_table.sql"
   ```

2. **Struktur tabel `countdown_settings`:**
   ```sql
   CREATE TABLE countdown_settings (
       id SERIAL PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       description TEXT,
       target_time TIMESTAMP NOT NULL,
       is_active BOOLEAN DEFAULT FALSE NOT NULL,
       show_only_countdown BOOLEAN DEFAULT FALSE NOT NULL,
       created_at TIMESTAMP DEFAULT NOW() NOT NULL,
       updated_at TIMESTAMP DEFAULT NOW() NOT NULL
   );
   ```

## API Endpoints

### Admin Endpoints (Protected)

- **GET** `/api/admin/countdown` - Mendapatkan countdown aktif
- **POST** `/api/admin/countdown` - Membuat countdown baru
- **PUT** `/api/admin/countdown` - Update countdown
- **DELETE** `/api/admin/countdown?id={id}` - Hapus countdown

### Public Endpoints

- **GET** `/api/countdown/status` - Status countdown untuk semua user

## Cara Penggunaan

### 1. **Membuat Countdown**
1. Login sebagai admin
2. Akses menu "Lantik" di sidebar
3. Klik "Buat Countdown Baru"
4. Isi form:
   - **Judul**: Nama countdown (contoh: "Pelantikan IS 25")
   - **Deskripsi**: Penjelasan tambahan (opsional)
   - **Waktu Target**: Tanggal dan waktu target
   - **Countdown Only**: Centang untuk mode fullscreen

### 2. **Mengelola Countdown**
- **Aktifkan/Nonaktifkan**: Toggle status countdown
- **Mode Tampilan**: Switch antara normal dan "Countdown Only"
- **Hapus**: Nonaktifkan countdown secara permanen

### 3. **Tampilan untuk User**

#### Mode Normal:
- Banner countdown muncul di atas website
- Semua fitur website tetap dapat diakses
- Timer update real-time

#### Mode Countdown Only:
- Fullscreen countdown dengan design gradien
- Semua konten website disembunyikan
- Cocok untuk momen pelantikan atau acara penting

## Keamanan

- Hanya admin yang dapat mengakses fitur management
- API admin dilindungi dengan autentikasi
- Public API hanya memberikan data status countdown

## File Structure

```
src/
├── app/
│   ├── admin/lantik/page.tsx          # Halaman admin countdown
│   └── api/
│       ├── admin/countdown/route.ts    # API admin countdown
│       └── countdown/status/route.ts   # API public status
├── components/
│   ├── admin/CountdownManager.tsx      # Interface admin
│   └── ui/CountdownDisplay.tsx         # Tampilan countdown
├── hooks/
│   └── useCountdownStatus.ts           # Hook status countdown
└── lib/
    └── schema.ts                       # Database schema

database/
└── create_countdown_settings_table.sql # Setup database

scripts/
└── setup-countdown-table.bat          # Script setup Windows
```

## Tips Penggunaan

1. **Testing Countdown**: Buat countdown dengan waktu dekat untuk testing
2. **Mode Countdown Only**: Gunakan untuk momen penting seperti pelantikan
3. **Backup**: Pastikan ada backup sebelum mengaktifkan mode "Countdown Only"
4. **Monitoring**: Pantau countdown melalui admin panel

## Troubleshooting

### Database Issues
```bash
# Cek koneksi database
psql "DATABASE_URL" -c "SELECT NOW();"

# Cek tabel countdown
psql "DATABASE_URL" -c "SELECT * FROM countdown_settings;"
```

### API Issues
- Pastikan environment variable `DATABASE_URL` sudah set
- Cek log browser/server untuk error details
- Verify admin authentication

### Display Issues
- Clear browser cache
- Cek network tab untuk API calls
- Verify countdown data di database