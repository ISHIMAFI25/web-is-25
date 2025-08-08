# Setup Database Days Table - Panduan Lengkap

## Status Saat Ini ✅

✅ **Aplikasi berhasil running** - http://localhost:3000  
✅ **API endpoints berfungsi** - /api/days dan /api/days/upcoming  
✅ **Homepage tidak error** - Syntax issues telah diperbaiki  
✅ **Admin panel ready** - Tab "Manajemen Day" tersedia  

## Yang Perlu Dilakukan

⚠️ **Database setup belum selesai** - Table `days` belum dibuat di Supabase

## Cara Setup Database

### Option 1: Manual Setup (Recommended)

1. **Buka Supabase Dashboard**
   - Masuk ke [supabase.com](https://supabase.com)
   - Login ke project Anda

2. **Buka SQL Editor**
   - Klik "SQL Editor" di sidebar kiri
   - Klik "New Query"

3. **Copy dan Paste SQL Script**
   - Buka file: `database/manual_setup_days.sql`
   - Copy semua content
   - Paste ke SQL Editor
   - Klik "Run" untuk execute

4. **Verifikasi Setup**
   - Klik "Table Editor" di sidebar
   - Pastikan table `days` sudah ada
   - Pastikan ada 5 sample data (Day 0-4)

### Option 2: Command Line (Jika Environment Variable Sudah Setup)

```bash
# Windows
.\scripts\deploy-days-table.bat

# Linux/Mac  
./scripts\deploy-days-table.sh
```

## File-File Database yang Dibuat

```
database/
├── create_days_table.sql           # Schema utama
├── insert_sample_days.sql          # Data sample
├── manual_setup_days.sql           # Setup lengkap untuk manual
└── check_table_structure.sql       # Untuk verifikasi
```

## Struktur Table Days

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `day_number` | INTEGER | Nomor day (0,1,2,3...) - unique |
| `title` | TEXT | Judul day |
| `description` | TEXT | Deskripsi lengkap |
| `date_time` | TIMESTAMPTZ | Tanggal dan waktu |
| `location` | TEXT | Lokasi berkumpul |
| `specifications` | TEXT | Spesifikasi (optional) |
| `attachment_files` | JSONB | Array file lampiran |
| `is_visible` | BOOLEAN | Kontrol visibilitas peserta |
| `created_at` | TIMESTAMPTZ | Timestamp pembuatan |
| `updated_at` | TIMESTAMPTZ | Timestamp update |

## Sample Data yang Akan Dibuat

1. **Day 0** - Orientation Day (Past, Visible)
2. **Day 1** - Fundamental Programming (Past, Visible)  
3. **Day 2** - Web Development Basics (Future, Visible)
4. **Day 3** - Database & Backend (Future, Visible)
5. **Day 4** - Final Project (Future, Hidden)

## Setelah Database Setup

### Test Functionality

1. **Homepage**
   - Buka http://localhost:3000
   - Day terdekat (Day 2) harus muncul di homepage
   - Tombol absen harus ada

2. **Sidebar**
   - Klik menu hamburger di kiri atas
   - Section "Informasi Day" harus menampilkan list days
   - Day yang upcoming harus ada indicator "Akan datang"

3. **Admin Panel**
   - Login sebagai admin
   - Masuk ke /admin
   - Klik tab "Manajemen Day"
   - Harus bisa melihat dan mengedit 5 days

### Test User Experience

1. **User biasa hanya melihat visible days** (Day 0-3)
2. **Admin melihat semua days** termasuk yang hidden (Day 4)
3. **File attachment** bisa di-upload dan download
4. **Visibility toggle** berfungsi untuk admin

## Troubleshooting

### Error: "Could not find table 'public.days'"
**Solusi**: Table belum dibuat, jalankan manual setup

### Days tidak muncul di homepage
**Solusi**: 
- Pastikan ada day dengan `is_visible = true`
- Pastikan `date_time` di masa depan untuk upcoming day

### Admin tidak bisa akses day management
**Solusi**: 
- Pastikan user login sebagai admin
- Check RLS policies di Supabase

### File upload tidak berfungsi
**Solusi**: 
- Pastikan upload service (UploadThing) sudah dikonfigurasi
- Check API keys dan permissions

## Next Steps Setelah Setup

1. ✅ **Setup database** (manual_setup_days.sql)
2. ✅ **Test aplikasi** (homepage + admin panel)
3. ✅ **Upload files** (test file attachments)
4. ✅ **Test visibility** (toggle day visibility)
5. ✅ **Create new days** (buat day baru via admin)

## Environment Variables Required

Pastikan file `.env.local` berisi:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

## Support

Jika masih ada masalah:
1. Check browser console untuk error JavaScript
2. Check Network tab untuk API responses
3. Verify RLS policies di Supabase
4. Pastikan authentication berfungsi dengan baik

---

**Status**: ✅ Ready for database setup  
**Next Action**: Execute `database/manual_setup_days.sql` di Supabase SQL Editor
